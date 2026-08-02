import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import {
  CAMPAIGN_CATEGORIES,
  getCampaignObjectPosition,
  SECTION_EYEBROW,
} from "./categoryTilesConfig";
import styles from "./CategoryTiles.module.scss";

function CampaignArrow() {
  return (
    <svg
      className={styles.arrow}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export async function CategoryTiles() {
  const dbBySlug = new Map<string, { name: string; image?: string }>();

  try {
    await connectDB();
    const docs = await CategoryModel.find().lean();
    for (const c of docs) {
      dbBySlug.set(c.slug, { name: c.name, image: c.image });
    }
  } catch {
    // Render config fallbacks when DB is unavailable
  }

  const cards = CAMPAIGN_CATEGORIES.map((config) => {
    const fromDb = dbBySlug.get(config.slug);
    return {
      slug: config.slug,
      label: config.label,
      title: fromDb?.name ?? config.titleFallback,
      image: fromDb?.image,
    };
  });

  return (
    <section className={styles.section} aria-labelledby="collections-heading">
      <div className={styles.inner}>
        <p id="collections-heading" className={styles.eyebrow}>
          {SECTION_EYEBROW}
        </p>

        <div className={styles.rail}>
          {cards.map((card) => (
            <Link
              key={card.slug}
              href={`/category/${card.slug}`}
              className={styles.card}
              aria-label={`${card.title} — ${card.label}`}
            >
              <div className={styles.media}>
                {card.image ? (
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 85vw, 33vw"
                    className={styles.image}
                    style={{ objectPosition: getCampaignObjectPosition(card.slug) }}
                  />
                ) : (
                  <div className={styles.placeholder} aria-hidden="true" />
                )}
                <div className={styles.scrim} aria-hidden="true" />
              </div>

              <div className={styles.copy}>
                <span className={styles.label}>{card.label}</span>
                <span className={styles.title}>{card.title}</span>
                <CampaignArrow />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
