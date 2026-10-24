import { z } from "zod";
import { insertProductSchema } from "@/lib/validator";

export type InsertProduct = z.infer<typeof insertProductSchema>;
