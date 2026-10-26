import type { Metadata } from "next";
import Link from "next/link";
import ProductList from "@/components/shared/product/product-list";
import MobileFilters from "@/components/shared/search/mobile-filters";
import SearchFilters from "@/components/shared/search/search-filters";
import SearchForm from "@/components/shared/search-form";
import { buttonVariants } from "@/components/ui/button";
import {
  getProductCategories,
  searchProducts,
} from "@/lib/actions/product.actions";
import { buildSearchUrl, parseSearchParams, SORT_OPTIONS } from "@/lib/search";

export const metadata: Metadata = { title: "Pencarian" };
export const dynamic = "force-dynamic";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const filters = parseSearchParams(await searchParams);

  const [{ products, total, totalPages }, categories] = await Promise.all([
    searchProducts(filters),
    getProductCategories(),
  ]);

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.price ? 1 : 0) +
    (filters.rating ? 1 : 0);

  const heading = filters.q
    ? `Hasil untuk “${filters.q}”`
    : filters.category || "Semua Produk";

  return (
    <div className="space-y-6">
      {/* Di desktop, kolom pencarian sudah ada di header */}
      <SearchForm
        key={filters.q}
        defaultValue={filters.q}
        className="md:hidden"
      />

      <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
        {/* Filter di desktop */}
        <aside className="hidden md:block">
          <SearchFilters filters={filters} categories={categories} />
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {total} produk ditemukan
            </p>

            {/* Filter di HP */}
            <div className="md:hidden">
              <MobileFilters activeCount={activeCount}>
                <SearchFilters filters={filters} categories={categories} />
              </MobileFilters>
            </div>
          </div>

          {/* Urutan */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Urutkan:</span>
            {SORT_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={buildSearchUrl(filters, { sort: option.value })}
                aria-current={
                  filters.sort === option.value ? "true" : undefined
                }
                className={buttonVariants({
                  variant:
                    filters.sort === option.value ? "default" : "outline",
                  size: "sm",
                })}
              >
                {option.label}
              </Link>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="space-y-4 py-16 text-center">
              <h1 className="h2-bold">Tidak ada hasil</h1>
              <p className="text-muted-foreground">
                Tidak ada produk yang cocok. Coba kata kunci lain atau kurangi
                filter.
              </p>
              <Link
                href={buildSearchUrl(filters, {
                  category: "",
                  price: "",
                  rating: 0,
                })}
                className={buttonVariants()}
              >
                Hapus filter
              </Link>
            </div>
          ) : (
            <>
              <ProductList
                data={products}
                title={heading}
                gridClassName="xl:grid-cols-3"
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  {filters.page > 1 ? (
                    <Link
                      href={buildSearchUrl(filters, { page: filters.page - 1 })}
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
                      href={buildSearchUrl(filters, { page: filters.page + 1 })}
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
      </div>
    </div>
  );
};

export default SearchPage;
