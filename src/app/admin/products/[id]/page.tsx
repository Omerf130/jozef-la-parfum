import Link from "next/link";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { CategoryModel } from "@/models/Category";
import { serializeProduct, serializeCategory } from "@/lib/serializers";
import { ProductForm } from "@/features/admin/ProductForm";
import styles from "../page.module.scss";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  const [doc, cats] = await Promise.all([
    ProductModel.findById(id).populate("category", "name slug").lean(),
    CategoryModel.find().sort({ name: 1 }).lean(),
  ]);
  if (!doc) notFound();

  const product = serializeProduct(doc);
  const categories = cats.map(serializeCategory);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <Link href="/admin/products" style={{ color: "#a88a4f", fontSize: "0.85rem" }}>
            → חזרה למוצרים
          </Link>
          <h1 style={{ marginTop: 4 }}>עריכת מוצר</h1>
          <p>{product.brand} — {product.name}</p>
        </div>
      </header>
      <ProductForm categories={categories} initial={product} />
    </div>
  );
}
