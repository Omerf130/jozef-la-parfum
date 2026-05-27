import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation/checkout";
import { serializeOrder } from "@/lib/serializers";
import { createRateLimiter } from "@/lib/rateLimit";

const orderLimiter = createRateLimiter({ name: "orders", max: 10, windowSec: 60 });

const SHIPPING_PRICE_ILS = Number(process.env.SHIPPING_PRICE_ILS || 0);
const FREE_SHIPPING_THRESHOLD = 499;

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(200, Number(url.searchParams.get("limit")) || 50);

  const filter: Record<string, unknown> = {};
  if (status) filter.orderStatus = status;

  const docs = await OrderModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ orders: docs.map(serializeOrder) });
}

export async function POST(request: Request) {
  const rl = orderLimiter.check(request);
  if (rl.limited) return rl.response!;
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ולידציה נכשלה", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    await connectDB();

    const productIds = parsed.data.items
      .map((it) => it.productId)
      .filter((id) => mongoose.isValidObjectId(id));
    const products = await ProductModel.find({
      _id: { $in: productIds },
      isActive: true,
    }).lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems: Array<{
      productId: mongoose.Types.ObjectId;
      name: string;
      ml: number;
      quantity: number;
      unitPrice: number;
    }> = [];
    let subtotal = 0;

    for (const it of parsed.data.items) {
      const p = productMap.get(it.productId);
      if (!p) {
        return NextResponse.json(
          { error: `מוצר אחד או יותר אינו זמין` },
          { status: 400 },
        );
      }
      const size = p.sizes.find((s) => s.ml === it.ml);
      if (!size) {
        return NextResponse.json(
          { error: `הגודל ${it.ml} מ"ל אינו זמין עבור ${p.name}` },
          { status: 400 },
        );
      }
      const unitPrice =
        p.salePrice && p.salePrice < p.price
          ? Math.round((p.salePrice / p.price) * size.price)
          : size.price;
      subtotal += unitPrice * it.quantity;
      orderItems.push({
        productId: p._id,
        name: `${p.brand} ${p.name}`,
        ml: it.ml,
        quantity: it.quantity,
        unitPrice,
      });
    }

    // Atomic stock reservation: decrement only if sufficient stock exists
    const reserved: Array<{ productId: mongoose.Types.ObjectId; ml: number; quantity: number }> = [];
    for (const item of orderItems) {
      const result = await ProductModel.updateOne(
        {
          _id: item.productId,
          "sizes.ml": item.ml,
          "sizes.stock": { $gte: item.quantity },
        },
        { $inc: { "sizes.$.stock": -item.quantity } },
      );
      if (result.modifiedCount === 0) {
        // Rollback previously reserved items
        await Promise.all(
          reserved.map((r) =>
            ProductModel.updateOne(
              { _id: r.productId, "sizes.ml": r.ml },
              { $inc: { "sizes.$.stock": r.quantity } },
            ),
          ),
        );
        return NextResponse.json(
          { error: `אזל המלאי עבור ${item.name} (${item.ml} מ"ל)` },
          { status: 400 },
        );
      }
      reserved.push({ productId: item.productId, ml: item.ml, quantity: item.quantity });
    }

    const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE_ILS;
    const total = subtotal + shippingPrice;

    let order;
    try {
      order = await OrderModel.create({
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
        shippingAddress: parsed.data.shippingAddress,
        items: orderItems,
        subtotal,
        shippingPrice,
        total,
        paymentStatus: "pending",
        paymentProvider: "payplus",
        orderStatus: "new",
      });
    } catch (createErr) {
      // Order creation failed — release all reserved stock
      await Promise.all(
        reserved.map((r) =>
          ProductModel.updateOne(
            { _id: r.productId, "sizes.ml": r.ml },
            { $inc: { "sizes.$.stock": r.quantity } },
          ),
        ),
      );
      throw createErr;
    }

    return NextResponse.json(
      { order: serializeOrder(order.toObject()) },
      { status: 201 },
    );
  } catch (e) {
    console.error("[api/orders POST]", e);
    const message = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
