import { z } from "zod";
import type { Product as PrismaProduct } from "@/lib/generated/prisma/client";
import { insertProductSchema } from "@/lib/validator";

export type Product = PrismaProduct;

export type ProductInput = Omit<Product, "id" | "createdAt">;

export type InsertProduct = z.infer<typeof insertProductSchema>;
