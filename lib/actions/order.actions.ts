"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMyCartSynced } from "@/lib/actions/cart.actions";
import { getMyAddress, getMyPaymentMethod } from "@/lib/actions/user.actions";
import { unavailableMessage } from "@/lib/cart-notice";
import { paymentMethodSchema, shippingAddressSchema } from "@/lib/validator";

// Alamat API Snap versi Sandbox (uji coba)
const MIDTRANS_SNAP_URL =
  "https://app.sandbox.midtrans.com/snap/v1/transactions";

type CreateOrderResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

export async function createOrder(): Promise<CreateOrderResult> {
  try {
    // userId selalu dari sesi server, bukan dari browser
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu.",
        redirectTo: "/sign-in",
      };
    }
    const userId = session.user.id;

    // Keluarkan dulu barang yang produknya sudah dihapus admin
    const { cart, removed } = await getMyCartSynced();
    if (removed.length > 0) {
      revalidatePath("/", "layout");
      return {
        success: false,
        message: unavailableMessage(removed),
        redirectTo: "/cart",
      };
    }

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Keranjang Anda kosong.",
        redirectTo: "/cart",
      };
    }

    const address = await getMyAddress();
    if (!address) {
      return {
        success: false,
        message: "Alamat pengiriman belum diisi.",
        redirectTo: "/shipping-address",
      };
    }

    const method = paymentMethodSchema.safeParse({
      type: await getMyPaymentMethod(),
    });
    if (!method.success) {
      return {
        success: false,
        message: "Metode pembayaran belum dipilih.",
        redirectTo: "/payment-method",
      };
    }

    // Cek stok semua barang sebelum pesanan dibuat
    const products = await prisma.product.findMany({
      where: { id: { in: cart.items.map((item) => item.productId) } },
      select: { id: true, name: true, stock: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of cart.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return {
          success: false,
          message: `Produk "${item.name}" sudah tidak tersedia.`,
          redirectTo: "/cart",
        };
      }
      if (product.stock < item.qty) {
        return {
          success: false,
          message: `Stok "${product.name}" tidak mencukupi (sisa ${product.stock}).`,
          redirectTo: "/cart",
        };
      }
    }

    // Buat pesanan dan kosongkan keranjang dalam satu transaksi
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId,
          shippingAddress: address,
          paymentMethod: method.data.type,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
          orderItems: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              slug: item.slug,
              image: item.image,
              price: item.price,
              qty: item.qty,
            })),
          },
        },
        select: { id: true },
      }),
      prisma.cart.update({
        where: { userId },
        data: {
          items: [],
          itemsPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 0,
        },
      }),
    ]);

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Pesanan berhasil dibuat.",
      redirectTo: `/order/${order.id}`,
    };
  } catch (error) {
    console.error("createOrder gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

// Mengambil satu pesanan milik pengguna yang sedang masuk.
// Pesanan milik orang lain dianggap tidak ada (mencegah IDOR).
export async function getOrderById(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { orderItems: true },
  });
  if (!order) return null;

  // Kolom shippingAddress bertipe Json, jadi bentuknya dipastikan lewat zod
  const address = shippingAddressSchema.safeParse(order.shippingAddress);
  if (!address.success) return null;

  return { ...order, shippingAddress: address.data };
}

type SnapTokenResult = {
  success: boolean;
  message: string;
  token?: string;
};

// Meminta token pembayaran ke Midtrans untuk satu pesanan.
// Setiap upaya pembayaran memakai nomor transaksi sendiri: "<id-pesanan>-<upaya>".
export async function createSnapToken(
  orderId: string,
): Promise<SnapTokenResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, message: "Silakan masuk terlebih dahulu." };
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return { success: false, message: "Pesanan tidak ditemukan." };
    }
    if (order.isPaid) {
      return { success: false, message: "Pesanan ini sudah dibayar." };
    }

    // Upaya yang masih berjalan dipakai ulang (webhook mengosongkan token
    // saat upaya itu kedaluwarsa, dibatalkan, atau gagal)
    if (order.snapToken) {
      return { success: true, message: "OK", token: order.snapToken };
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY belum diisi di .env");
      return { success: false, message: "Pembayaran belum dikonfigurasi." };
    }

    // Ambil nomor upaya berikutnya secara atomik. Kalau dua permintaan datang
    // bersamaan (klik ganda), hanya satu yang berhasil memegang nomor ini.
    const nextAttempt = order.paymentAttempt + 1;
    const claimed = await prisma.order.updateMany({
      where: {
        id: order.id,
        isPaid: false,
        snapToken: null,
        paymentAttempt: order.paymentAttempt,
      },
      data: { paymentAttempt: nextAttempt },
    });

    if (claimed.count === 0) {
      return {
        success: false,
        message: "Pembayaran sedang disiapkan. Coba lagi sebentar.",
      };
    }

    // Jumlah semua item_details harus sama dengan gross_amount,
    // jadi ongkir dan PPN dimasukkan sebagai item tersendiri.
    const itemDetails = order.orderItems.map((item) => ({
      id: item.productId,
      price: item.price,
      quantity: item.qty,
      name: item.name.slice(0, 50),
    }));
    if (order.shippingPrice > 0) {
      itemDetails.push({
        id: "ONGKIR",
        price: order.shippingPrice,
        quantity: 1,
        name: "Ongkos kirim",
      });
    }
    if (order.taxPrice > 0) {
      itemDetails.push({
        id: "PPN",
        price: order.taxPrice,
        quantity: 1,
        name: "PPN 11%",
      });
    }

    const address = order.shippingAddress;

    const res = await fetch(MIDTRANS_SNAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: `${order.id}-${nextAttempt}`,
          gross_amount: order.totalPrice,
        },
        item_details: itemDetails,
        customer_details: {
          first_name: session.user.name,
          email: session.user.email,
          phone: address.phone,
          shipping_address: {
            first_name: address.fullName,
            phone: address.phone,
            address: address.streetAddress,
            city: address.city,
            postal_code: address.postalCode,
            country_code: "IDN",
          },
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      console.error("Midtrans menolak permintaan:", res.status, data);
      return {
        success: false,
        message: "Gagal menyiapkan pembayaran. Coba lagi.",
      };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { snapToken: data.token },
    });

    return { success: true, message: "OK", token: data.token };
  } catch (error) {
    console.error("createSnapToken gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}
