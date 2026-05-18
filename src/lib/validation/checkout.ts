import { z } from "zod";

const ilPhoneRegex = /^0(5\d|7\d|2|3|4|8|9)-?\d{7}$/;
const ilZipRegex = /^\d{5,7}$/;

export const checkoutFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "יש להזין שם מלא"),
  customerEmail: z.string().trim().toLowerCase().email("דוא״ל לא תקין"),
  customerPhone: z
    .string()
    .trim()
    .regex(ilPhoneRegex, "מספר טלפון ישראלי לא תקין"),
  shippingAddress: z.object({
    street: z.string().trim().min(2, "יש להזין כתובת"),
    city: z.string().trim().min(2, "יש להזין עיר"),
    zip: z.string().trim().regex(ilZipRegex, "מיקוד ישראלי לא תקין"),
    country: z.string().default("IL"),
  }),
});

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

export const checkoutSchema = checkoutFormSchema.extend({
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

export type CheckoutInput = z.infer<typeof checkoutSchema>;
