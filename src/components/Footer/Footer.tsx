import Link from "next/link";
import styles from "./Footer.module.scss";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Jozef La Parfum";

const VALUE_PROPS = [
  {
    title: "משלוח חינם",
    desc: "בהזמנה מעל ₪499 · עד 7 ימי עסקים",
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 9h17v13H3z" />
        <path d="M20 13h6l3 4v5h-9z" />
        <circle cx="9" cy="24" r="2.5" />
        <circle cx="24" cy="24" r="2.5" />
      </svg>
    ),
  },
  {
    title: "תשלומים נוחים",
    desc: "עד 12 תשלומים ללא ריבית",
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="8" width="26" height="17" />
        <path d="M3 14h26" />
        <path d="M8 20h6" />
      </svg>
    ),
  },
  {
    title: "ייעוץ אישי",
    desc: "מומחי בשמים זמינים עבורך",
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="16" cy="12" r="5" />
        <path d="M5 27c0-5.5 5-9 11-9s11 3.5 11 9" />
      </svg>
    ),
  },
  {
    title: "תשלום מאובטח",
    desc: "הצפנה ברמה בנקאית",
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M16 4l11 4v8c0 7-5 12-11 13-6-1-11-6-11-13V8z" />
        <path d="M11 16l4 4 6-7" />
      </svg>
    ),
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.valueProps}>
        <div className={styles.valuePropsInner}>
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className={styles.prop}>
              <div className={styles.propIcon}>{prop.icon}</div>
              <div>
                <div className={styles.propTitle}>{prop.title}</div>
                <div className={styles.propDesc}>{prop.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.col}>
            <h4 className={styles.brandName}>{SITE_NAME}</h4>
            <p className={styles.tagline}>
              בוטיק בשמים יוקרתי. אנו בוחרים בקפידה את הניחוחות המעודנים ביותר
              עבור לקוחותינו.
            </p>
          </div>

          <div className={styles.col}>
            <h4>חנות</h4>
            <ul>
              <li>
                <Link href="/category/all">כל הבשמים</Link>
              </li>
              <li>
                <Link href="/category/men">לגבר</Link>
              </li>
              <li>
                <Link href="/category/women">לאישה</Link>
              </li>
              <li>
                <Link href="/category/unisex">יוניסקס</Link>
              </li>
              <li>
                <Link href="/category/budget">בשמים עד 150 ש&quot;ח</Link>
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
          <span>
            © {year} {SITE_NAME}. כל הזכויות שמורות.
          </span>
          <span className={styles.payments}>
            תשלום מאובטח בכרטיס אשראי דרך PayPlus
          </span>
        </div>
      </div>
    </footer>
  );
}
