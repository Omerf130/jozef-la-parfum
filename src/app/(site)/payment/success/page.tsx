import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "תשלום הושלם בהצלחה",
  robots: { index: false },
};

export default function PaymentSuccess() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap} aria-hidden="true">
          <span className={styles.icon}>✓</span>
        </div>
        <h1>תשלום הושלם בהצלחה</h1>
        <p>תודה על ההזמנה! נשלחה לך חשבונית ופרטים לדוא&quot;ל.</p>
        <p className={styles.subtle}>
          עדכון סטטוס ההזמנה יתבצע באופן אוטומטי לאחר אישור מספק התשלום.
        </p>
        <div className={styles.actions}>
          <Link href="/">
            <Button variant="secondary">חזרה לבית</Button>
          </Link>
          <Link href="/category/women">
            <Button variant="ghost">המשך קנייה</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
