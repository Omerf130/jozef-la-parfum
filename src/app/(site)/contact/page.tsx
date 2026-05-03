import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/ContactForm";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "צור קשר",
  description: "השאירו לנו הודעה ונחזור אליכם בהקדם.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.info}>
          <span className={styles.kicker}>צרו קשר</span>
          <h1>נשמח לשמוע מכם</h1>
          <p>
            יש לכם שאלה על בושם מסוים? צריכים ייעוץ? רוצים להזמין מתנה
            מותאמת אישית? אנחנו כאן.
          </p>

          <ul className={styles.contactList}>
            <li>
              <span className={styles.label}>טלפון</span>
              <a href="tel:+97231234567">03-123-4567</a>
            </li>
            <li>
              <span className={styles.label}>דוא&quot;ל</span>
              <a href="mailto:info@example.com">info@example.com</a>
            </li>
            <li>
              <span className={styles.label}>שעות פעילות</span>
              <span>א&apos;-ה&apos; 09:00–18:00 · ו&apos; 09:00–13:00</span>
            </li>
            <li>
              <span className={styles.label}>כתובת</span>
              <span>רחוב הבוטיק 1, תל אביב</span>
            </li>
          </ul>
        </aside>

        <section className={styles.formCol}>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
