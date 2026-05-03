import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validation/product";
import { serializeProduct } from "@/lib/serializers";

export async function GET(request: Request) {
  await connectDB();
  const url = new URL(request.url);
  const featured = url.searchParams.get("featured");
  const active = url.searchParams.get("active");
  const limit = Math.min(60, Number(url.searchParams.get("limit")) || 20);

  const filter: Record<string, unknown> = {};
  if (active !== "false") filter.isActive = true;
  if (featured === "true") filter.isFeatured = true;

  const docs = await ProductModel.find(filter)
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ products: docs.map(serializeProduct) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    await connectDB();
    const created = await ProductModel.create(parsed.data);
    const populated = await ProductModel.findById(created._id)
      .populate("category", "name slug")
      .lean();
    return NextResponse.json(
      { product: populated ? serializeProduct(populated) : null },
      { status: 201 },
    );
  } catch (e) {
    console.error("[api/products POST]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
