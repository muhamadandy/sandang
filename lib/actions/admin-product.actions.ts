"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  LOW_STOCK_THRESHOLD,
  MAX_FEATURED_PRODUCTS,
  type AdminProductFilters,
  type StockFilter,
} from "@/lib/admin-products";
import { deleteUploadedFiles } from "@/lib/uploadthing-server";
import { productFormSchema } from "@/lib/validator";
import type { ProductFormValues } from "@/types";

const PRODUCTS_PAGE_SIZE = 10;

type ProductActionResult = {
  success: boolean;
  message: string;
  // Kolom formulir yang bermasalah, supaya pesannya tampil di kolom itu
  field?: "slug" | "isFeatured";
  id?: string;
};

// Syarat untuk setiap tab stok
function stockWhere(stock: StockFilter) {
  switch (stock) {
    case "low":
      return { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } };
    case "out":
      return { stock: 0 };
    default:
      return {};
  }
}

// Semua gambar sebuah produk (gambar biasa + banner) dalam satu daftar
function allImages(images: string[], banner: string | null) {
  return banner ? [...images, banner] : [...images];
}

// Daftar produk untuk admin, dengan filter stok, pencarian, dan paginasi
export async function getAdminProducts(filters: AdminProductFilters) {
  await requireAdmin();

  const page =
    Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
  const q = filters.q.trim().slice(0, 100);

  // Pencarian: nama, merek, kategori, atau slug
  const searchWhere = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { brand: { contains: q, mode: "insensitive" as const } },
          { category: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where = { ...stockWhere(filters.stock), ...searchWhere };

  const [products, total, all, low, out] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * PRODUCTS_PAGE_SIZE,
      take: PRODUCTS_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        brand: true,
        price: true,
        stock: true,
        isFeatured: true,
        images: true,
      },
    }),
    prisma.product.count({ where }),
    // Jumlah di setiap tab (tidak terpengaruh kolom pencarian)
    prisma.product.count(),
    prisma.product.count({ where: stockWhere("low") }),
    prisma.product.count({ where: stockWhere("out") }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / PRODUCTS_PAGE_SIZE),
    counts: { all, low, out },
  };
}

// Satu produk untuk halaman ubah
export async function getAdminProductById(productId: string) {
  await requireAdmin();

  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      brand: true,
      description: true,
      images: true,
      price: true,
      stock: true,
      isFeatured: true,
      banner: true,
    },
  });
}

// Saran isian untuk kolom kategori dan merek (dari produk yang sudah ada)
export async function getProductFormOptions() {
  await requireAdmin();

  const [categories, brands] = await Promise.all([
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    prisma.product.findMany({
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  return {
    categories: categories.map((row) => row.category),
    brands: brands.map((row) => row.brand),
  };
}

// Menambah produk baru. Rating dan jumlah ulasan dimulai dari 0.
export async function createProduct(
  values: ProductFormValues,
): Promise<ProductActionResult> {
  await requireAdmin();

  // Validasi ulang di server, formulir di browser bisa dilewati
  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Data produk tidak valid.",
    };
  }
  const data = parsed.data;

  try {
    const slugTaken = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (slugTaken) {
      return {
        success: false,
        message: "Slug sudah dipakai produk lain.",
        field: "slug",
      };
    }

    if (data.isFeatured) {
      const featuredCount = await prisma.product.count({
        where: { isFeatured: true },
      });
      if (featuredCount >= MAX_FEATURED_PRODUCTS) {
        return {
          success: false,
          message: `Maksimal ${MAX_FEATURED_PRODUCTS} produk unggulan. Hapus tanda unggulan dari produk lain dulu.`,
          field: "isFeatured",
        };
      }
    }

    const product = await prisma.product.create({
      data: { ...data, rating: 0, numReviews: 0 },
      select: { id: true },
    });

    revalidatePath("/admin/products");
    return { success: true, message: "Produk ditambahkan.", id: product.id };
  } catch (error) {
    console.error("createProduct gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

// Mengubah produk yang sudah ada. Rating dan jumlah ulasan tidak disentuh.
// Gambar yang dibuang dari produk ikut dihapus dari UploadThing.
export async function updateProduct(
  productId: string,
  values: ProductFormValues,
): Promise<ProductActionResult> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Data produk tidak valid.",
    };
  }
  const data = parsed.data;

  try {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, images: true, banner: true },
    });
    if (!existing) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    // Slug tidak boleh sama dengan produk LAIN (produk ini sendiri boleh)
    const slugTaken = await prisma.product.findFirst({
      where: { slug: data.slug, NOT: { id: productId } },
      select: { id: true },
    });
    if (slugTaken) {
      return {
        success: false,
        message: "Slug sudah dipakai produk lain.",
        field: "slug",
      };
    }

    if (data.isFeatured) {
      const otherFeatured = await prisma.product.count({
        where: { isFeatured: true, NOT: { id: productId } },
      });
      if (otherFeatured >= MAX_FEATURED_PRODUCTS) {
        return {
          success: false,
          message: `Maksimal ${MAX_FEATURED_PRODUCTS} produk unggulan. Hapus tanda unggulan dari produk lain dulu.`,
          field: "isFeatured",
        };
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data,
    });

    // Setelah penyimpanan berhasil: hapus file yang tidak lagi dipakai produk ini
    const stillUsed = new Set(allImages(data.images, data.banner));
    const removed = allImages(existing.images, existing.banner).filter(
      (url) => !stillUsed.has(url),
    );
    await deleteUploadedFiles(removed);

    revalidatePath("/admin/products");
    return { success: true, message: "Perubahan disimpan.", id: productId };
  } catch (error) {
    console.error("updateProduct gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

// Menghapus produk beserta file gambarnya di UploadThing (kecuali yang masih
// dipakai riwayat pesanan, lihat deleteUploadedFiles).
export async function deleteProduct(
  productId: string,
): Promise<{ success: boolean; message: string }> {
  await requireAdmin();

  try {
    if (typeof productId !== "string" || productId.length === 0) {
      return { success: false, message: "Produk tidak valid." };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true, banner: true },
    });
    if (!product) {
      return { success: false, message: "Produk tidak ditemukan." };
    }

    await prisma.product.delete({ where: { id: productId } });

    // Setelah produk terhapus dari database, bersihkan filenya
    await deleteUploadedFiles(allImages(product.images, product.banner));

    revalidatePath("/admin/products");
    return { success: true, message: "Produk dihapus." };
  } catch (error) {
    console.error("deleteProduct gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}
