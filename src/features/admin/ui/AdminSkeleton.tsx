import styles from "./AdminSkeleton.module.scss";

export function AdminDashboardSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="טוען לוח בקרה">
      <div>
        <div className={styles.title} />
        <div className={styles.subtitle} />
      </div>
      <div className={styles.statGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.stat}>
            <div className={styles.statLabel} />
            <div className={styles.statValue} />
          </div>
        ))}
      </div>
      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <div className={styles.cardTitle} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.row} />
          ))}
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.row} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminProductsListSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="טוען מוצרים">
      <div className={styles.title} />
      <div className={styles.toolbar}>
        <div className={styles.search} />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.row} />
      ))}
    </div>
  );
}

export function AdminOrdersListSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="טוען הזמנות">
      <div className={styles.title} />
      <div className={styles.toolbar}>
        <div className={styles.search} style={{ width: "100%", maxWidth: 480 }} />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.row} />
      ))}
    </div>
  );
}
