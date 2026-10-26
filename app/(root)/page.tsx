import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <div>
      <ProductList data={latestProducts} title="Produk Terbaru" />
    </div>
  );
};

export default HomePage;
