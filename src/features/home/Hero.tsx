import Link from "next/link";
import { Button } from "@/components/Button";
import styles from "./Hero.module.scss";

export function Hero() {
  return (
    <section className={styles.hero} aria-label="ברוכים הבאים">
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <span className={styles.kicker}>קולקציה חדשה</span>
        <h1 className={styles.title}>
          ניחוחות נדירים
          <br />
          <em>שמספרים את סיפורך</em>
        </h1>
        <p className={styles.subtitle}>
          בוטיק בשמים יוקרתי. אוסף מעודן של בשמים נדירים, מבושם בקפידה אחר הנדירים
          ביותר.
        </p>
        <div className={styles.actions}>
          <Link href="/category/women">
            <Button variant="secondary" size="lg">
              גלו את הקולקציה
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="lg">
              קראו את הסיפור
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
