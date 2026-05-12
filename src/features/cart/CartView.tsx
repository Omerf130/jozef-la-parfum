"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useCart } from "@/store/cart";
import { formatILS } from "@/lib/format";
import styles from "./CartView.module.scss";

const SHIPPING_PRICE = Number(process.env.NEXT_PUBLIC_SHIPPING_PRICE_ILS || 35);
const FREE_SHIPPING_THRESHOLD = 499;

export function CartView() {
  const [hydrated, setHydrated] = useState(false);
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div className={styles.loading}>טוען עגלה…</div>;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="העגלה ריקה"
        description="עדיין לא הוספת מוצרים. בואו לגלות את הקולקציה שלנו."
        action={
          <Link href="/category/women">
            <Button variant="secondary">לחנות</Button>
          </Link>
        }
      />
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
  const total = subtotal + shipping;

  return (
    <div className={styles.layout}>
      <div className={styles.items}>
        {items.map((item) => (
          <article key={`${item.productId}-${item.ml}`} className={styles.item}>
            <Link href={`/product/${item.slug}`} className={styles.itemImage}>
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="120px" />
              ) : (
                <div className={styles.placeholder}>✦</div>
              )}
            </Link>
            <div className={styles.itemBody}>
              <span className={styles.itemBrand}>{item.brand}</span>
              <Link href={`/product/${item.slug}`} className={styles.itemName}>
                {item.name}
              </Link>
              <span className={styles.itemMeta}>{item.ml} מ״ל</span>
              <span className={styles.itemPrice}>{formatILS(item.unitPrice)}</span>
            </div>
            <div className={styles.itemControls}>
              <QuantityStepper
                value={item.quantity}
                onChange={(q) => updateQuantity(item.productId, item.ml, q)}
              />
              <button
                type="button"
                onClick={() => remove(item.productId, item.ml)}
                className={styles.removeBtn}
              >
                הסר
              </button>
            </div>
            <div className={styles.itemTotal}>
              {formatILS(item.unitPrice * item.quantity)}
            </div>
          </article>
        ))}

        <div className={styles.itemsActions}>
          <button type="button" onClick={clear} className={styles.clearBtn}>
            נקה את העגלה
          </button>
        </div>
      </div>

      <aside className={styles.summary}>
        <h2>סיכום הזמנה</h2>
        <div className={styles.row}>
          <span>סכום ביניים</span>
          <span>{formatILS(subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span>משלוח</span>
          <span>{shipping === 0 ? "חינם" : formatILS(shipping)}</span>
        </div>
        {shipping > 0 ? (
          <p className={styles.shippingNote}>
            מעל {formatILS(FREE_SHIPPING_THRESHOLD)} משלוח חינם
          </p>
        ) : null}
        <div className={`${styles.row} ${styles.totalRow}`}>
          <span>סה״כ לתשלום</span>
          <span>{formatILS(total)}</span>
        </div>
        <Link href="/checkout">
          <Button fullWidth size="lg">
            המשך לתשלום
          </Button>
        </Link>
        <p className={styles.secure}>תשלום מאובטח דרך PayPlus</p>
      </aside>
    </div>
  );
}
