import Link from "next/link";
import { Button } from "@/components/Button";
import { getHeroBackgroundImages } from "@/lib/siteSettings";
import { HeroBackground } from "./HeroBackground";
import styles from "./Hero.module.scss";

export async function Hero() {
  const { desktop, mobile } = await getHeroBackgroundImages();
  const mobileForDeck = mobile.length ? mobile : desktop;

  return (
    <section className={styles.hero} aria-label="ברוכים הבאים">
      <HeroBackground desktopImages={desktop} mobileImages={mobileForDeck} />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.contentInner}>
          <span className={styles.kicker}>קולקציה חדשה</span>
          <h1 className={styles.title}>הנוכחות שלך מתחילה עוד לפני שאמרת מילה</h1>
          <p className={styles.subtitle}>
            המותגים הגדולים, המחירים הקטנים. רק בשמים מקוריים באחריות
          </p>
          <div className={styles.actions}>
            <Link href="/category/women">
              <Button variant="secondary" size="md">
                גלו את הקולקציה
              </Button>
            </Link>
            <Link href="/about" className={styles.ghostLink}>
              קראו את הסיפור
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
