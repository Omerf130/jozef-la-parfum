import { connectDB } from "@/lib/db";
import { NewsletterSubscriberModel } from "@/models/NewsletterSubscriber";
import { formatDateHe } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import styles from "../orders/page.module.scss";

export default async function AdminNewsletterPage() {
  await connectDB();
  const subscribers = await NewsletterSubscriberModel.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>מועדון</h1>
        <p>{subscribers.length} נרשמים</p>
      </header>

      {subscribers.length === 0 ? (
        <EmptyState
          title="אין נרשמים עדיין"
          description="כתובות דוא״ל מהטופס בדף הבית יופיעו כאן."
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>דוא&quot;ל</th>
                <th>תאריך הרשמה</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={String(s._id)}>
                  <td>
                    <a href={`mailto:${s.email}`}>{s.email}</a>
                  </td>
                  <td>{formatDateHe(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
