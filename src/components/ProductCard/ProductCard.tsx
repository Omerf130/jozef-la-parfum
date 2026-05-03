import Image from "next/image";
import Link from "next/link";
import type { ProductDTO } from "@/types";
import { PriceTag } from "../PriceTag";
import styles from "./ProductCard.module.scss";

interface ProductCardProps {
  product: ProductDTO;
}

const GENDER_LABELS: Record<string, string> = {
  male: "לגבר",
  female: "לאישה",
  unisex: "יוניסקס",
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const onSale =
    typeof product.salePrice === "number" &&
    product.salePrice > 0 &&
    product.salePrice < product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={styles.card}
      aria-label={`${product.brand} — ${product.name}`}
    >
      <div className={styles.imageWrap}>
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            ✦
          </div>
        )}
        {onSale ? <span className={styles.badge}>מבצע</span> : null}
        {product.isFeatured ? <span className={styles.featuredBadge}>נבחר</span> : null}
      </div>
      <div className={styles.body}>
        <span className={styles.brand}>{product.brand}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.meta}>
          <span>{product.concentration}</span>
          <span>·</span>
          <span>{GENDER_LABELS[product.gender] ?? product.gender}</span>
        </div>
        <PriceTag price={product.price} salePrice={product.salePrice} size="md" />
      </div>
    </Link>
  );
}
