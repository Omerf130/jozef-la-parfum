"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIndicator } from "./CartIndicator";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";
import { useHeaderScroll } from "./useHeaderScroll";
import styles from "./NavBar.module.scss";

interface NavLink {
  href: string;
  label: string;
}

interface NavBarChromeProps {
  siteName: string;
  announcements: string[];
  links: NavLink[];
}

export function NavBarChrome({ siteName, announcements, links }: NavBarChromeProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const scrolled = useHeaderScroll(24);

  const headerClass = [
    styles.nav,
    isHome ? styles.homeFixed : "",
    isHome && !scrolled ? styles.homeTransparent : "",
    isHome && scrolled ? styles.homeSolid : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {!isHome ? (
        <div className={styles.announce} aria-label="הודעות מהמותג">
          <div className={styles.announceTrack}>
            {announcements.map((msg, i) => (
              <span key={i} className={styles.announceItem}>
                {msg}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <header className={headerClass}>
        <div className={styles.brandRow}>
          <div className={styles.inner}>
            <div className={styles.left}>
              <MobileMenu links={links} />
            </div>
            <Link href="/" className={styles.brand} aria-label={siteName}>
              <span className={styles.brandName}>{siteName}</span>
            </Link>
            <div className={styles.actions}>
              <CartIndicator />
            </div>
          </div>
        </div>
        <nav className={styles.links} aria-label="ניווט ראשי">
          {links.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
          <SearchBar />
        </nav>
      </header>
    </>
  );
}
