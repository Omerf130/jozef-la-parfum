import Link from "next/link";
import { Button } from "@/components/Button";
import styles from "./AdminToolbar.module.scss";

interface AdminToolbarProps {
  q?: string;
  totalCount: number;
  addHref?: string;
  addLabel?: string;
}

export function AdminToolbar({
  q = "",
  totalCount,
  addHref = "/admin/products/new",
  addLabel = "+ הוסף מוצר",
}: AdminToolbarProps) {
  const hasSearch = q.trim().length >= 2;

  return (
    <div className={styles.toolbar}>
      <form method="get" action="/admin/products" className={styles.searchForm}>
        <input type="hidden" name="page" value="1" />
        <label className={styles.searchLabel} htmlFor="admin-products-search">
          חיפוש מוצרים
        </label>
        <div className={styles.searchRow}>
          <input
            id="admin-products-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="חיפוש לפי שם או יצרן…"
            className={styles.searchInput}
            autoComplete="off"
          />
          <button type="submit" className={styles.searchButton}>
            חפש
          </button>
        </div>
      </form>

      <div className={styles.actions}>
        <div className={styles.meta}>
          {hasSearch ? (
            <span className={styles.queryChip}>
              חיפוש: &quot;{q}&quot;
              <Link href="/admin/products" className={styles.clearSearch}>
                נקה
              </Link>
            </span>
          ) : null}
          <p className={styles.count}>{totalCount} מוצרים בסה&quot;כ</p>
        </div>
        <Link href={addHref} className={styles.addLink}>
          <Button variant="secondary" size="sm">
            {addLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
