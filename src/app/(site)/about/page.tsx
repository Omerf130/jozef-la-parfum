import type { Metadata } from "next";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "אודות",
  description: "סיפורו של בוטיק הבשמים היוקרתי שלנו, הצוות והשיטה.",
};

export default function AboutPage() {
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.kicker}>הסיפור שלנו</span>
        <h1>בוטיק של ניחוחות, סיפור של אהבה</h1>
        <p>
          לפני יותר מעשור התאהבנו בבשמים. לא בטרנדים — בריחות שמספרים סיפורים,
          באמנות הניחוח שעוברת מדור לדור. הבוטיק שלנו הוא ביטוי לאהבה הזו.
        </p>
      </header>

      <section className={styles.section}>
        <h2>הפילוסופיה</h2>
        <p>
          אנו מאמינים שניחוח הוא יותר מאקסיסור — הוא חתימה אישית. כל בקבוק שאנו
          מציעים נבחר בקפידה אחר ביקורים אישיים בבתי הבושם המובילים בעולם — מצרפת
          ועד המזרח התיכון. אנחנו לא עובדים עם כל מותג. אנחנו עובדים רק עם מי
          שמייצר ניחוחות שמרגשים אותנו.
        </p>
      </section>

      <section className={styles.section}>
        <h2>השיטה</h2>
        <ol>
          <li>
            <strong>מקור.</strong> כל בושם מגיע ישירות מהיבואן הרשמי, עם ערבויות
            מקור.
          </li>
          <li>
            <strong>בחירה.</strong> פרפיומרים מנוסים בודקים כל ניחוח לפני שהוא
            מגיע למדפים.
          </li>
          <li>
            <strong>הגשה.</strong> אריזה אלגנטית, יחס אישי ושירות שיגרום לכם
            לחזור.
          </li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>הבטחת הבוטיק</h2>
        <ul className={styles.bullets}>
          <li>בשמים מקוריים בלבד</li>
          <li>משלוח מאובטח לכל הארץ</li>
          <li>ייעוץ אישי ללא עלות</li>
          <li>מדיניות החזרה הוגנת</li>
        </ul>
      </section>
    </article>
  );
}
