import { z } from "zod";
import { PAYMENT_METHODS, PROVINCES } from "@/lib/constants";

export const insertProductSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda hubung",
    ),
  category: z.string().min(3, "Kategori minimal 3 karakter"),
  brand: z.string().min(2, "Merek minimal 2 karakter"),
  description: z.string().min(3, "Deskripsi minimal 3 karakter"),
  images: z
    .array(z.string().min(1))
    .min(1, "Produk harus punya minimal 1 gambar"),
  price: z
    .number()
    .int("Harga harus bilangan bulat (Rupiah)")
    .positive("Harga harus lebih dari 0"),
  stock: z
    .number()
    .int("Stok harus bilangan bulat")
    .nonnegative("Stok tidak boleh negatif"),
  rating: z.number().min(0).max(5).default(0),
  numReviews: z.number().int().nonnegative().default(0),
  isFeatured: z.boolean().default(false),
  banner: z.string().nullable().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

// Satu barang di dalam keranjang
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Produk wajib diisi"),
  name: z.string().min(1, "Nama produk wajib diisi"),
  slug: z.string().min(1, "Slug produk wajib diisi"),
  image: z.string().min(1, "Gambar produk wajib diisi"),
  price: z
    .number()
    .int("Harga harus bilangan bulat (Rupiah)")
    .positive("Harga harus lebih dari 0"),
  qty: z
    .number()
    .int("Jumlah harus bilangan bulat")
    .positive("Jumlah minimal 1"),
});

// Keranjang lengkap dengan rincian harga
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: z.number().int().nonnegative(),
  shippingPrice: z.number().int().nonnegative(),
  taxPrice: z.number().int().nonnegative(),
  totalPrice: z.number().int().nonnegative(),
});

// Alamat pengiriman
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Nama penerima minimal 3 karakter"),
  phone: z
    .string()
    .regex(
      /^(?:\+62|62|0)8[1-9][0-9]{7,10}$/,
      "Nomor HP tidak valid (contoh: 081234567890)",
    ),
  streetAddress: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  city: z.string().min(3, "Kota atau kabupaten minimal 3 karakter"),
  province: z
    .string()
    .min(1, "Pilih provinsi")
    .refine((value) => (PROVINCES as readonly string[]).includes(value), {
      message: "Pilih provinsi yang valid",
    }),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit angka"),
});

// Metode pembayaran
export const paymentMethodSchema = z.object({
  type: z.enum(PAYMENT_METHODS, {
    message: "Pilih metode pembayaran",
  }),
});

// Ubah profil (saat ini hanya nama)
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(50, "Nama maksimal 50 karakter"),
});
