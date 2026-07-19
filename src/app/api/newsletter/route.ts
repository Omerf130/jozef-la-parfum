import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { NewsletterSubscriberModel } from "@/models/NewsletterSubscriber";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ name: "newsletter", max: 5, windowSec: 60 });

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("דוא״ל לא תקין"),
});

export async function POST(request: Request) {
  const rl = limiter.check(request);
  if (rl.limited) return rl.response!;

  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "דוא״ל לא תקין" },
        { status: 400 },
      );
    }

    await connectDB();

    try {
      await NewsletterSubscriberModel.create({ email: parsed.data.email });
    } catch (e) {
      if (e && typeof e === "object" && "code" in e && (e as { code: number }).code === 11000) {
        return NextResponse.json(
          { error: "כתובת הדוא״ל כבר רשומה למועדון" },
          { status: 409 },
        );
      }
      throw e;
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[api/newsletter] error", e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
