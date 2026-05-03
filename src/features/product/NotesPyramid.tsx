import type { ProductNotes } from "@/types";
import styles from "./NotesPyramid.module.scss";

interface NotesPyramidProps {
  notes: ProductNotes;
}

export function NotesPyramid({ notes }: NotesPyramidProps) {
  const tiers = [
    { label: "פירמידה עליונה", items: notes.top, level: "top" },
    { label: "לב הניחוח", items: notes.middle, level: "middle" },
    { label: "בסיס", items: notes.base, level: "base" },
  ] as const;

  const hasAny = tiers.some((t) => t.items.length > 0);
  if (!hasAny) return null;

  return (
    <section className={styles.section} aria-labelledby="notes-heading">
      <header className={styles.head}>
        <span className={styles.kicker}>פירמידת הניחוח</span>
        <h2 id="notes-heading">הרכב הבושם</h2>
      </header>
      <div className={styles.pyramid}>
        {tiers.map((t) =>
          t.items.length > 0 ? (
            <div key={t.level} className={`${styles.tier} ${styles[t.level]}`}>
              <h3>{t.label}</h3>
              <div className={styles.notes}>
                {t.items.map((n) => (
                  <span key={n} className={styles.note}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </section>
  );
}
