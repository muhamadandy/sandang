import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types";
import { formatRupiah } from "@/lib/format";

const ProductCard = ({ product }: { product: Product }) => {
  const outOfStock = product.stock === 0;

  return (
    <Card className="overflow-hidden p-0">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square bg-muted"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background">
            Stok habis
          </span>
        )}
      </Link>

      <CardContent className="space-y-2 p-4">
        <p className="text-xs text-muted-foreground">{product.brand}</p>

        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-base font-semibold hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-accent text-accent" />
            <span>{product.rating}</span>
            <span className="text-muted-foreground">
              ({product.numReviews})
            </span>
          </div>

          {outOfStock ? (
            <span className="text-sm font-medium text-destructive">
              Stok habis
            </span>
          ) : (
            <span className="font-semibold text-primary">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
