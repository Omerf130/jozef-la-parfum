import { z } from "zod";

const MAX_HERO_IMAGES = 10;

const urlList = z
  .array(
    z
      .string()
      .url("כתובת לא תקינה")
      .refine((u) => u.startsWith("https://"), "נדרש קישור מאובטח (https)"),
  )
  .max(MAX_HERO_IMAGES, `ניתן לשמור עד ${MAX_HERO_IMAGES} תמונות`);

export const siteSettingsUpdateSchema = z.object({
  heroImagesDesktop: urlList.optional(),
  heroImagesMobile: urlList.optional(),
  shippingPriceILS: z.number().min(0, "ערך חייב להיות 0 ומעלה").optional(),
  freeShippingThreshold: z.number().min(0, "ערך חייב להיות 0 ומעלה").optional(),
});

export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;

export { MAX_HERO_IMAGES };
