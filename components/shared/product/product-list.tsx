import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import ProductCard from "./product-card";

const ProductList = ({
  data,
  title,
  limit,
  gridClassName,
}: {
  data: Product[];
  title?: string;
  limit?: number;
  // Mengganti jumlah kolom bila perlu, misalnya di halaman dengan panel filter
  gridClassName?: string;
}) => {
  const products = limit ? data.slice(0, limit) : data;

  return (
    <section className="my-10">
      {title && <h2 className="h2-bold mb-6">{title}</h2>}

      {products.length > 0 ? (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            gridClassName,
          )}
        >
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Produk tidak ditemukan.</p>
      )}
    </section>
  );
};

export default ProductList;
