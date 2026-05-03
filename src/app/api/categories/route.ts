import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validation/category";
import { serializeCategory } from "@/lib/serializers";

export async function GET() {
  await connectDB();
  const docs = await CategoryModel.find().sort({ name: 1 }).lean();
  return NextResponse.json({ categories: docs.map(serializeCategory) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    await connectDB();
    const created = await CategoryModel.create(parsed.data);
    return NextResponse.json(
      { category: serializeCategory(created.toObject()) },
      { status: 201 },
    );
  } catch (e) {
    console.error("[api/categories POST]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
