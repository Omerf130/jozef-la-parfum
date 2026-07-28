import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { deleteProductPermanently } from "@/lib/admin/deleteProductPermanently";

interface Params {
  params: Promise<{ id: string }>;
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

  try {
    const result = await deleteProductPermanently(id, {
      id: session.user.id,
      email: session.user.email,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[api/products permanent DELETE]", error);
    const message = error instanceof Error ? error.message : "שגיאת שרת";
    if (message === "Product not found") {
      return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
    }
    if (message === "Invalid product id") {
      return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
