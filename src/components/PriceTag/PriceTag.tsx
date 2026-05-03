import { formatILS } from "@/lib/format";
import styles from "./PriceTag.module.scss";

interface PriceTagProps {
  price: number;
  salePrice?: number | null;
  size?: "sm" | "md" | "lg";
}

export function PriceTag({ price, salePrice, size = "md" }: PriceTagProps) {
  const onSale = typeof salePrice === "number" && salePrice > 0 && salePrice < price;
  return (
    <div className={`${styles.price} ${styles[size]}`}>
      {onSale ? (
        <>
          <span className={styles.sale}>{formatILS(salePrice as number)}</span>
          <span className={styles.original}>{formatILS(price)}</span>
        </>
      ) : (
        <span className={styles.regular}>{formatILS(price)}</span>
      )}
    </div>
  );
}
