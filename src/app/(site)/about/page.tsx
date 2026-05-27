import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getShippingConfig } from "@/lib/siteSettings";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "אודות",
  description:
    "Jozef La Parfum — מותגים ומחירים של פעם בחיים, מקורי בלבד. כל מותגי הבישום תחת קורת גג אחת.",
};

function FaqItem({ question, answer }: { question: string; answer: ReactNode }) {
  return (
    <div className={styles.faqItem}>
      <h3 className={styles.faqQ}>{question}</h3>
      <div className={styles.faqA}>{answer}</div>
    </div>
  );
}

export default async function AboutPage() {
  const { shippingPriceILS, freeShippingThreshold } = await getShippingConfig();
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.kicker}>אודות</span>
        <h1>Jozef La Parfum</h1>
        <p>מותגים ומחירים של פעם בחיים. מקורי בלבד.</p>
        <p>
          כל מותגי הבישום תחת קורת גג אחת , מהיוקרה ועד היום יום , מקוריים בלבד ,
          ובמחירים נגישים .
        </p>
      </header>

      <section className={styles.section}>
        <p>
          ב-Jozef La Parfum, המטרה שלנו היא פשוטה: להנגיש את עולם הבישום לכולם.
          בנינו עבורכם נבחרת בשמים ענקית שכוללת את מותגי העל היוקרתיים לצד
          הבשמים האהובים והמוכרים, כך שכל אחד יכול למצוא את הניחוח המדויק עבורו.
        </p>
        <p>
          אנחנו לא מתפשרים על האיכות: כל בקבוק באתר הוא 100% מקורי ובאחריות מלאה.
          בזכות שיטת עבודה חכמה, אנחנו מצליחים להציע לכם את המחירים ההוגנים ביותר
          בשוק, בלי אותיות קטנות ובלי פערי תיווך מיותרים. יוקרתי או יומיומי, קלאסי
          או נועז – ב-Jozef La Parfum אתם תמיד מקבלים את המקסימום במחיר המינימלי.
        </p>
      </section>

      <section className={styles.section}>
        <h2>שאלות תשובות</h2>
        <FaqItem
          question="האם אתם מקוריים ?"
          answer={
            <p>
              תשובה : כן מקוריים , מייבאים את הבשמים שלנו מיבואן רישמי ומקביל .
            </p>
          }
        />
        <FaqItem
          question="תוך כמה זמן אפשר להחזיר בושם ?"
          answer={
            <p>
              תשובה : ניתן להחזיר בושם עד 14 ימי עסקים כל עוד האריזה המקורית לא
              נפתחה ולא נעשה שימוש בבושם בעלות נמוכה מצד הלקוח ונדאג לשליח שיגיע
              עד אליכם לאיסוף ההחזרה .
            </p>
          }
        />
        <FaqItem
          question="תוך כמה זמן המשלוח מגיע ?"
          answer={<p>תשובה : עד 7 ימי עסקים לא כולל שישי שבת וחגים.</p>}
        />
        <FaqItem
          question="מה עלויות המשלוח ?"
          answer={<p>תשובה : {shippingPriceILS} שקלים למשלוח, משלוח חינם בקנייה מעל {freeShippingThreshold}.</p>}
        />
        <FaqItem
          question="האם בטוח לשלם אצלכם ?"
          answer={<p>תשובה : כן בטח, התשלום אצלנו מאובטח ומתבצע דרך חברת pay plus.</p>}
        />
        <FaqItem
          question="האם יש לכם חנות פיזית שאפשר להגיע ולהתרשם ?"
          answer={<p>תשובה : אנחנו כרגע אתר אונליין בלבד .</p>}
        />
        <FaqItem
          question="האם אפשר למצוא אצלכם בשמים שלא נמצאים באתר ?"
          answer={
            <p>
              תשובה : כן , הלקוחות מוזמנים ליצור עימנו קשר לגבי בושם שלא באתר ,
              אנו נעשה את מירב המאמצים כדי להשיג לו את מבוקשתו .
            </p>
          }
        />
        <FaqItem
          question="ניתן ליצור איתכם לגבי התייעצות וכל דבר אחר ?"
          answer={
            <>
              <p>תשובה : כמובן ,</p>
              <p>מספר טלפון ובוואצפ :</p>
              <p>
                אימייל :{" "}
                <a href="mailto:jozeflaperfume@gmail.com">jozeflaperfume@gmail.com</a>
              </p>
            </>
          }
        />
        <FaqItem
          question="האם בטוח לקנות אצלכם :"
          answer={
            <p>
              כמובן , תשלום מאובטח בכרטיס אשראי דרך חברת PAYPLUS . (אוסיף עוד כמה
              שאלות בהמשך)
            </p>
          }
        />
      </section>
    </article>
  );
}
