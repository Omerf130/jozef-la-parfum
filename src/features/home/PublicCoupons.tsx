"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import styles from "./PublicCoupons.module.scss";

interface PublicCoupon {
  code: string;
  label: string;
  minOrderAmount?: number;
}

export function PublicCoupons() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/coupons/public")
      .then((res) => res.json())
      .then((data) => setCoupons(data.coupons ?? []))
      .catch(() => setCoupons([]));
  }, []);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(null);
    }
  }

  if (coupons.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="public-coupons-heading">
      <div className={styles.inner}>
        <div className={styles.text}>
          <h2 id="public-coupons-heading">קופונים זמינים</h2>
          <p>העתיקו את הקוד והזינו אותו בעגלה או בתשלום.</p>
        </div>

        <ul className={styles.list}>
          {coupons.map((c) => (
            <li key={c.code} className={styles.item}>
              <div className={styles.info}>
                <span className={styles.code} dir="ltr">
                  {c.code}
                </span>
                <span className={styles.label}>{c.label}</span>
                {c.minOrderAmount != null ? (
                  <span className={styles.min}>
                    מינימום הזמנה: ₪{c.minOrderAmount}
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => copyCode(c.code)}
                className={styles.copyBtn}
              >
                {copiedCode === c.code ? "הועתק!" : "העתק"}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
