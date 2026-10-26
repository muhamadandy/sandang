"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { shippingAddressSchema } from "@/lib/validator";
import type { AdminOrderFilters, OrderStatus } from "@/lib/admin-orders";

const MONTHS_BACK = 6;
const TIME_ZONE = "Asia/Jakarta";
const ORDERS_PAGE_SIZE = 10;

function getYearMonth(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
  };
}

function monthKey(date: Date) {
  const { year, month } = getYearMonth(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export async function getOverviewData() {
  await requireAdmin();

  // Enam bulan terakhir (termasuk bulan ini), bulan tanpa penjualan tetap tampil bernilai 0
  const base = getYearMonth(new Date());
  const buckets = Array.from({ length: MONTHS_BACK }, (_, index) => {
    const offset = MONTHS_BACK - 1 - index;
    // Jam 12 siang UTC agar bulan tidak bergeser karena selisih zona waktu
    const date = new Date(Date.UTC(base.year, base.month - 1 - offset, 1, 12));

    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat("id-ID", {
        month: "short",
        year: "2-digit",
        timeZone: TIME_ZONE,
      }).format(date),
      total: 0,
    };
  });
  const earliest = new Date(
    Date.UTC(base.year, base.month - 1 - (MONTHS_BACK - 1), 1) -
      24 * 60 * 60 * 1000,
  );

  const [
    paidSummary,
    totalOrders,
    customers,
    products,
    latestOrders,
    paidOrdersRecent,
    paidItems,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { isPaid: true },
      _sum: { totalPrice: true },
      _count: { _all: true },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "user" } }),
    prisma.product.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        totalPrice: true,
        isPaid: true,
        user: { select: { name: true } },
      },
    }),
    prisma.order.findMany({
      where: { isPaid: true, paidAt: { gte: earliest } },
      select: { paidAt: true, totalPrice: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { isPaid: true } },
      select: { productId: true, price: true, qty: true },
    }),
  ]);

  // Pendapatan per bulan
  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const order of paidOrdersRecent) {
    if (!order.paidAt) continue;
    const bucket = bucketMap.get(monthKey(order.paidAt));
    if (bucket) bucket.total += order.totalPrice;
  }

  // Penjualan per kategori (OrderItem tidak menyimpan kategori, jadi dicari dari produk)
  const productIds = [...new Set(paidItems.map((item) => item.productId))];
  const categoryRows = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, category: true },
  });
  const categoryById = new Map(
    categoryRows.map((row) => [row.id, row.category]),
  );

  const salesByCategory = new Map<string, number>();
  for (const item of paidItems) {
    const category = categoryById.get(item.productId) ?? "Lainnya";
    salesByCategory.set(
      category,
      (salesByCategory.get(category) ?? 0) + item.price * item.qty,
    );
  }

  return {
    totalRevenue: paidSummary._sum.totalPrice ?? 0,
    paidOrders: paidSummary._count._all,
    totalOrders,
    customers,
    products,
    monthlyRevenue: buckets.map(({ label, total }) => ({ label, total })),
    categorySales: [...salesByCategory]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
    latestOrders,
  };
}

// Syarat untuk setiap tab status
function statusWhere(status: OrderStatus) {
  switch (status) {
    case "unpaid":
      return { isPaid: false };
    case "toship":
      return { isPaid: true, isDelivered: false };
    case "delivered":
      return { isDelivered: true };
    default:
      return {};
  }
}

// Daftar semua pesanan untuk admin, dengan filter status, pencarian, dan paginasi
export async function getAdminOrders(filters: AdminOrderFilters) {
  await requireAdmin();

  const page =
    Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
  const q = filters.q.trim().slice(0, 100);

  // Pencarian: nama atau email pelanggan, atau awal nomor pesanan (boleh diawali "#")
  const searchWhere = q
    ? {
        OR: [
          { user: { name: { contains: q, mode: "insensitive" as const } } },
          { user: { email: { contains: q, mode: "insensitive" as const } } },
          { id: { startsWith: q.replace(/^#/, "").toLowerCase() } },
        ],
      }
    : {};

  const where = { ...statusWhere(filters.status), ...searchWhere };

  const [rows, total, all, unpaid, toship, delivered] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
      select: {
        id: true,
        createdAt: true,
        totalPrice: true,
        isPaid: true,
        isDelivered: true,
        user: { select: { name: true, email: true } },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.order.count({ where }),
    // Jumlah di setiap tab (tidak terpengaruh kolom pencarian)
    prisma.order.count(),
    prisma.order.count({ where: statusWhere("unpaid") }),
    prisma.order.count({ where: statusWhere("toship") }),
    prisma.order.count({ where: statusWhere("delivered") }),
  ]);

  return {
    orders: rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      totalPrice: row.totalPrice,
      isPaid: row.isPaid,
      isDelivered: row.isDelivered,
      customerName: row.user.name,
      customerEmail: row.user.email,
      itemCount: row._count.orderItems,
    })),
    total,
    totalPages: Math.ceil(total / ORDERS_PAGE_SIZE),
    counts: { all, unpaid, toship, delivered },
  };
}

// Satu pesanan lengkap untuk halaman detail admin (pesanan siapa pun)
export async function getAdminOrderById(orderId: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!order) return null;

  // Kolom shippingAddress bertipe Json, jadi bentuknya dipastikan lewat zod
  const address = shippingAddressSchema.safeParse(order.shippingAddress);
  if (!address.success) return null;

  return { ...order, shippingAddress: address.data };
}

// Menandai pesanan sudah dikirim. Hanya pesanan lunas yang belum dikirim yang bisa diubah.
export async function markOrderDelivered(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  await requireAdmin();

  try {
    if (typeof orderId !== "string" || orderId.length === 0) {
      return { success: false, message: "Pesanan tidak valid." };
    }

    const result = await prisma.order.updateMany({
      where: { id: orderId, isPaid: true, isDelivered: false },
      data: { isDelivered: true, deliveredAt: new Date() },
    });

    if (result.count === 0) {
      return {
        success: false,
        message: "Pesanan belum lunas atau sudah ditandai terkirim.",
      };
    }

    revalidatePath("/admin/orders");
    return { success: true, message: "Pesanan ditandai terkirim." };
  } catch (error) {
    console.error("markOrderDelivered gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}
