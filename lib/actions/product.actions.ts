"use server";

import { prisma } from "@/lib/prisma";

export async function getLatestProducts(limit = 4) {
  return prisma.product.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
  });
}
