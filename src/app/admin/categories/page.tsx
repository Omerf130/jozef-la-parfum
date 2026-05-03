import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { serializeCategory } from "@/lib/serializers";
import { CategoriesManager } from "@/features/admin/CategoriesManager";
import styles from "./page.module.scss";

export default async function AdminCategoriesPage() {
  await connectDB();
  const categories = (await CategoryModel.find().sort({ name: 1 }).lean()).map(serializeCategory);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>קטגוריות</h1>
        <p>הוספה, עריכה ומחיקה של קטגוריות.</p>
      </header>
      <CategoriesManager initial={categories} />
    </div>
  );
}
