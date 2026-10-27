// Produk dengan stok di bawah atau sama dengan angka ini dianggap menipis
export const LOW_STOCK_THRESHOLD = 5;

// Batas jumlah produk unggulan (tampil di carousel beranda)
export const MAX_FEATURED_PRODUCTS = 5;

export const PRODUCT_STOCK_TABS = [
  { value: "all", label: "Semua" },
  { value: "low", label: "Stok menipis" },
  { value: "out", label: "Habis" },
] as const;

export type StockFilter = (typeof PRODUCT_STOCK_TABS)[number]["value"];

export type AdminProductFilters = {
  stock: StockFilter;
  q: string;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

// Kalau parameter muncul berulang (?q=a&q=b), ambil yang pertama saja
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// Membaca parameter URL dan hanya menerima nilai yang diizinkan
export function parseAdminProductParams(raw: RawParams): AdminProductFilters {
  const stock =
    PRODUCT_STOCK_TABS.find((tab) => tab.value === first(raw.stock))?.value ??
    "all";
  const q = (first(raw.q) ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(first(raw.page) ?? "1", 10) || 1);

  return { stock, q, page };
}

// Mengubah filter apa pun mengembalikan ke halaman 1, kecuali "page" diberikan
export function buildAdminProductsUrl(
  current: AdminProductFilters,
  overrides: Partial<AdminProductFilters> = {},
): string {
  const next = { ...current, page: 1, ...overrides };
  const params = new URLSearchParams();

  if (next.stock !== "all") params.set("stock", next.stock);
  if (next.q) params.set("q", next.q);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}
