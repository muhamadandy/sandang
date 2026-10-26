"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

type OrderListItem = {
  id: string;
  createdAt: Date;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  itemCount: number;
};

// Daftar pesanan milik pengguna yang sedang masuk, terbaru di atas
export async function getMyOrders(
  page = 1,
): Promise<{ orders: OrderListItem[]; totalPages: number }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { orders: [], totalPages: 0 };

  const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
  const where = { userId: session.user.id };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        createdAt: true,
        totalPrice: true,
        isPaid: true,
        isDelivered: true,
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      totalPrice: row.totalPrice,
      isPaid: row.isPaid,
      isDelivered: row.isDelivered,
      itemCount: row._count.orderItems,
    })),
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}
