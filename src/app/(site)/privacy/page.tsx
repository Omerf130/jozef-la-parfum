import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/styles/legal-page.module.scss";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "jozef la perfume";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: `מדיניות הפרטיות של ${SITE_NAME} – איסוף מידע, שימוש וזכויות`,
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.kicker}>משפטי</span>
        <h1>מדיניות פרטיות</h1>
      </header>

      <p className={styles.notice}>
        מסמך זה נועד למטרות מידע כלליות בלבד ואינו מהווה ייעוץ משפטי. יש להתאים
        אותו לעסק שלכם ולחוק הגנת הפרטיות, התשמ&quot;א–1981, ולתקנות הרלוונטיות,
        בהכוונת עורך דין. עדכון אחרון: מאי 2026.
      </p>

      <section className={styles.section}>
        <h2>1. מבוא</h2>
        <p>
          {SITE_NAME} (להלן: &quot;אנחנו&quot;, &quot;החנות&quot;) מכבדת את
          פרטיותכם. מדיניות זו מתארת אילו מידעים אנו אוספים, למה משתמשים בהם
          ומהן זכויותיכם בעת שימוש באתר ובשירותי המכירה.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. איזה מידע אנו אוספים</h2>
        <ul>
          <li>
            <strong>פרטי קשר והזמנה:</strong> שם, דוא&quot;ל, טלפון, כתובת למשלוח,
            פרטי העגלה וההזמנה.
          </li>
          <li>
            <strong>נתוני תשלום:</strong> העיבוד מתבצע על ידי ספק סליקה חיצוני; לא
            נשמרים אצלנו מספרי כרטיס מלאים.
          </li>
          <li>
            <strong>תקשורת:</strong> תוכן שתשלחו בטפסי יצירת קשר או במייל.
          </li>
          <li>
            <strong>נתונים טכניים:</strong> לרבות כתובת IP, סוג דפדפן ועוגיות
            (ראו סעיף 5).
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>3. מטרות השימוש במידע</h2>
        <ul>
          <li>ביצוע והשלמת הזמנות, משלוח ושירות לקוחות.</li>
          <li>שליחת עדכונים על ההזמנה ובהתאם להסכמתכם – דיוור שיווקי.</li>
          <li>שיפור האתר, אבטחה, ומניעת הונאות.</li>
          <li>עמידה בדרישות חוק.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>4. שיתוף מידע עם צדדים שלישיים</h2>
        <p>
          אנו עשויים לשתף מידע עם ספקים הנדרשים להפעלת החנות, בכפוף להסכמים
          והתחייבויות סודיות:
        </p>
        <ul>
          <li>ספק תשלומים (למשל PayPlus) לצורך סליקה.</li>
          <li>ספק דוא&quot;ל (למשל Resend) לשליחת אישורי הזמנה.</li>
          <li>ספק אחסון תמונות או תשתית אחסון (למשל Vercel Blob) במידת הצורך.</li>
          <li>רשויות מוסמכות כאשר הדין מחייב.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>5. עוגיות (Cookies)</h2>
        <p>
          האתר עשוי להשתמש בעוגיות וטכנולוגיות דומות לצורך תפקוד בסיסי, העדפות
          ואנליטיקה. ניתן לנהל העדפות עוגיות בהגדרות הדפדפן. אי־קבלת עוגיות
          מסוימות עלולה להשפיע על חוויית השימוש.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. שמירת מידע ואבטחה</h2>
        <p>
          אנו נוקטים באמצעים סבירים להגנה על המידע. אין אבטחה מוחלטת באינטרנט;
          השימוש באתר הוא באחריותכם במידה סבירה.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. זכויותיכם</h2>
        <p>
          בהתאם לדין, ייתכן שתהיו זכאים לעיין במידע האישי, לתקנו, למחוק או להגביל
          עיבוד, או להתנגד לעיבוד מסוים. לפניות בנושא ניתן לפנות דרך{" "}
          <Link href="/contact">עמוד צור קשר</Link>.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. קטינים</h2>
        <p>
          האתר אינו מיועד לקטינים מתחת לגיל 18 ללא הסכמת הורה. אם נודע לכם על מידע
          שנאסף שלא כדין מקטין, אנא פנו אלינו.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. שינויים במדיניות</h2>
        <p>
          ייתכנו עדכונים למדיניות זו. תאריך העדכון יצוין למעלה; המשך שימוש באתר
          לאחר עדכון מהווה הסכמה לשינויים מהותיים, ככל שהדין מתיר.
        </p>
      </section>

      <section className={styles.section}>
        <h2>10. יצירת קשר</h2>
        <p>
          לשאלות על פרטיות ועיבוד מידע אישי ניתן לפנות אלינו דרך{" "}
          <Link href="/contact">עמוד צור קשר</Link>.
        </p>
      </section>
    </article>
  );
}
