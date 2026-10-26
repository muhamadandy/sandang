// Pilihan urutan
export const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "lowest", label: "Harga terendah" },
  { value: "highest", label: "Harga tertinggi" },
  { value: "rating", label: "Rating tertinggi" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// Rentang harga: batas bawah termasuk, batas atas tidak termasuk
export const PRICE_RANGES: {
  value: string;
  label: string;
  min: number;
  max?: number;
}[] = [
  { value: "0-100000", label: "Di bawah Rp100.000", min: 0, max: 100000 },
  {
    value: "100000-250000",
    label: "Rp100.000 – Rp250.000",
    min: 100000,
    max: 250000,
  },
  {
    value: "250000-500000",
    label: "Rp250.000 – Rp500.000",
    min: 250000,
    max: 500000,
  },
  { value: "500000-up", label: "Di atas Rp500.000", min: 500000 },
];

// Rating minimum
export const RATING_OPTIONS = [
  { value: 4, label: "4 ★ ke atas" },
  { value: 3, label: "3 ★ ke atas" },
] as const;

export type SearchFilters = {
  q: string;
  category: string;
  price: string; // "" = semua harga
  rating: number; // 0 = semua rating
  sort: SortValue;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

// Kalau parameter muncul berulang (?q=a&q=b), ambil yang pertama saja
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// Membaca parameter URL dan hanya menerima nilai yang diizinkan
export function parseSearchParams(raw: RawParams): SearchFilters {
  const q = (first(raw.q) ?? "").trim().slice(0, 100);
  const category = (first(raw.category) ?? "").trim().slice(0, 50);

  const price =
    PRICE_RANGES.find((range) => range.value === first(raw.price))?.value ?? "";

  const ratingNumber = Number.parseInt(first(raw.rating) ?? "", 10);
  const rating =
    RATING_OPTIONS.find((option) => option.value === ratingNumber)?.value ?? 0;

  const sort =
    SORT_OPTIONS.find((option) => option.value === first(raw.sort))?.value ??
    "newest";

  const page = Math.max(1, Number.parseInt(first(raw.page) ?? "1", 10) || 1);

  return { q, category, price, rating, sort, page };
}

// Menyusun URL dari filter yang aktif. Mengubah filter apa pun mengembalikan
// ke halaman 1, kecuali "page" diberikan di overrides.
export function buildSearchUrl(
  current: SearchFilters,
  overrides: Partial<SearchFilters> = {},
): string {
  const next = { ...current, page: 1, ...overrides };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.price) params.set("price", next.price);
  if (next.rating) params.set("rating", String(next.rating));
  if (next.sort !== "newest") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}
