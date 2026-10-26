export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// Versi ringkas untuk label sumbu grafik: Rp500 rb, Rp1,5 jt, Rp2 M
export const formatRupiahCompact = (value: number) => {
  const trim = (n: number) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(n);

  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `Rp${trim(value / 1_000_000_000)} M`;
  if (abs >= 1_000_000) return `Rp${trim(value / 1_000_000)} jt`;
  if (abs >= 1_000) return `Rp${trim(value / 1_000)} rb`;
  return `Rp${value}`;
};

export const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(value);
