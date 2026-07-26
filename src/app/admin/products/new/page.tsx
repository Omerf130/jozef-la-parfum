import Link from "next/link";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { serializeCategory } from "@/lib/serializers";
import { ProductForm } from "@/features/admin/ProductForm";
import { AdminBreadcrumbs } from "@/features/admin/ui/AdminBreadcrumbs";
import styles from "../page.module.scss";

export default async function NewProductPage() {
  await connectDB();
  const categories = (await CategoryModel.find().sort({ name: 1 }).lean()).map(serializeCategory);

  return (
    <div className={styles.page}>
      <AdminBreadcrumbs
        items={[
          { label: "ניהול", href: "/admin" },
          { label: "מוצרים", href: "/admin/products" },
          { label: "מוצר חדש" },
        ]}
      />
      <header className={styles.editHead}>
        <Link href="/admin/products" className={styles.backLink}>
          → חזרה למוצרים
        </Link>
        <h1>מוצר חדש</h1>
      </header>
      <ProductForm categories={categories} />
    </div>
  );
}
