import Image from "next/image";
import Link from "next/link";
import { DISCOVER_MOOD, type MoodWorldConfig } from "./discoverMoodConfig";
import styles from "./MoodWorld.module.scss";

interface MoodWorldProps {
  world: MoodWorldConfig;
}

const RHYTHM_CLASS: Record<MoodWorldConfig["rhythm"], string> = {
  spreadOne: styles.rhythmSpreadOne,
  spreadTwo: styles.rhythmSpreadTwo,
  spreadThree: styles.rhythmSpreadThree,
  spreadFour: styles.rhythmSpreadFour,
};

const COMPOSITION_CLASS: Record<MoodWorldConfig["composition"], string> = {
  bottomRight: styles.copyBottomRight,
  topLeft: styles.copyTopLeft,
  centerLeft: styles.copyCenterLeft,
  bottomLeft: styles.copyBottomLeft,
};

export function MoodWorld({ world }: MoodWorldProps) {
  return (
    <Link
      href={world.href}
      className={`${styles.beat} ${RHYTHM_CLASS[world.rhythm]} ${COMPOSITION_CLASS[world.composition]}`}
      data-sequence-beat=""
      aria-label={`${world.title} — ${world.label}`}
    >
      <div className={styles.visual}>
        <Image
          src={world.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 92vw"
          className={styles.photo}
          style={{ objectPosition: world.objectPosition }}
        />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.copy}>
          <span className={styles.label}>{world.label}</span>
          <span className={styles.title}>{world.title}</span>
          <span className={styles.cta}>{DISCOVER_MOOD.ctaLabel}</span>
        </div>
      </div>
    </Link>
  );
}
