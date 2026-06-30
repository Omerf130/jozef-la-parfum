import Link from "next/link";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { serializeOrder } from "@/lib/serializers";
import { formatILS, formatDateHe, formatPhoneHe } from "@/lib/format";
import { OrderStatusEditor } from "@/features/admin/OrderStatusEditor";
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
  const floorApartmentParts = [
    order.shippingAddress.floor ? `קומה ${order.shippingAddress.floor}` : "",
    order.shippingAddress.apartment ? `דירה ${order.shippingAddress.apartment}` : "",
  ].filter(Boolean);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <Link href="/admin/orders" className={styles.back}>
          → חזרה לרשימה
        </Link>
        <h1>הזמנה #{order._id.slice(-8).toUpperCase()}</h1>
        <p>{formatDateHe(order.createdAt)}</p>
      </header>

      <div className={styles.layout}>
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
            <dt>כתובת למשלוח</dt>
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

        <section className={styles.card}>
          <h2>סטטוסים</h2>
          <OrderStatusEditor
            orderId={order._id}
            paymentStatus={order.paymentStatus}
            orderStatus={order.orderStatus}
          />
          {order.paymentTransactionId ? (
            <p className={styles.txn}>מזהה עסקה: {order.paymentTransactionId}</p>
          ) : null}
          {order.payplusPageUid ? (
            <p className={styles.txn}>PayPlus UID: {order.payplusPageUid}</p>
          ) : null}
        </section>
      </div>

      <section className={styles.card}>
        <h2>פריטים בהזמנה</h2>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>פריט</th>
              <th>גודל</th>
              <th>כמות</th>
              <th>מחיר</th>
              <th>סה&quot;כ</th>
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
