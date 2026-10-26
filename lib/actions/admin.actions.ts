"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

const MONTHS_BACK = 6;
const TIME_ZONE = "Asia/Jakarta";

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
