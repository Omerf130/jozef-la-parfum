import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  await connectDB();

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const docs = await ProductModel.find({
    isActive: true,
    name: { $regex: escaped, $options: "i" },
  })
    .select("name brand slug images price salePrice")
    .limit(6)
    .lean();

  const results = docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    brand: d.brand,
    slug: d.slug,
    image: d.images?.[0] ?? null,
    price: d.price,
    salePrice: d.salePrice ?? null,
  }));

  return NextResponse.json({ results });
}
