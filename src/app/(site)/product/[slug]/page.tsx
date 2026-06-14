import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import "@/models/Category";
import { serializeProduct } from "@/lib/serializers";
import { ProductGallery } from "@/features/product/ProductGallery";
import { ProductPurchase } from "@/features/product/ProductPurchase";
import { NotesPyramid } from "@/features/product/NotesPyramid";
import styles from "./page.module.scss";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const GENDER_LABELS: Record<string, string> = {
  male: "לגבר",
  female: "לאישה",
  unisex: "יוניסקס",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const doc = await ProductModel.findOne({ slug, isActive: true })
      .populate("category", "name slug")
      .lean();
    if (!doc) return { title: "מוצר לא נמצא" };
    return {
      title: `${doc.brand} ${doc.name}`,
      description: doc.description.slice(0, 160),
      openGraph: {
        title: `${doc.brand} ${doc.name}`,
        description: doc.description.slice(0, 160),
        images: doc.images?.[0] ? [{ url: doc.images[0] }] : undefined,
      },
    };
  } catch {
    return { title: "מוצר" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();
  const doc = await ProductModel.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .lean();
  if (!doc) notFound();

  const product = serializeProduct(doc);

  const categoryName =
    typeof product.category === "object" && product.category
      ? product.category.name
      : null;
  const categorySlug =
    typeof product.category === "object" && product.category
      ? product.category.slug
      : null;

  return (
    <article className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="פירורי לחם">
        <Link href="/">בית</Link>
        <span aria-hidden="true">/</span>
        {categoryName && categorySlug ? (
          <>
            <Link href={`/category/${categorySlug}`}>{categoryName}</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span className={styles.crumbCurrent}>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        <div className={styles.info}>
          <span className={styles.brand}>{product.brand}</span>
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.meta}>
            <span>{product.concentration}</span>
            <span aria-hidden="true">·</span>
            <span>{GENDER_LABELS[product.gender] ?? product.gender}</span>
            {typeof product.category === "object" && product.category ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.category.name}</span>
              </>
            ) : null}
          </div>

          <p className={styles.description}>{product.description}</p>

          <ProductPurchase product={product} />
        </div>
      </div>

      <NotesPyramid notes={product.notes} />
    </article>
  );
}
