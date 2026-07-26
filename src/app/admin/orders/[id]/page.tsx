import Link from "next/link";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { serializeOrder } from "@/lib/serializers";
import { formatILS, formatDateHe, formatPhoneHe } from "@/lib/format";
import { OrderStatusEditor } from "@/features/admin/OrderStatusEditor";
import { AdminBreadcrumbs } from "@/features/admin/ui/AdminBreadcrumbs";
import { AdminStatusBadge } from "@/features/admin/ui/AdminStatusBadge";
import {
  orderStatusVariant,
  paymentStatusVariant,
} from "@/features/admin/ui/statusBadgeMaps";
import styles from "./page.module.scss";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectDB();
  const doc = await OrderModel.findById(id).lean();
  if (!doc) notFound();
  const order = serializeOrder(doc);
  const orderLabel = `#${order._id.slice(-8).toUpperCase()}`;
  const floorApartmentParts = [
    order.shippingAddress.floor ? `קומה ${order.shippingAddress.floor}` : "",
    order.shippingAddress.apartment ? `דירה ${order.shippingAddress.apartment}` : "",
  ].filter(Boolean);

  return (
    <div className={styles.page}>
      <AdminBreadcrumbs
        items={[
          { label: "ניהול", href: "/admin" },
          { label: "הזמנות", href: "/admin/orders" },
          { label: `הזמנה ${orderLabel}` },
        ]}
      />
      <header className={styles.head}>
        <Link href="/admin/orders" className={styles.back}>
          → חזרה לרשימה
        </Link>
        <h1>הזמנה {orderLabel}</h1>
        <p>{formatDateHe(order.createdAt)}</p>
        <div className={styles.statusBadges}>
          <AdminStatusBadge variant={paymentStatusVariant(order.paymentStatus)} />
          <AdminStatusBadge variant={orderStatusVariant(order.orderStatus)} />
        </div>
      </header>

      <div className={styles.topGrid}>
        <section className={styles.card}>
          <h2>פרטי לקוח</h2>
          <dl className={styles.dl}>
            <dt>שם</dt>
            <dd>{order.customerName}</dd>
            <dt>דוא&quot;ל</dt>
            <dd>
              <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
            </dd>
            <dt>טלפון</dt>
            <dd>
              <a href={`tel:${order.customerPhone}`}>{formatPhoneHe(order.customerPhone)}</a>
            </dd>
          </dl>
        </section>

        <section className={styles.card}>
          <h2>משלוח</h2>
          <dl className={styles.dl}>
            <dt>כתובת</dt>
            <dd>
              {order.shippingAddress.street}
              {floorApartmentParts.length > 0 ? (
                <>
                  <br />
                  {floorApartmentParts.join(", ")}
                </>
              ) : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.zip}
              <br />
              {order.shippingAddress.country}
            </dd>
          </dl>
        </section>
      </div>

      <section className={styles.card}>
        <h2>תשלום וסטטוס</h2>
        <OrderStatusEditor
          orderId={order._id}
          paymentStatus={order.paymentStatus}
          orderStatus={order.orderStatus}
        />
        {order.paymentTransactionId ? (
          <p className={styles.txn} title={order.paymentTransactionId}>
            מזהה עסקה: {order.paymentTransactionId}
          </p>
        ) : null}
        {order.payplusPageUid ? (
          <p className={styles.txn} title={order.payplusPageUid}>
            PayPlus UID: {order.payplusPageUid}
          </p>
        ) : null}
      </section>

      <section className={styles.card}>
        <h2>פריטים בהזמנה</h2>

        <div className={styles.itemsDesktop}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th scope="col">פריט</th>
                <th scope="col">גודל</th>
                <th scope="col">כמות</th>
                <th scope="col">מחיר</th>
                <th scope="col">סה&quot;כ</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={`${it.productId}-${i}`}>
                  <td>{it.name}</td>
                  <td>{it.ml} מ&quot;ל</td>
                  <td>{it.quantity}</td>
                  <td>{formatILS(it.unitPrice)}</td>
                  <td>{formatILS(it.unitPrice * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={styles.itemsMobile}>
          {order.items.map((it, i) => (
            <li key={`${it.productId}-${i}-m`} className={styles.itemCard}>
              <p className={styles.itemName}>{it.name}</p>
              <div className={styles.itemMeta}>
                <span>{it.ml} מ&quot;ל</span>
                <span>× {it.quantity}</span>
                <span>{formatILS(it.unitPrice)}</span>
              </div>
              <p className={styles.itemLineTotal}>
                סה&quot;כ: {formatILS(it.unitPrice * it.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.card} ${styles.totalsCard}`}>
        <h2>סיכום</h2>
        <div className={styles.totals}>
          <div>
            <span>סכום ביניים</span>
            <span>{formatILS(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 ? (
            <div>
              <span>
                הנחה
                {order.couponCode ? ` (${order.couponCode})` : ""}
                {order.couponAppliesTo === "shipping" ? " על משלוח" : " על מוצרים"}
              </span>
              <span>-{formatILS(order.discountAmount)}</span>
            </div>
          ) : null}
          <div>
            <span>משלוח</span>
            <span>{formatILS(order.shippingPrice)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>סה&quot;כ</span>
            <span>{formatILS(order.total)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
