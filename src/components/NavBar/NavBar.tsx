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

export function NavBar() {
  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <MobileMenu links={NAV_LINKS} />
        <Link href="/" className={styles.brand} aria-label={SITE_NAME}>
          <span className={styles.brandMark}>J</span>
          <span className={styles.brandName}>{SITE_NAME}</span>
        </Link>
        <nav className={styles.links} aria-label="ניווט ראשי">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <CartIndicator />
        </div>
      </div>
    </header>
  );
}
