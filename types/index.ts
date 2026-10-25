import { z } from "zod";
import type { Product as PrismaProduct } from "@/lib/generated/prisma/client";
import {
  insertProductSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  paymentMethodSchema,
} from "@/lib/validator";

export type Product = PrismaProduct;
export type ProductInput = Omit<Product, "id" | "createdAt">;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
