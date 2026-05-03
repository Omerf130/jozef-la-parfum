import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/services/blob";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "קובץ חסר" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "יש להעלות קובץ תמונה" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "קובץ גדול מ-8MB" }, { status: 400 });
    }
    const url = await uploadImage(file);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[api/upload]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
