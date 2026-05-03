import Link from "next/link";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { formatILS, formatDateHe } from "@/lib/format";
import styles from "./page.module.scss";

export default async function AdminDashboardPage() {
  await connectDB();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [ordersToday, ordersWeek, paidWeekAgg, lowStock, recentOrders, totalProducts] =
    await Promise.all([
      OrderModel.countDocuments({ createdAt: { $gte: startOfDay } }),
      OrderModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfWeek },
            paymentStatus: "paid",
          },
        },
        { $group: { _id: null, sum: { $sum: "$total" } } },
      ]),
      ProductModel.aggregate([
        { $match: { isActive: true } },
        {
          $project: {
            name: 1,
            brand: 1,
            slug: 1,
            totalStock: { $sum: "$sizes.stock" },
          },
        },
        { $match: { totalStock: { $lte: 5 } } },
        { $sort: { totalStock: 1 } },
        { $limit: 6 },
      ]),
      OrderModel.find().sort({ createdAt: -1 }).limit(8).lean(),
      ProductModel.countDocuments({ isActive: true }),
    ]);

  const revenueWeek = paidWeekAgg[0]?.sum ?? 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>סקירה</h1>
        <p>תמונת מצב על הבוטיק שלך.</p>
      </header>

      <div className={styles.stats}>
        <Stat label="הזמנות היום" value={String(ordersToday)} />
        <Stat label="הזמנות השבוע" value={String(ordersWeek)} />
        <Stat label="הכנסות השבוע" value={formatILS(revenueWeek)} />
        <Stat label="מוצרים פעילים" value={String(totalProducts)} />
      </div>

      <div className={styles.layout}>
        <section className={styles.card}>
          <header>
            <h2>הזמנות אחרונות</h2>
            <Link href="/admin/orders">צפה בכל ההזמנות</Link>
          </header>
          {recentOrders.length === 0 ? (
            <p className={styles.empty}>אין הזמנות עדיין.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>מס׳</th>
                  <th>לקוח</th>
                  <th>סטטוס</th>
                  <th>סכום</th>
                  <th>תאריך</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={String(o._id)}>
                    <td>
                      <Link href={`/admin/orders/${String(o._id)}`}>
                        #{String(o._id).slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td>{o.customerName}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[o.paymentStatus]}`}>
                        {paymentLabel(o.paymentStatus)}
                      </span>
                    </td>
                    <td>{formatILS(o.total)}</td>
                    <td>{formatDateHe(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={styles.card}>
          <header>
            <h2>מלאי נמוך</h2>
            <Link href="/admin/products">ניהול מוצרים</Link>
          </header>
          {lowStock.length === 0 ? (
            <p className={styles.empty}>כל המוצרים במלאי תקין.</p>
          ) : (
            <ul className={styles.list}>
              {lowStock.map((p) => (
                <li key={String(p._id)}>
                  <Link href={`/admin/products/${String(p._id)}`}>
                    {p.brand} {p.name}
                  </Link>
                  <span>{p.totalStock} ביחידות</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function paymentLabel(s: string): string {
  switch (s) {
    case "paid":
      return "שולם";
    case "pending":
      return "ממתין";
    case "failed":
      return "נכשל";
    case "refunded":
      return "זוכה";
    default:
      return s;
  }
}
