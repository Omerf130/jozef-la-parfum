import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import "@/models/Category";
import { EmptyState } from "@/components/EmptyState";
import { serializeProduct } from "@/lib/serializers";
import { GalleryProductCard } from "./GalleryProductCard";
import { FEATURED_SECTION } from "./featuredProductsConfig";
import styles from "./FeaturedProducts.module.scss";

export async function FeaturedProducts() {
  let products: Awaited<ReturnType<typeof loadProducts>> = [];
  try {
    products = await loadProducts();
  } catch {
    products = [];
  }

  return (
    <section className={styles.section} aria-labelledby="featured-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <div className={styles.headText}>
            <p className={styles.eyebrow}>{FEATURED_SECTION.eyebrow}</p>
            <h2 id="featured-heading" className={styles.title}>
              {FEATURED_SECTION.title}
            </h2>
            <p className={styles.subtitle}>{FEATURED_SECTION.subtitle}</p>
          </div>
          <Link href={FEATURED_SECTION.viewAll.href} className={styles.viewAll}>
            {FEATURED_SECTION.viewAll.label}
          </Link>
        </header>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <EmptyState
              title="אין כרגע פריטים מומלצים"
              description="הוסיפו מוצרים מסומנים 'מומלץ' מתוך מערכת הניהול."
            />
          </div>
        ) : (
          <div className={styles.rail}>
            {products.map((p) => (
              <GalleryProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

async function loadProducts() {
  await connectDB();
  const docs = await ProductModel.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .limit(4)
    .lean();
  return docs.map(serializeProduct);
}
