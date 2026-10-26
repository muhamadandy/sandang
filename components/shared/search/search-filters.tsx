import Link from "next/link";
import {
  buildSearchUrl,
  PRICE_RANGES,
  RATING_OPTIONS,
  type SearchFilters as Filters,
} from "@/lib/search";
import { cn } from "@/lib/utils";

type SearchFiltersProps = {
  filters: Filters;
  categories: { category: string; count: number }[];
};

const FilterLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    aria-current={active ? "true" : undefined}
    className={cn(
      "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
      active && "bg-primary/10 font-semibold text-primary",
    )}
  >
    {children}
  </Link>
);

const SearchFilters = ({ filters, categories }: SearchFiltersProps) => {
  const hasActiveFilter =
    Boolean(filters.category) || Boolean(filters.price) || filters.rating > 0;

  return (
    <div className="space-y-6">
      {hasActiveFilter && (
        <Link
          href={buildSearchUrl(filters, { category: "", price: "", rating: 0 })}
          className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Hapus semua filter
        </Link>
      )}

      {/* Kategori */}
      <section>
        <h3 className="mb-2 text-sm font-semibold">Kategori</h3>
        <ul className="space-y-1">
          <li>
            <FilterLink
              href={buildSearchUrl(filters, { category: "" })}
              active={!filters.category}
            >
              Semua
            </FilterLink>
          </li>
          {categories.map((item) => (
            <li key={item.category}>
              <FilterLink
                href={buildSearchUrl(filters, { category: item.category })}
                active={
                  filters.category.toLowerCase() === item.category.toLowerCase()
                }
              >
                <span className="truncate">{item.category}</span>
                <span className="text-xs text-muted-foreground">
                  {item.count}
                </span>
              </FilterLink>
            </li>
          ))}
        </ul>
      </section>

      {/* Harga */}
      <section>
        <h3 className="mb-2 text-sm font-semibold">Harga</h3>
        <ul className="space-y-1">
          <li>
            <FilterLink
              href={buildSearchUrl(filters, { price: "" })}
              active={!filters.price}
            >
              Semua harga
            </FilterLink>
          </li>
          {PRICE_RANGES.map((range) => (
            <li key={range.value}>
              <FilterLink
                href={buildSearchUrl(filters, { price: range.value })}
                active={filters.price === range.value}
              >
                {range.label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </section>

      {/* Rating */}
      <section>
        <h3 className="mb-2 text-sm font-semibold">Rating</h3>
        <ul className="space-y-1">
          <li>
            <FilterLink
              href={buildSearchUrl(filters, { rating: 0 })}
              active={filters.rating === 0}
            >
              Semua rating
            </FilterLink>
          </li>
          {RATING_OPTIONS.map((option) => (
            <li key={option.value}>
              <FilterLink
                href={buildSearchUrl(filters, { rating: option.value })}
                active={filters.rating === option.value}
              >
                {option.label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default SearchFilters;
