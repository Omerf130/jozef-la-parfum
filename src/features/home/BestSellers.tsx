import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { serializeProduct } from "@/lib/serializers";
import styles from "./Section.module.scss";

export async function BestSellers() {
  let products: Awaited<ReturnType<typeof loadProducts>> = [];
  try {
    products = await loadProducts();
  } catch {
    products = [];
  }

  return (
    <section className={styles.section} aria-labelledby="best-heading">
      <div className={styles.head}>
        <span className={styles.kicker}>הנמכרים ביותר</span>
        <h2 id="best-heading" className={styles.title}>
          קלאסיקות אהובות
        </h2>
        <p className={styles.subtitle}>
          הניחוחות שצברו תהילה אצל לקוחותינו ונשארים על מדפי המעריצים.
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState title="אין מוצרים זמינים" />
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
  const docs = await ProductModel.find({ isActive: true })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  return docs.map(serializeProduct);
}
