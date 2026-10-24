import { z } from "zod";

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
