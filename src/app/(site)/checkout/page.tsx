import type { Metadata } from "next";
import { CheckoutForm } from "@/features/checkout/CheckoutForm";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "תשלום",
  description: "השלם את ההזמנה בתשלום מאובטח.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>פרטי תשלום</h1>
        <p>מלאו את הפרטים כדי לעבור לדף התשלום המאובטח של PayPlus.</p>
      </header>
      <CheckoutForm />
    </div>
  );
}
