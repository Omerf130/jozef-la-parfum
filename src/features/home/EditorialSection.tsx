import Image from "next/image";
import { getShippingConfig } from "@/lib/siteSettings";
import styles from "./EditorialSection.module.scss";

export async function EditorialSection() {
  const { freeShippingThreshold } = await getShippingConfig();
  return (
    <section className={styles.editorial}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <h2>חתימת הריח שלכם</h2>
          <p>
            הניחוח הנכון משאיר רושם שאי אפשר לשכוח. ב-Jozef La Parfum אנו
            מביאים אליכם קולקציה מעודנת של בשמי בוטיק מכל רחבי העולם, שנבחרו
            אחד-אחד בקפידה יתרה. המומחים שלנו ילוו אתכם באופן אישי, כדי להתאים
            לכם ניחוח בלעדי שמרגיש כאילו נרקח במיוחד עבורכם.
          </p>
          <ul className={styles.list}>
            <li>
              <strong>בשמים מקוריים</strong>
              <span>אך ורק מהיבואנים הרשמיים</span>
            </li>
            <li>
              <strong>משלוח עד הבית</strong>
              <span>חינם בהזמנות מעל ₪{freeShippingThreshold} · עד 7 ימי עסקים</span>
            </li>
            <li>
              <strong>תשלום מאובטח</strong>
              <span>תקן PCI ע&quot;י PayPlus</span>
            </li>
          </ul>
        </div>
        <div className={styles.imageCol}>
          <Image
            src="/editorial-perfume.jpg"
            alt="בשמי בוטיק יוקרתיים"
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
