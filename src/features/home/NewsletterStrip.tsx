"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import styles from "./NewsletterStrip.module.scss";

export function NewsletterStrip() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ההרשמה נכשלה");
        return;
      }
      setDone(true);
      setEmail("");
    } catch {
      setError("שגיאה בשליחה — נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.newsletter}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <h2>הצטרפו למועדון של Jozef</h2>
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
            disabled={loading || done}
          />
          <Button type="submit" variant="secondary" loading={loading} disabled={done}>
            הרשמו
          </Button>
        </form>
        {done ? <p className={styles.done}>תודה! נצור קשר בקרוב.</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    </section>
  );
}
