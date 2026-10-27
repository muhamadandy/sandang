import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminProducts } from "@/lib/actions/admin-product.actions";
import {
  buildAdminProductsUrl,
  LOW_STOCK_THRESHOLD,
  parseAdminProductParams,
  PRODUCT_STOCK_TABS,
} from "@/lib/admin-products";
import { formatRupiah } from "@/lib/format";
import DeleteButton from "./delete-button";

export const metadata: Metadata = { title: "Produk" };
export const dynamic = "force-dynamic";

const AdminProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const filters = parseAdminProductParams(await searchParams);
  const { products, total, totalPages, counts } =
    await getAdminProducts(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="h2-bold">Produk</h1>
          <p className="text-sm text-muted-foreground">
            {total} produk ditemukan
          </p>
        </div>

        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus className="size-4" />
          Tambah produk
        </Link>
      </div>

      {/* Tab stok */}
      <div className="flex flex-wrap gap-2">
        {PRODUCT_STOCK_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildAdminProductsUrl(filters, { stock: tab.value })}
            aria-current={filters.stock === tab.value ? "true" : undefined}
            className={buttonVariants({
              variant: filters.stock === tab.value ? "default" : "outline",
              size: "sm",
            })}
          >
            {tab.label} ({counts[tab.value]})
          </Link>
        ))}
      </div>

      {/* Pencarian. Formulir biasa, tab stok yang sedang dipilih ikut terkirim. */}
      <form
        action="/admin/products"
        role="search"
        className="relative max-w-sm"
      >
        {filters.stock !== "all" && (
          <input type="hidden" name="stock" value={filters.stock} />
        )}
        <Input
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Cari nama, merek, atau kategori…"
          aria-label="Cari produk"
          maxLength={100}
          className="pr-10 [&::-webkit-search-cancel-button]:appearance-none"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Cari"
          className="absolute inset-y-0 right-0.5 my-auto size-8"
        >
          <Search className="size-4" />
        </Button>
      </form>

      {products.length === 0 ? (
        <div className="space-y-4 rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Tidak ada produk yang cocok.</p>
          <Link
            href="/admin/products"
            className={buttonVariants({ variant: "outline" })}
          >
            Tampilkan semua
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="size-14 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="size-14 shrink-0 rounded-md bg-muted"
                    />
                  )}

                  <div className="min-w-0 space-y-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="line-clamp-1 text-sm font-semibold hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.category} · {product.brand}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {product.isFeatured && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Unggulan
                        </span>
                      )}
                      {product.stock === 0 ? (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Habis
                        </span>
                      ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                        <span className="rounded-full bg-accent/30 px-2 py-0.5 text-xs font-medium text-foreground">
                          Stok menipis: {product.stock}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Stok {product.stock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <span className="min-w-28 text-sm font-semibold md:text-right">
                    {formatRupiah(product.price)}
                  </span>

                  <Link
                    href={`/admin/products/${product.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Ubah
                  </Link>
                  <DeleteButton
                    productId={product.id}
                    productName={product.name}
                  />
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              {filters.page > 1 ? (
                <Link
                  href={buildAdminProductsUrl(filters, {
                    page: filters.page - 1,
                  })}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sebelumnya
                </Link>
              ) : (
                <span />
              )}

              <span className="text-sm text-muted-foreground">
                Halaman {filters.page} dari {totalPages}
              </span>

              {filters.page < totalPages ? (
                <Link
                  href={buildAdminProductsUrl(filters, {
                    page: filters.page + 1,
                  })}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Berikutnya
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProductsPage;
