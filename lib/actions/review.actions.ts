"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewFormSchema } from "@/lib/validator";
import type { ReviewFormValues } from "@/types";

const REVIEWS_PER_PAGE = 5;

type ActionResult = {
  success: boolean;
  message: string;
};

export type ReviewItem = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  userName: string;
  isMine: boolean;
};

export type ReviewList = {
  reviews: ReviewItem[];
  total: number;
  page: number;
  totalPages: number;
};

export type ReviewSummary = {
  average: number;
  count: number;
  // Jumlah ulasan per bintang: indeks 0 = bintang 1, ... indeks 4 = bintang 5
  distribution: number[];
};

export type ReviewEligibility =
  | { status: "guest" }
  | { status: "not-purchased" }
  | {
      status: "can-review";
      myReview: { rating: number; comment: string } | null;
    };

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id;
}

// Pembeli terverifikasi = punya pesanan LUNAS yang memuat produk ini
async function hasPurchased(userId: string, productId: string) {
  const item = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, isPaid: true } },
    select: { id: true },
  });
  return Boolean(item);
}

// Hitung ulang rating & jumlah ulasan produk dari tabel Review.
// Dipanggil di dalam transaksi supaya angka produk selalu cocok dengan ulasannya.
async function recalculateProductRating(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  productId: string,
) {
  const stats = await tx.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  await tx.product.update({
    where: { id: productId },
    data: {
      rating: Math.round((stats._avg.rating ?? 0) * 10) / 10,
      numReviews: stats._count._all,
    },
  });
}

// Daftar ulasan satu produk (terbaru dulu), dipecah per halaman
export async function getProductReviews(
  productId: string,
  page = 1,
): Promise<ReviewList> {
  const userId = await getUserId();

  const total = await prisma.review.count({ where: { productId } });
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);

  const rows = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * REVIEWS_PER_PAGE,
    take: REVIEWS_PER_PAGE,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true } },
    },
  });

  return {
    reviews: rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt,
      userName: row.user.name,
      isMine: row.userId === userId,
    })),
    total,
    page: currentPage,
    totalPages,
  };
}

// Rata-rata, jumlah, dan sebaran bintang untuk satu produk
export async function getReviewSummary(
  productId: string,
): Promise<ReviewSummary> {
  const groups = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { _all: true },
  });

  const distribution = [0, 0, 0, 0, 0];
  let count = 0;
  let sum = 0;

  for (const group of groups) {
    if (group.rating >= 1 && group.rating <= 5) {
      distribution[group.rating - 1] = group._count._all;
      count += group._count._all;
      sum += group.rating * group._count._all;
    }
  }

  return {
    average: count === 0 ? 0 : Math.round((sum / count) * 10) / 10,
    count,
    distribution,
  };
}

// Apakah pengguna yang sedang membuka halaman boleh mengulas produk ini?
export async function getReviewEligibility(
  productId: string,
): Promise<ReviewEligibility> {
  const userId = await getUserId();
  if (!userId) return { status: "guest" };

  const purchased = await hasPurchased(userId, productId);
  if (!purchased) return { status: "not-purchased" };

  const mine = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
    select: { rating: true, comment: true },
  });

  return { status: "can-review", myReview: mine };
}

// Buat ulasan baru, atau ubah ulasan milik sendiri bila sudah pernah mengulas
export async function saveReview(
  productId: string,
  values: ReviewFormValues,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, message: "Silakan masuk terlebih dahulu." };
    }

    const parsed = reviewFormSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data ulasan tidak valid.",
      };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });
    if (!product) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    if (!(await hasPurchased(userId, productId))) {
      return {
        success: false,
        message: "Hanya pembeli yang sudah membayar yang dapat mengulas.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.upsert({
        where: { productId_userId: { productId, userId } },
        create: {
          productId,
          userId,
          rating: parsed.data.rating,
          comment: parsed.data.comment,
        },
        update: {
          rating: parsed.data.rating,
          comment: parsed.data.comment,
        },
      });

      await recalculateProductRating(tx, productId);
    });

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: "Ulasan Anda tersimpan." };
  } catch (error) {
    console.error("saveReview gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

// Hapus ulasan milik sendiri (userId dari sesi, jadi tidak bisa menghapus ulasan orang lain)
export async function deleteMyReview(productId: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { success: false, message: "Silakan masuk terlebih dahulu." };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });
    if (!product) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    const removed = await prisma.$transaction(async (tx) => {
      const result = await tx.review.deleteMany({
        where: { productId, userId },
      });

      if (result.count > 0) {
        await recalculateProductRating(tx, productId);
      }

      return result.count;
    });

    if (removed === 0) {
      return { success: false, message: "Ulasan tidak ditemukan." };
    }

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: "Ulasan dihapus." };
  } catch (error) {
    console.error("deleteMyReview gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}
