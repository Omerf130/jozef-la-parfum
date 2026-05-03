import type { Metadata } from "next";
import { CartView } from "@/features/cart/CartView";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "עגלת קניות",
  description: "סקור את הפריטים בעגלה לפני המעבר לתשלום.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>עגלת הקניות</h1>
        <p>סקור ועדכן את הפריטים לפני המעבר לתשלום מאובטח.</p>
      </header>
      <CartView />
    </div>
  );
}
