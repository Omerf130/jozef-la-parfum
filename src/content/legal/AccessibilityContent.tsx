import styles from "@/styles/legal-page.module.scss";
import { LegalEmailLink, LegalPhoneLink } from "./LegalContact";

const SITE_URL = "https://www.jozeflaperfume.co.il/";

export function AccessibilityContent() {
  return (
    <>
      <header className={styles.hero}>
        <span className={styles.kicker}>משפטי</span>
        <h1>הצהרת נגישות</h1>
        <p className={styles.updated}>תאריך עדכון אחרון: 23/07/2026</p>
      </header>

      <section className={styles.section}>
        <p>
          Jozef La Perfume (עוסק) (להלן: &quot;בית העסק&quot;), רואה חשיבות במתן
          שירות שוויוני ונגיש לכלל המשתמשים, לרבות אנשים עם מוגבלות.
        </p>
        <p>
          בית העסק פעל להנגשת אתר האינטרנט שכתובתו{" "}
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer">
            {SITE_URL}
          </a>{" "}
          (להלן: &quot;האתר&quot;), במטרה לאפשר למשתמשים להפיק תועלת מתכניו
          ומשירותיו באופן נוח ונגיש ככל האפשר.
        </p>
      </section>

      <section className={styles.section}>
        <h2>1. נגישות האתר</h2>
        <h3>1.1.</h3>
        <p>באתר מותקן תפריט נגישות הכולל את האפשרויות הבאות:</p>
        <ul>
          <li>שינוי הניגודיות;</li>
          <li>הדגשת קישורים;</li>
          <li>הגדלת הטקסט;</li>
          <li>שינוי ריווח הטקסט;</li>
          <li>ביטול הנפשות;</li>
          <li>הסתרת תמונות;</li>
          <li>תמיכה בדיסלקסיה;</li>
          <li>שינוי תצוגת הסמן;</li>
          <li>הצגת תיאורים;</li>
          <li>שינוי גובה השורה;</li>
          <li>שינוי יישור הטקסט;</li>
          <li>שינוי רוויית הצבעים.</li>
        </ul>
        <h3>1.2.</h3>
        <p>
          ניתן לפתוח את תפריט הנגישות באמצעות כפתור הנגישות המופיע באתר ולבחור
          בהתאמה הרצויה.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. שירות מקוון בלבד</h2>
        <h3>2.1.</h3>
        <p>
          פעילותו של בית העסק מתבצעת באמצעות האתר בלבד. בית העסק אינו מקבל קהל
          ואינו מספק שירות לציבור במקום פיזי.
        </p>
        <h3>2.2.</h3>
        <p>ניתן לקבל שירות ולפנות לבית העסק באמצעי הקשר המפורטים להלן.</p>
      </section>

      <section className={styles.section}>
        <h2>3. מגבלות נגישות</h2>
        <h3>3.1.</h3>
        <p>
          אם נתקלתם בקושי בגלישה באתר, בקבלת מידע או בביצוע פעולה, ניתן לפנות
          אלינו. אנו נעשה מאמץ סביר לבדוק את הפנייה, לטפל בבעיה ולהעמיד חלופה
          נגישה ככל שניתן ובהתאם להוראות הדין.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. דיווח על בעיית נגישות</h2>
        <h3>4.1.</h3>
        <p>לצורך טיפול יעיל בפנייה, מומלץ לציין, ככל שניתן:</p>
        <ul>
          <li>כתובת העמוד שבו התעוררה הבעיה;</li>
          <li>תיאור הפעולה שניסיתם לבצע;</li>
          <li>תיאור בעיית הנגישות;</li>
          <li>סוג הדפדפן וגרסתו;</li>
          <li>מערכת ההפעלה שבה נעשה שימוש;</li>
          <li>סוג הטכנולוגיה המסייעת שבה נעשה שימוש, ככל שנעשה.</li>
        </ul>
        <h3>4.2.</h3>
        <p>ניתן לפנות אל בית העסק בנושא נגישות באמצעות:</p>
        <ul>
          <li>
            בעל פה, באמצעות הטלפון <LegalPhoneLink />
          </li>
          <li>
            בדואר אלקטרוני, לכתובת <LegalEmailLink />.
          </li>
        </ul>
      </section>
    </>
  );
}
