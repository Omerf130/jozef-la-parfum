import styles from "./EditorialSection.module.scss";

export function EditorialSection() {
  return (
    <section className={styles.editorial}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <span className={styles.kicker}>מסורת ויוקרה</span>
          <h2>אמנות הניחוח</h2>
          <p>
            כל בקבוק שאנו מציעים נבחר בקפידה רבה. אנו עובדים עם בתי הבושם
            המובילים בעולם — מצרפת, מאיטליה ומהמזרח התיכון — כדי להביא לישראל את
            הניחוחות הנדירים והמעודנים ביותר.
          </p>
          <p>
            הצוות שלנו, בראשות פרפיומרים מנוסים, יסייע לכם לגלות את הניחוח שמספר
            את הסיפור שלכם — בהתאמה אישית, באהבה ובסבלנות.
          </p>
          <ul className={styles.list}>
            <li>
              <strong>בשמים מקוריים</strong>
              <span>אך ורק מהיבואנים הרשמיים</span>
            </li>
            <li>
              <strong>משלוח עד הבית</strong>
              <span>חינם בהזמנות מעל ₪499 · עד 7 ימי עסקים</span>
            </li>
            <li>
              <strong>תשלום מאובטח</strong>
              <span>תקן PCI ע&quot;י PayPlus</span>
            </li>
          </ul>
        </div>
        <div className={styles.imageCol} aria-hidden="true">
          <div className={styles.image} />
          <div className={styles.imageAccent} />
        </div>
      </div>
    </section>
  );
}
