"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import styles from "./CartIndicator.module.scss";

export function CartIndicator() {
  const count = useCart((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  return (
    <Link href="/cart" className={styles.cart} aria-label={`עגלה (${count} פריטים)`}>
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M6 6 5 3H2" />
      </svg>
      {count > 0 ? <span className={styles.badge}>{count}</span> : null}
    </Link>
  );
}
