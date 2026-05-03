import { z } from "zod";

export const productSizeSchema = z.object({
  ml: z.number().int().positive(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
});

export const productNotesSchema = z.object({
  top: z.array(z.string().trim().min(1)).default([]),
  middle: z.array(z.string().trim().min(1)).default([]),
  base: z.array(z.string().trim().min(1)).default([]),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "שם חייב להכיל לפחות 2 תווים"),
  slug: z.string().trim().optional(),
  brand: z.string().trim().min(1, "יצרן הוא שדה חובה"),
  description: z.string().trim().min(10, "תיאור חייב להכיל לפחות 10 תווים"),
  price: z.number().nonnegative(),
  salePrice: z.number().nonnegative().optional().nullable(),
  category: z.string().min(1, "יש לבחור קטגוריה"),
  gender: z.enum(["male", "female", "unisex"]),
  concentration: z.enum(["EDT", "EDP", "Parfum", "Cologne"]),
  sizes: z.array(productSizeSchema).min(1, "יש להזין לפחות גודל אחד"),
  notes: productNotesSchema,
  images: z.array(z.string().url()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
