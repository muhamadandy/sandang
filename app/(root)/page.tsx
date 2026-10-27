import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import ProductList from "@/components/shared/product/product-list";
import FeaturedCarousel from "@/components/shared/featured-carousel";
import HowToOrder from "@/components/shared/how-to-order";
import { getLatestProducts } from "@/lib/actions/product.actions";
import { getFeaturedSlides } from "@/lib/actions/featured.actions";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const [latestProducts, slides] = await Promise.all([
    getLatestProducts(),
    getFeaturedSlides(),
  ]);

  return (
    <div>
      <FeaturedCarousel slides={slides} />

      <ProductList data={latestProducts} title="Produk Terbaru" />

      <div className="mt-8 flex justify-center">
        <Link
          href="/search"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Lihat Semua Produk
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <HowToOrder />
    </div>
  );
};

export default HomePage;
