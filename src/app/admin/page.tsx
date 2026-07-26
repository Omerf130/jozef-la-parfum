import Link from "next/link";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { ProductModel } from "@/models/Product";
import { formatILS } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { AdminOrderList } from "@/features/admin/orders/AdminOrderList";
import { AdminStatusBadge } from "@/features/admin/ui/AdminStatusBadge";
import { stockVariant } from "@/features/admin/ui/statusBadgeMaps";
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
            <EmptyState
              title="אין הזמנות עדיין"
              description="הזמנות חדשות יופיעו כאן."
              action={
                <Link href="/admin/orders">
                  <Button variant="ghost">לרשימת הזמנות</Button>
                </Link>
              }
            />
          ) : (
            <AdminOrderList
              compact
              orders={recentOrders.map((o) => ({
                _id: String(o._id),
                customerName: o.customerName,
                customerEmail: o.customerEmail,
                paymentStatus: o.paymentStatus,
                orderStatus: o.orderStatus,
                total: o.total,
                createdAt: o.createdAt,
              }))}
            />
          )}
        </section>

        <section className={styles.card}>
          <header>
            <h2>מלאי נמוך</h2>
            <Link href="/admin/products">ניהול מוצרים</Link>
          </header>
          {lowStock.length === 0 ? (
            <EmptyState
              title="מלאי תקין"
              description="כל המוצרים במלאי תקין."
            />
          ) : (
            <ul className={styles.list}>
              {lowStock.map((p) => {
                const stock = p.totalStock as number;
                const variant = stockVariant(stock);
                return (
                  <li key={String(p._id)}>
                    <Link href={`/admin/products/${String(p._id)}`}>
                      {p.brand} {p.name}
                    </Link>
                    <span className={styles.stockMeta}>
                      {variant ? (
                        <AdminStatusBadge variant={variant} />
                      ) : null}
                      <span className={styles.stockCount}>{stock} ביחידות</span>
                    </span>
                  </li>
                );
              })}
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
