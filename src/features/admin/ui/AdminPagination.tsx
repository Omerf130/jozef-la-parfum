import Link from "next/link";
import { buildProductsListUrl } from "@/features/admin/products/buildProductsListUrl";
import styles from "./AdminPagination.module.scss";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  q?: string;
}

export function AdminPagination({ page, totalPages, q }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const prevHref =
    page > 1
      ? buildProductsListUrl({ q, page: page - 1 })
      : undefined;
  const nextHref =
    page < totalPages
      ? buildProductsListUrl({ q, page: page + 1 })
      : undefined;

  return (
    <nav className={styles.pagination} aria-label="עימוד רשימת מוצרים">
      {prevHref ? (
        <Link href={prevHref} className={styles.pageBtn}>
          הקודם
        </Link>
      ) : (
        <span className={`${styles.pageBtn} ${styles.disabled}`} aria-disabled="true">
          הקודם
        </span>
      )}

      <span className={styles.current}>
        עמוד {page} מתוך {totalPages}
      </span>

      {nextHref ? (
        <Link href={nextHref} className={styles.pageBtn}>
          הבא
        </Link>
      ) : (
        <span className={`${styles.pageBtn} ${styles.disabled}`} aria-disabled="true">
          הבא
        </span>
      )}
    </nav>
  );
}
