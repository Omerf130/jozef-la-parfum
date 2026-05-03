"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { PriceTag } from "@/components/PriceTag";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useCart } from "@/store/cart";
import { formatILS } from "@/lib/format";
import type { ProductDTO } from "@/types";
import styles from "./ProductPurchase.module.scss";

interface ProductPurchaseProps {
  product: ProductDTO;
}

export function ProductPurchase({ product }: ProductPurchaseProps) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const sizes = product.sizes;
  const [selectedMl, setSelectedMl] = useState(sizes[0]?.ml ?? 0);
  const [qty, setQty] = useState(1);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const selected = sizes.find((s) => s.ml === selectedMl);
  const inStock = (selected?.stock ?? 0) > 0;
  const unitPrice = selected
    ? product.salePrice && product.salePrice < product.price
      ? Math.round((product.salePrice / product.price) * selected.price)
      : selected.price
    : product.salePrice ?? product.price;

  function handleAdd() {
    if (!selected) return;
    add({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.images[0],
      ml: selected.ml,
      unitPrice,
      quantity: qty,
    });
    setConfirmation(`הוסף לעגלה: ${product.name} ${selected.ml} מ״ל × ${qty}`);
  }

  function handleBuyNow() {
    handleAdd();
    router.push("/cart");
  }

  return (
    <div className={styles.purchase}>
      <div className={styles.priceBlock}>
        <PriceTag price={product.price} salePrice={product.salePrice} size="lg" />
        {selected ? (
          <span className={styles.sizePrice}>
            {selected.ml} מ״ל · {formatILS(unitPrice)}
          </span>
        ) : null}
      </div>

      {sizes.length > 0 ? (
        <div className={styles.sizes}>
          <h3>גודל</h3>
          <div className={styles.sizeOptions}>
            {sizes.map((s) => {
              const out = s.stock <= 0;
              return (
                <button
                  key={s.ml}
                  type="button"
                  onClick={() => setSelectedMl(s.ml)}
                  disabled={out}
                  aria-pressed={selectedMl === s.ml}
                  className={`${styles.sizeBtn} ${
                    selectedMl === s.ml ? styles.active : ""
                  } ${out ? styles.out : ""}`}
                >
                  <span className={styles.sizeMl}>{s.ml} מ״ל</span>
                  <span className={styles.sizePriceLabel}>{formatILS(s.price)}</span>
                  {out ? <span className={styles.outBadge}>אזל</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className={styles.qtyRow}>
        <span className={styles.qtyLabel}>כמות</span>
        <QuantityStepper value={qty} onChange={setQty} max={selected?.stock ?? 99} />
        {selected ? (
          <span className={styles.stock}>
            {selected.stock > 0 ? `במלאי: ${selected.stock}` : "אזל מהמלאי"}
          </span>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Button onClick={handleAdd} disabled={!inStock} fullWidth>
          הוספה לעגלה
        </Button>
        <Button onClick={handleBuyNow} disabled={!inStock} variant="secondary" fullWidth>
          קנייה מהירה
        </Button>
      </div>

      {confirmation ? (
        <div className={styles.confirm} role="status">
          {confirmation}
        </div>
      ) : null}
    </div>
  );
}
