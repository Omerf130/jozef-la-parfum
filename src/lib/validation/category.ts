import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "שם חייב להכיל לפחות 2 תווים"),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
