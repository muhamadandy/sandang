export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Sandang";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Toko online fashion modern. Temukan pakaian pilihan dengan kualitas terbaik dan harga bersahabat.";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Daftar provinsi di Indonesia (38 provinsi)
export const PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Kepulauan Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Barat Daya",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
] as const;

// Metode pembayaran. Untuk menambah COD nanti, cukup tambahkan di sini.
export const PAYMENT_METHODS = ["Midtrans"] as const;
export const DEFAULT_PAYMENT_METHOD = "Midtrans";

export const PAYMENT_METHOD_OPTIONS: {
  value: (typeof PAYMENT_METHODS)[number];
  label: string;
  description: string;
}[] = [
  {
    value: "Midtrans",
    label: "Bayar online (Midtrans)",
    description:
      "QRIS, virtual account bank, dan e-wallet. Pilihan pastinya muncul di jendela pembayaran nanti.",
  },
];
