import Link from "next/link";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { formatILS, formatDateHe } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import styles from "./page.module.scss";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_FILTERS = [
  { value: "", label: "הכל" },
  { value: "new", label: "חדש" },
  { value: "processing", label: "בטיפול" },
  { value: "shipped", label: "נשלח" },
  { value: "delivered", label: "נמסר" },
  { value: "cancelled", label: "בוטל" },
];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (sp.status) filter.orderStatus = sp.status;

  const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>הזמנות</h1>
        <p>{orders.length} הזמנות</p>
      </header>

      <nav className={styles.tabs}>
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/orders?status=${f.value}` : "/admin/orders"}
            className={`${styles.tab} ${sp.status === f.value || (!sp.status && !f.value) ? styles.active : ""}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <EmptyState title="אין הזמנות" description="עוד לא הגיעו הזמנות במצב זה." />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>מס׳ הזמנה</th>
                <th>לקוח</th>
                <th>סטטוס תשלום</th>
                <th>סטטוס הזמנה</th>
                <th>סכום</th>
                <th>תאריך</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={String(o._id)}>
                  <td>
                    <Link href={`/admin/orders/${String(o._id)}`}>
                      #{String(o._id).slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td>
                    <div>{o.customerName}</div>
                    <small>{o.customerEmail}</small>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[o.paymentStatus]}`}>
                      {paymentLabel(o.paymentStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`os_${o.orderStatus}`]}`}>
                      {orderStatusLabel(o.orderStatus)}
                    </span>
                  </td>
                  <td>{formatILS(o.total)}</td>
                  <td>{formatDateHe(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function paymentLabel(s: string): string {
  return { paid: "שולם", pending: "ממתין", failed: "נכשל", refunded: "זוכה" }[s] || s;
}

function orderStatusLabel(s: string): string {
  return (
    {
      new: "חדש",
      processing: "בטיפול",
      shipped: "נשלח",
      delivered: "נמסר",
      cancelled: "בוטל",
    }[s] || s
  );
}
