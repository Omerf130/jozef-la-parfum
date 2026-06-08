import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import "@/models/Category";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validation/product";
import { serializeProduct } from "@/lib/serializers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  await connectDB();
  const { id } = await params;
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  const doc = await ProductModel.findOne(filter)
    .populate("category", "name slug")
    .lean();
  if (!doc) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  return NextResponse.json({ product: serializeProduct(doc) });
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
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    await connectDB();
    const updated = await ProductModel.findByIdAndUpdate(id, parsed.data, { new: true })
      .populate("category", "name slug")
      .lean();
    if (!updated) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
    revalidatePath("/", "layout");
    return NextResponse.json({ product: serializeProduct(updated) });
  } catch (e) {
    console.error("[api/products PATCH]", e);
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
  const updated = await ProductModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  ).lean();
  if (!updated) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
