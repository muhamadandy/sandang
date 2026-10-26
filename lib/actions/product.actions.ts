"use server";

import { prisma } from "@/lib/prisma";
import { PRICE_RANGES, type SearchFilters, type SortValue } from "@/lib/search";
import type { Product } from "@/types";

const SEARCH_PAGE_SIZE = 2;

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

// Urutan hasil. "id" ditambahkan agar urutan stabil antar halaman.
function getOrderBy(sort: SortValue) {
  switch (sort) {
    case "lowest":
      return [{ price: "asc" as const }, { id: "asc" as const }];
    case "highest":
      return [{ price: "desc" as const }, { id: "asc" as const }];
    case "rating":
      return [{ rating: "desc" as const }, { id: "asc" as const }];
    default:
      return [{ createdAt: "desc" as const }, { id: "asc" as const }];
  }
}

// Pencarian dan penyaringan produk. Kata kunci boleh kosong (menjelajah semua produk).
export async function searchProducts(filters: SearchFilters): Promise<{
  products: Product[];
  total: number;
  totalPages: number;
}> {
  const terms = filters.q.split(/\s+/).filter(Boolean).slice(0, 5);
  const priceRange = PRICE_RANGES.find(
    (range) => range.value === filters.price,
  );
  const page =
    Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;

  const where = {
    AND: [
      // Setiap kata kunci harus cocok di nama, kategori, atau merek
      ...terms.map((term) => ({
        OR: [
          { name: { contains: term, mode: "insensitive" as const } },
          { category: { contains: term, mode: "insensitive" as const } },
          { brand: { contains: term, mode: "insensitive" as const } },
        ],
      })),
      ...(filters.category
        ? [
            {
              category: {
                equals: filters.category,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
      ...(priceRange
        ? [
            {
              price: {
                gte: priceRange.min,
                ...(priceRange.max !== undefined ? { lt: priceRange.max } : {}),
              },
            },
          ]
        : []),
      ...(filters.rating > 0 ? [{ rating: { gte: filters.rating } }] : []),
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: getOrderBy(filters.sort),
      skip: (page - 1) * SEARCH_PAGE_SIZE,
      take: SEARCH_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / SEARCH_PAGE_SIZE),
  };
}

// Daftar kategori beserta jumlah produknya, untuk filter
export async function getProductCategories(): Promise<
  { category: string; count: number }[]
> {
  const groups = await prisma.product.groupBy({
    by: ["category"],
    _count: { _all: true },
    orderBy: { category: "asc" },
  });

  return groups.map((group) => ({
    category: group.category,
    count: group._count._all,
  }));
}
