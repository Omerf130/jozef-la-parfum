import Link from "next/link";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { serializeCategory } from "@/lib/serializers";
import { ProductForm } from "@/features/admin/ProductForm";
import styles from "../page.module.scss";

export default async function NewProductPage() {
  await connectDB();
  const categories = (await CategoryModel.find().sort({ name: 1 }).lean()).map(serializeCategory);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <Link href="/admin/products" style={{ color: "#a88a4f", fontSize: "0.85rem" }}>
            → חזרה למוצרים
          </Link>
          <h1 style={{ marginTop: 4 }}>מוצר חדש</h1>
        </div>
      </header>
      <ProductForm categories={categories} />
    </div>
  );
}
