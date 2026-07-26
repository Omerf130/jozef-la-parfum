"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "./AdminShell.module.scss";

const NAV = [
  { href: "/admin", label: "סקירה" },
  { href: "/admin/hero", label: "באנר ראשי" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/coupons", label: "קופונים" },
  { href: "/admin/newsletter", label: "מועדון" },
  { href: "/admin/settings", label: "הגדרות" },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AdminShellClientProps {
  email: string;
  children: React.ReactNode;
  logoutAction: () => Promise<void>;
}

export function AdminShellClient({
  email,
  children,
  logoutAction,
}: AdminShellClientProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const currentPage =
    NAV.find((n) => isNavActive(pathname, n.href))?.label ?? "ניהול";

  const renderNavLinks = (onNavigate?: () => void) =>
    NAV.map((n) => {
      const active = isNavActive(pathname, n.href);
      return (
        <Link
          key={n.href}
          href={n.href}
          className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
        >
          {n.label}
        </Link>
      );
    });

  const renderFooter = () => (
    <div className={styles.bottom}>
      <Link href="/" className={styles.viewSite}>
        ← לאתר
      </Link>
      <span className={styles.email}>{email}</span>
      <form action={logoutAction}>
        <button type="submit" className={styles.logout}>
          התנתק
        </button>
      </form>
    </div>
  );

  return (
    <div className={styles.shell}>
      <header className={styles.mobileHeader}>
        <Link href="/admin" className={styles.headerBrand}>
          <span className={styles.brandMark}>J</span>
          <span className={styles.headerTitle}>{currentPage}</span>
        </Link>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="פתח תפריט"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <span className={styles.menuIcon} aria-hidden="true" />
        </button>
      </header>

      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandMark}>J</span>
          <span>ניהול</span>
        </Link>
        <nav className={styles.nav}>{renderNavLinks()}</nav>
        {renderFooter()}
      </aside>

      {drawerOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="סגור תפריט"
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="תפריט ניווט"
        aria-hidden={!drawerOpen}
      >
        <div className={styles.drawerHead}>
          <span className={styles.drawerTitle}>תפריט</span>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="סגור תפריט"
            onClick={closeDrawer}
          >
            ×
          </button>
        </div>
        <nav className={styles.drawerNav}>{renderNavLinks(closeDrawer)}</nav>
        {renderFooter()}
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
