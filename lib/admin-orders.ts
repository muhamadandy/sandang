export const ORDER_STATUS_TABS = [
  { value: "all", label: "Semua" },
  { value: "unpaid", label: "Belum dibayar" },
  { value: "toship", label: "Perlu dikirim" },
  { value: "delivered", label: "Terkirim" },
] as const;

export type OrderStatus = (typeof ORDER_STATUS_TABS)[number]["value"];

export type AdminOrderFilters = {
  status: OrderStatus;
  q: string;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

// Kalau parameter muncul berulang (?q=a&q=b), ambil yang pertama saja
const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

// Membaca parameter URL dan hanya menerima nilai yang diizinkan
export function parseAdminOrderParams(raw: RawParams): AdminOrderFilters {
  const status =
    ORDER_STATUS_TABS.find((tab) => tab.value === first(raw.status))?.value ??
    "all";
  const q = (first(raw.q) ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(first(raw.page) ?? "1", 10) || 1);

  return { status, q, page };
}

// Mengubah filter apa pun mengembalikan ke halaman 1, kecuali "page" diberikan
export function buildAdminOrdersUrl(
  current: AdminOrderFilters,
  overrides: Partial<AdminOrderFilters> = {},
): string {
  const next = { ...current, page: 1, ...overrides };
  const params = new URLSearchParams();

  if (next.status !== "all") params.set("status", next.status);
  if (next.q) params.set("q", next.q);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}
