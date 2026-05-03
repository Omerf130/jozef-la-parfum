import Link from "next/link";
import styles from "./Footer.module.scss";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Jozef La Parfum";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.col}>
          <h4>{SITE_NAME}</h4>
          <p className={styles.tagline}>
            בוטיק בשמים יוקרתי. אנו בוחרים בקפידה את הניחוחות המעודנים ביותר עבור
            לקוחותינו.
          </p>
        </div>

        <div className={styles.col}>
          <h4>חנות</h4>
          <ul>
            <li>
              <Link href="/category/men">לגבר</Link>
            </li>
            <li>
              <Link href="/category/women">לאישה</Link>
            </li>
            <li>
              <Link href="/category/unisex">יוניסקס</Link>
            </li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>שירות</h4>
          <ul>
            <li>
              <Link href="/about">אודות</Link>
            </li>
            <li>
              <Link href="/contact">צור קשר</Link>
            </li>
            <li>
              <Link href="/admin/login">כניסת מנהל</Link>
            </li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>צרו קשר</h4>
          <ul>
            <li>טלפון: 03-123-4567</li>
            <li>דוא&quot;ל: info@example.com</li>
            <li>שעות: א&apos;-ה&apos; 09:00–18:00</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {year} {SITE_NAME}. כל הזכויות שמורות.</span>
        <span className={styles.payments}>תשלום מאובטח בכרטיס אשראי דרך PayPlus</span>
      </div>
    </footer>
  );
}
