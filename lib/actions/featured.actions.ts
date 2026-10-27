"use server";

import { prisma } from "@/lib/prisma";
import { MAX_FEATURED_PRODUCTS } from "@/lib/admin-products";

export type FeaturedSlide = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  image: string;
};

// Banner hanya dipakai bila berupa URL penuh atau path yang diawali "/"
// (nilai seperti "banner-1.jpg" dianggap tidak valid)
function isValidImage(src: string | null | undefined): src is string {
  return (
    !!src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/"))
  );
}

export async function getFeaturedSlides(): Promise<FeaturedSlide[]> {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: MAX_FEATURED_PRODUCTS,
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      price: true,
      banner: true,
      images: true,
    },
  });

  const slides: FeaturedSlide[] = [];

  for (const product of products) {
    // Utamakan banner, kalau tidak valid pakai gambar pertama produk
    const image = isValidImage(product.banner)
      ? product.banner
      : product.images.find((img) => isValidImage(img));

    // Produk tanpa gambar valid dilewati agar tidak ada slide rusak
    if (!image) continue;

    slides.push({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      price: product.price,
      image,
    });
  }

  return slides;
}
