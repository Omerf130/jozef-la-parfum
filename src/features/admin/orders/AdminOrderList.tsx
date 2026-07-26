import Link from "next/link";
import { formatILS, formatDateHe } from "@/lib/format";
import { AdminStatusBadge } from "@/features/admin/ui/AdminStatusBadge";
import {
  orderStatusVariant,
  paymentStatusVariant,
} from "@/features/admin/ui/statusBadgeMaps";
import listStyles from "@/features/admin/ui/admin-list.module.scss";
import { formatOrderId } from "@/features/admin/orders/orderLabels";
import styles from "./admin-orders.module.scss";

export interface AdminOrderRow {
  _id: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  orderStatus: string;
  total: number;
  createdAt: Date | string;
}

interface AdminOrderListProps {
  orders: AdminOrderRow[];
  /** Dashboard: shorter ID, fewer columns */
  compact?: boolean;
}

export function AdminOrderList({ orders, compact = false }: AdminOrderListProps) {
  return (
    <>
      <div className={listStyles.desktopOnly}>
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${compact ? styles.compactTable : ""}`}>
            <thead>
              <tr>
                <th scope="col">{compact ? "מס׳" : "מס׳ הזמנה"}</th>
                <th scope="col">לקוח</th>
                <th scope="col">{compact ? "סטטוס" : "סטטוס תשלום"}</th>
                {!compact ? <th scope="col">סטטוס הזמנה</th> : null}
                <th scope="col">סכום</th>
                <th scope="col">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link href={`/admin/orders/${o._id}`}>
                      {formatOrderId(o._id, compact)}
                    </Link>
                  </td>
                  <td>
                    {compact ? (
                      o.customerName
                    ) : (
                      <>
                        <div>{o.customerName}</div>
                        <small>{o.customerEmail}</small>
                      </>
                    )}
                  </td>
                  <td>
                    <AdminStatusBadge variant={paymentStatusVariant(o.paymentStatus)} />
                  </td>
                  {!compact ? (
                    <td>
                      <AdminStatusBadge variant={orderStatusVariant(o.orderStatus)} />
                    </td>
                  ) : null}
                  <td>{formatILS(o.total)}</td>
                  <td>{formatDateHe(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className={`${listStyles.mobileOnly} ${styles.cardList}`}>
        {orders.map((o) => (
          <li key={o._id} className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardOrderId}>
                <Link href={`/admin/orders/${o._id}`}>
                  {formatOrderId(o._id, compact)}
                </Link>
              </h3>
              <span className={styles.cardTotal}>{formatILS(o.total)}</span>
            </div>
            <p className={styles.cardCustomer}>{o.customerName}</p>
            {!compact ? (
              <p className={styles.cardEmail}>{o.customerEmail}</p>
            ) : null}
            <div className={styles.cardBadges}>
              <AdminStatusBadge variant={paymentStatusVariant(o.paymentStatus)} />
              {!compact ? (
                <AdminStatusBadge variant={orderStatusVariant(o.orderStatus)} />
              ) : null}
            </div>
            <div className={styles.cardMeta}>
              <span>{formatDateHe(o.createdAt)}</span>
              <Link href={`/admin/orders/${o._id}`} className={styles.cardAction}>
                פרטים
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
