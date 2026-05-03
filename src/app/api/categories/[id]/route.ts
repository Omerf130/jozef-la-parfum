import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { ProductModel } from "@/models/Product";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validation/category";
import { serializeCategory } from "@/lib/serializers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  await connectDB();
  const { id } = await params;
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  const doc = await CategoryModel.findOne(filter).lean();
  if (!doc) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  return NextResponse.json({ category: serializeCategory(doc) });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    await connectDB();
    const updated = await CategoryModel.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
    return NextResponse.json({ category: serializeCategory(updated) });
  } catch (e) {
    console.error("[api/categories PATCH]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }
  await connectDB();
  const inUse = await ProductModel.exists({ category: id });
  if (inUse) {
    return NextResponse.json(
      { error: "לא ניתן למחוק קטגוריה שמשויכת אליה מוצרים" },
      { status: 400 },
    );
  }
  const removed = await CategoryModel.findByIdAndDelete(id).lean();
  if (!removed) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
