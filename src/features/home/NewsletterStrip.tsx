"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import styles from "./NewsletterStrip.module.scss";

export function NewsletterStrip() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
  }

  return (
    <section className={styles.newsletter}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <h2>הצטרפו למועדון הריח</h2>
          <p>קבלו ראשונים מבצעים, השקות חדשות וטיפים מהפרפיומרים שלנו.</p>
        </div>
        <form className={styles.form} onSubmit={onSubmit}>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת הדוא&quot;ל שלך"
            aria-label="דוא״ל"
            required
          />
          <Button type="submit" variant="secondary">
            הרשמו
          </Button>
        </form>
        {done ? <p className={styles.done}>תודה! נצור קשר בקרוב.</p> : null}
      </div>
    </section>
  );
}
