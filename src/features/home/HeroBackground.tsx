"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./Hero.module.scss";

const INTERVAL_MS = 6000;

interface HeroSlideDeckProps {
  images: string[];
}

function HeroSlideDeck({ images }: HeroSlideDeckProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [images.length]);

  useEffect(() => {
    setActive(0);
  }, [images.join("|")]);

  if (images.length === 0) {
    return <div className={styles.bg} aria-hidden="true" />;
  }

  return (
    <div className={styles.slides} aria-hidden="true">
      {images.map((src, i) => (
        <div
          key={src}
          className={`${styles.slide} ${i === active ? styles.slideActive : ""}`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={styles.slideImg}
          />
        </div>
      ))}
    </div>
  );
}

interface HeroBackgroundProps {
  desktopImages: string[];
  mobileImages: string[];
}

export function HeroBackground({ desktopImages, mobileImages }: HeroBackgroundProps) {
  const bothEmpty = desktopImages.length === 0 && mobileImages.length === 0;
  if (bothEmpty) {
    return <div className={styles.bg} aria-hidden="true" />;
  }

  return (
    <>
      <div className={styles.deckDesktop}>
        <HeroSlideDeck images={desktopImages} />
      </div>
      <div className={styles.deckMobile}>
        <HeroSlideDeck images={mobileImages} />
      </div>
    </>
  );
}
