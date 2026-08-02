import { DISCOVER_MOOD } from "./discoverMoodConfig";
import { MoodWorld } from "./MoodWorld";
import { SequenceReveal } from "./SequenceReveal";
import styles from "./DiscoverMood.module.scss";

export function DiscoverMood() {
  return (
    <section className={styles.section} aria-labelledby="discover-mood-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>{DISCOVER_MOOD.eyebrow}</p>
          <h2 id="discover-mood-heading" className={styles.headline}>
            {DISCOVER_MOOD.headline}
          </h2>
          <p className={styles.support}>{DISCOVER_MOOD.support}</p>
        </header>

        <SequenceReveal>
          <div className={styles.sequence}>
            {DISCOVER_MOOD.worlds.map((world) => (
              <MoodWorld key={world.label} world={world} />
            ))}
          </div>
        </SequenceReveal>
      </div>
    </section>
  );
}
