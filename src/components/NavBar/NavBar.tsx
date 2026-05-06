import Link from "next/link";
import { CartIndicator } from "./CartIndicator";
import { MobileMenu } from "./MobileMenu";
import styles from "./NavBar.module.scss";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Jozef La Parfum";

const NAV_LINKS = [
  { href: "/", label: "בית" },
  { href: "/category/men", label: "לגבר" },
  { href: "/category/women", label: "לאישה" },
  { href: "/category/unisex", label: "יוניסקס" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צור קשר" },
];

const ANNOUNCEMENTS = [
  "משלוח חינם בהזמנה מעל ₪350",
  "החזרות והחלפות עד 14 יום",
  "תשלומים ללא ריבית",
];

export function NavBar() {
  return (
    <>
      <div className={styles.announce} aria-label="הודעות מהמותג">
        <div className={styles.announceTrack}>
          {ANNOUNCEMENTS.map((msg, i) => (
            <span key={i} className={styles.announceItem}>
              {msg}
            </span>
          ))}
        </div>
      </div>
      <header className={styles.nav}>
        <div className={styles.brandRow}>
          <div className={styles.inner}>
            <div className={styles.left}>
              <MobileMenu links={NAV_LINKS} />
            </div>
            <Link href="/" className={styles.brand} aria-label={SITE_NAME}>
              <span className={styles.brandName}>{SITE_NAME}</span>
            </Link>
            <div className={styles.actions}>
              <CartIndicator />
            </div>
          </div>
        </div>
        <nav className={styles.links} aria-label="ניווט ראשי">
          {NAV_LINKS.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
