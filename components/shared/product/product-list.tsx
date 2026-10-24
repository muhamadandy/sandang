import type { Product } from "@/types";
import ProductCard from "./product-card";

const ProductList = ({
  data,
  title,
  limit,
}: {
  data: Product[];
  title?: string;
  limit?: number;
}) => {
  const products = limit ? data.slice(0, limit) : data;

  return (
    <section className="my-10">
      {title && <h2 className="h2-bold mb-6">{title}</h2>}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
