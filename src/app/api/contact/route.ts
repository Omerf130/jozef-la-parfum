import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";
import { sendContactEmail } from "@/services/email";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ name: "contact", max: 3, windowSec: 60 });

export async function POST(request: Request) {
  const rl = limiter.check(request);
  if (rl.limited) return rl.response!;
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/contact] error", e);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
