import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "התשלום בוטל",
  robots: { index: false },
};

export default function PaymentCancel() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap} aria-hidden="true">
          <span className={styles.icon}>!</span>
        </div>
        <h1>התשלום לא הושלם</h1>
        <p>ההזמנה שלך לא חויבה. ניתן לנסות שוב או לחזור לעגלה.</p>
        <div className={styles.actions}>
          <Link href="/cart">
            <Button variant="secondary">חזרה לעגלה</Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost">פנייה לשירות לקוחות</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
