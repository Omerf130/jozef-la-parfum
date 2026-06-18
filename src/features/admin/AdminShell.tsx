import Link from "next/link";
import styles from "./AdminShell.module.scss";

interface AdminShellProps {
  email: string;
  children: React.ReactNode;
  logoutAction: () => Promise<void>;
}

const NAV = [
  { href: "/admin", label: "סקירה" },
  { href: "/admin/hero", label: "באנר ראשי" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/coupons", label: "קופונים" },
  { href: "/admin/settings", label: "הגדרות" },
];

export function AdminShell({ email, children, logoutAction }: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandMark}>J</span>
          <span>ניהול</span>
        </Link>
        <nav className={styles.nav}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={styles.navLink}>
              {n.label}
            </Link>
          ))}
        </nav>
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
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
