import { z } from "zod";

const couponBaseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "קוד קופון חייב להכיל לפחות 3 תווים")
    .max(32, "קוד קופון ארוך מדי")
    .regex(/^[A-Za-z0-9-]+$/, "קוד קופון יכול להכיל אותיות, מספרים ומקף בלבד"),
  appliesTo: z.enum(["products", "shipping"]).default("products"),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.coerce.number().positive("ערך ההנחה חייב להיות חיובי"),
  minOrderAmount: z.coerce.number().min(0).optional().nullable(),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
  maxUsesPerCustomer: z.coerce.number().int().min(1).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  description: z.string().trim().max(500).optional().nullable(),
});

function refineCoupon(
  data: z.infer<typeof couponBaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.discountType === "percent" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "אחוז הנחה לא יכול לעלות על 100",
      path: ["discountValue"],
    });
  }
  if (data.expiresAt) {
    const d = new Date(data.expiresAt);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "תאריך תפוגה לא תקין",
        path: ["expiresAt"],
      });
    }
  }
}

export const couponSchema = couponBaseSchema.superRefine(refineCoupon);

export const couponUpdateSchema = couponBaseSchema.partial().superRefine((data, ctx) => {
  if (data.discountType === "percent" && data.discountValue != null && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "אחוז הנחה לא יכול לעלות על 100",
      path: ["discountValue"],
    });
  }
  if (data.expiresAt) {
    const d = new Date(data.expiresAt);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "תאריך תפוגה לא תקין",
        path: ["expiresAt"],
      });
    }
  }
});

export type CouponInput = z.infer<typeof couponSchema>;

export const couponValidateSchema = z.object({
  code: z.string().trim().min(1, "יש להזין קוד קופון"),
  customerEmail: z.string().trim().toLowerCase().email().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        ml: z.number().int().positive(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1, "העגלה ריקה"),
});

export type CouponValidateInput = z.infer<typeof couponValidateSchema>;
