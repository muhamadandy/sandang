import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AddToCart from "@/components/shared/product/add-to-cart";
import ProductImages from "@/components/shared/product/product-images";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Produk Tidak Ditemukan" };

  return {
    title: product.name,
    description: product.description,
  };
}

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cart = await getMyCart();
  const outOfStock = product.stock === 0;

  return (
    <section className="wrapper">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductImages images={product.images} name={product.name} />

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {product.brand} &middot; {product.category}
            </p>
            <h1 className="h1-bold">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <Star className="size-4 fill-accent text-accent" />
              <span>{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.numReviews} ulasan)
              </span>
            </div>
          </div>

          <p className="text-3xl font-bold text-primary">
            {formatCurrency(product.price)}
          </p>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {outOfStock ? (
                  <Badge variant="destructive">Stok habis</Badge>
                ) : (
                  <Badge variant="secondary">Tersedia ({product.stock})</Badge>
                )}
              </div>
              {!outOfStock && (
                <AddToCart
                  cart={cart}
                  item={{
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    image: product.images[0],
                    price: product.price,
                    qty: 1,
                  }}
                />
              )}
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-2 text-lg font-semibold">Deskripsi</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
