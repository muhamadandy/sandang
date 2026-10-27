import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/product-form";
import { buttonVariants } from "@/components/ui/button";
import { getProductFormOptions } from "@/lib/actions/admin-product.actions";

export const metadata: Metadata = { title: "Tambah Produk" };
export const dynamic = "force-dynamic";

const NewProductPage = async () => {
  const { categories, brands } = await getProductFormOptions();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/products"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft className="size-4" />
        Semua produk
      </Link>

      <h1 className="h2-bold">Tambah Produk</h1>

      <ProductForm
        mode="create"
        categories={categories}
        brands={brands}
        defaultValues={{
          name: "",
          slug: "",
          category: "",
          brand: "",
          description: "",
          images: [],
          price: 0,
          stock: 0,
          isFeatured: false,
          banner: null,
        }}
      />
    </div>
  );
};

export default NewProductPage;
