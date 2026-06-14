import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import "@/models/Category";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { serializeProduct } from "@/lib/serializers";
import styles from "./Section.module.scss";

export async function FeaturedProducts() {
  let products: Awaited<ReturnType<typeof loadProducts>> = [];
  try {
    products = await loadProducts();
  } catch {
    products = [];
  }

  return (
    <section className={styles.section} aria-labelledby="featured-heading">
      <div className={styles.head}>
        <span className={styles.kicker}>נבחרים השבוע</span>
        <h2 id="featured-heading" className={styles.title}>
          הבשמים המומלצים שלנו
        </h2>
        <p className={styles.subtitle}>
          אוסף מובחר של ניחוחות יוקרתיים, נבחרו בקפידה על ידי המומחים שלנו.
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="אין כרגע פריטים מומלצים"
          description="הוסיפו מוצרים מסומנים 'מומלץ' מתוך מערכת הניהול."
        />
      ) : (
        <div className={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

async function loadProducts() {
  await connectDB();
  const docs = await ProductModel.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .limit(8)
    .lean();
  return docs.map(serializeProduct);
}
