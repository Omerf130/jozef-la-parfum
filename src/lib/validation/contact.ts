import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "יש להזין שם"),
  email: z.string().trim().toLowerCase().email("דוא״ל לא תקין"),
  phone: z.string().trim().min(7, "טלפון לא תקין").optional().or(z.literal("")),
  subject: z.string().trim().min(2, "יש להזין נושא"),
  message: z.string().trim().min(10, "הודעה חייבת להכיל לפחות 10 תווים"),
});

export type ContactInput = z.infer<typeof contactSchema>;
