"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cartItemSchema } from "@/lib/validator";
import type { Cart, CartItem } from "@/types";

type ActionResult = {
  success: boolean;
  message: string;
  requireSignIn?: boolean;
};

// Aturan harga (silakan ubah angkanya)
const FREE_SHIPPING_MIN = 500_000; // ongkir gratis jika belanja di atas Rp500.000
const SHIPPING_FEE = 20_000;
const TAX_RATE = 0.11; // PPN 11%

function calcPrices(items: CartItem[]) {
  const itemsPrice = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const shippingPrice =
    itemsPrice === 0 || itemsPrice > FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
}

// Kolom items bertipe Json di database, jadi dipastikan bentuknya lewat zod
function parseItems(value: unknown): CartItem[] {
  return z.array(cartItemSchema).parse(value);
}

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id;
}

export async function addItemToCart(data: CartItem): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return {
        success: false,
        message: "Silakan masuk untuk menambahkan ke keranjang.",
        requireSignIn: true,
      };
    }

    const parsed = cartItemSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: "Data produk tidak valid." };
    }

    // Nama, harga, dan gambar selalu diambil dari database, bukan dari klien
    const product = await prisma.product.findUnique({
      where: { id: parsed.data.productId },
    });
    if (!product) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    const item: CartItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      qty: parsed.data.qty,
    };

    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      if (product.stock < item.qty) {
        return { success: false, message: "Stok tidak mencukupi." };
      }

      const items = [item];
      await prisma.cart.create({
        data: { userId, items, ...calcPrices(items) },
      });
    } else {
      const items = parseItems(cart.items);
      const existItem = items.find((x) => x.productId === item.productId);

      if (existItem) {
        if (product.stock < existItem.qty + item.qty) {
          return { success: false, message: "Stok tidak mencukupi." };
        }
        existItem.qty += item.qty;
        existItem.price = product.price;
      } else {
        if (product.stock < item.qty) {
          return { success: false, message: "Stok tidak mencukupi." };
        }
        items.push(item);
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: { items, ...calcPrices(items) },
      });
    }

    // Segarkan semua halaman dan layout (termasuk jumlah barang di header)
    revalidatePath("/", "layout");

    return {
      success: true,
      message: `${product.name} ditambahkan ke keranjang.`,
    };
  } catch (error) {
    console.error("addItemToCart gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function removeItemFromCart(
  productId: string,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu.",
        requireSignIn: true,
      };
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { success: false, message: "Keranjang tidak ditemukan." };

    const items = parseItems(cart.items);
    const existItem = items.find((x) => x.productId === productId);
    if (!existItem) {
      return { success: false, message: "Barang tidak ada di keranjang." };
    }

    // Jumlah 1 dihapus dari keranjang, selain itu dikurangi satu
    const newItems =
      existItem.qty === 1
        ? items.filter((x) => x.productId !== productId)
        : items.map((x) =>
            x.productId === productId ? { ...x, qty: x.qty - 1 } : x,
          );

    await prisma.cart.update({
      where: { id: cart.id },
      data: { items: newItems, ...calcPrices(newItems) },
    });

    revalidatePath("/", "layout");

    return {
      success: true,
      message: `${existItem.name} dikurangi dari keranjang.`,
    };
  } catch (error) {
    console.error("removeItemFromCart gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function getMyCart(): Promise<Cart | undefined> {
  const userId = await getUserId();
  if (!userId) return undefined;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return undefined;

  return {
    items: parseItems(cart.items),
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
  };
}
