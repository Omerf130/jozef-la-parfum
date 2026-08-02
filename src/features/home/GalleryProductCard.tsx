import Image from "next/image";
import Link from "next/link";
import { formatILS } from "@/lib/format";
import { FEATURED_SECTION } from "./featuredProductsConfig";
import type { ProductDTO } from "@/types";
import styles from "./GalleryProductCard.module.scss";

interface GalleryProductCardProps {
  product: ProductDTO;
}

function displayPrice(product: ProductDTO): string {
  const onSale =
    typeof product.salePrice === "number" &&
    product.salePrice > 0 &&
    product.salePrice < product.price;
  return formatILS(onSale ? product.salePrice! : product.price);
}

export function GalleryProductCard({ product }: GalleryProductCardProps) {
  const image = product.images[0];
  const href = `/product/${product.slug}`;

  return (
    <article className={styles.piece}>
      <Link
        href={href}
        className={styles.composition}
        aria-label={`${product.brand} — ${product.name}`}
      >
        <div className={styles.stage} aria-hidden={!image}>
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 768px) 88vw, 25vw"
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>✦</div>
          )}
        </div>

        <div className={styles.caption}>
          <span className={styles.brand}>{product.brand}</span>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>{displayPrice(product)}</p>
          <span className={styles.discover}>
            {FEATURED_SECTION.ctaLabel}
            <span className={styles.discoverMark} aria-hidden="true">
              ←
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}
