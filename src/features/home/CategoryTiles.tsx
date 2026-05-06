import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import styles from "./CategoryTiles.module.scss";

const FALLBACK = [
  { name: "לגבר", slug: "men" },
  { name: "לאישה", slug: "women" },
  { name: "יוניסקס", slug: "unisex" },
];

export async function CategoryTiles() {
  let categories: { name: string; slug: string; image?: string }[] = [];
  try {
    await connectDB();
    const docs = await CategoryModel.find().lean();
    categories = docs.map((c) => ({
      name: c.name,
      slug: c.slug,
      image: c.image,
    }));
  } catch {
    categories = [];
  }

  if (categories.length === 0) categories = FALLBACK;

  return (
    <section className={styles.section} aria-labelledby="categories-heading">
      <div className={styles.head}>
        <span className={styles.kicker}>קטגוריות</span>
        <h2 id="categories-heading" className={styles.title}>
          גלו לפי טעם
        </h2>
      </div>
      <div className={styles.grid}>
        {categories.slice(0, 4).map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className={styles.tile}>
            <div className={styles.imageWrap}>
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className={styles.image}
                />
              ) : (
                <div className={styles.placeholder} aria-hidden="true">
                  ✦
                </div>
              )}
              <div className={styles.shade} aria-hidden="true" />
            </div>
            <div className={styles.label}>
              <span>{c.name}</span>
              <span className={styles.arrow} aria-hidden="true">
                גלו
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
