import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";
import { sendContactEmail } from "@/services/email";

export async function POST(request: Request) {
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
