import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/product-form";
import { buttonVariants } from "@/components/ui/button";
import {
  getAdminProductById,
  getProductFormOptions,
} from "@/lib/actions/admin-product.actions";

export const metadata: Metadata = { title: "Ubah Produk" };
export const dynamic = "force-dynamic";

// Hanya alamat lokal ("/...") atau URL penuh yang bisa ditampilkan next/image
const isUsableImage = (src: string) =>
  src.startsWith("/") || /^https?:\/\//.test(src);

const EditProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const [product, { categories, brands }] = await Promise.all([
    getAdminProductById(id),
    getProductFormOptions(),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/products"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft className="size-4" />
        Semua produk
      </Link>

      <h1 className="h2-bold">Ubah Produk</h1>

      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        brands={brands}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          category: product.category,
          brand: product.brand,
          description: product.description,
          images: product.images.filter(isUsableImage),
          price: product.price,
          stock: product.stock,
          isFeatured: product.isFeatured,
          banner:
            product.banner && isUsableImage(product.banner)
              ? product.banner
              : null,
        }}
      />
    </div>
  );
};

export default EditProductPage;
