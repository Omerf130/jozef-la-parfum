import Link from "next/link";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { AdminOrderList } from "@/features/admin/orders/AdminOrderList";
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

  const orderRows = orders.map((o) => ({
    _id: String(o._id),
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    total: o.total,
    createdAt: o.createdAt,
  }));

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>הזמנות</h1>
        <p>{orders.length} הזמנות</p>
      </header>

      <nav className={styles.tabs} aria-label="סינון לפי סטטוס">
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
        <EmptyState
          title="אין הזמנות"
          description={
            sp.status
              ? "אין הזמנות במצב זה."
              : "עוד לא הגיעו הזמנות."
          }
          action={
            sp.status ? (
              <Link href="/admin/orders">
                <Button variant="ghost">הצג את כל ההזמנות</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <AdminOrderList orders={orderRows} />
      )}
    </div>
  );
}
