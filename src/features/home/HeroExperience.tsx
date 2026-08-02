"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import {
  getSlideContentPlacement,
  getSlideObjectPosition,
  getSlideTextSide,
  HERO_CONFIG,
} from "./heroConfig";
import styles from "./Hero.module.scss";

interface HeroSlideDeckProps {
  images: string[];
  deckClass: string;
  activeIndex: number;
}

function HeroSlideDeck({ images, deckClass, activeIndex }: HeroSlideDeckProps) {
  if (images.length === 0) {
    return null;
  }

  const safeActive = activeIndex % images.length;

  return (
    <div className={deckClass} aria-hidden="true">
      <div className={styles.slides}>
        {images.map((src, i) => (
          <div
            key={src}
            className={`${styles.slide} ${i === safeActive ? styles.slideActive : ""}`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={styles.slideImg}
              style={{ objectPosition: getSlideObjectPosition(i) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface HeroExperienceProps {
  desktopImages: string[];
  mobileImages: string[];
}

export function HeroExperience({ desktopImages, mobileImages }: HeroExperienceProps) {
  const desktopDeck = desktopImages.length ? desktopImages : mobileImages;
  const mobileDeck = mobileImages.length ? mobileImages : desktopImages;
  const slideCount = Math.max(desktopDeck.length, mobileDeck.length);
  const hasImages = slideCount > 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [passageActive, setPassageActive] = useState(false);
  const passageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIndex = useRef(0);
  const pausedRef = useRef(false);

  const triggerPassage = useCallback(() => {
    if (passageTimer.current) clearTimeout(passageTimer.current);
    setPassageActive(true);
    passageTimer.current = setTimeout(() => {
      setPassageActive(false);
    }, HERO_CONFIG.passageMs);
  }, []);

  useEffect(() => {
    if (slideCount <= 1) return;

    const tick = () => {
      if (pausedRef.current) return;
      setActiveIndex((i) => (i + 1) % slideCount);
    };

    const id = setInterval(tick, HERO_CONFIG.intervalMs);
    return () => clearInterval(id);
  }, [slideCount]);

  useEffect(() => {
    const onVisibility = () => {
      pausedRef.current = document.visibilityState === "hidden";
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const desktopKey = desktopImages.join("|");
  const mobileKey = mobileImages.join("|");

  useEffect(() => {
    setActiveIndex(0);
    prevIndex.current = 0;
  }, [desktopKey, mobileKey]);

  useEffect(() => {
    if (activeIndex !== prevIndex.current && slideCount > 1) {
      triggerPassage();
    }
    prevIndex.current = activeIndex;
  }, [activeIndex, slideCount, triggerPassage]);

  useEffect(() => {
    return () => {
      if (passageTimer.current) clearTimeout(passageTimer.current);
    };
  }, []);

  const placement = getSlideContentPlacement(activeIndex);
  const textSide = getSlideTextSide(activeIndex);

  const contentClass = [
    styles.contentInner,
    placement === "lower" ? styles.contentLower : "",
    placement === "higher" ? styles.contentHigher : "",
    textSide === "end" ? styles.contentEnd : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.hero} aria-label="ברוכים הבאים">
      {!hasImages ? <div className={styles.bg} aria-hidden="true" /> : null}

      <HeroSlideDeck
        images={desktopDeck}
        deckClass={styles.deckDesktop}
        activeIndex={activeIndex}
      />
      <HeroSlideDeck
        images={mobileDeck}
        deckClass={styles.deckMobile}
        activeIndex={activeIndex}
      />

      <div className={styles.overlay} aria-hidden="true" />
      <div
        className={`${styles.passage} ${passageActive ? styles.passageActive : ""}`}
        aria-hidden="true"
      />

      <div className={styles.content}>
        <div className={contentClass}>
          <span className={styles.label}>{HERO_CONFIG.label}</span>
          <h1 className={styles.title}>{HERO_CONFIG.headline}</h1>
          <p className={styles.support}>{HERO_CONFIG.support}</p>
          <div className={styles.actions}>
            <Link href={HERO_CONFIG.cta.href}>
              <Button variant="secondary" size="md" className={styles.cta}>
                {HERO_CONFIG.cta.label}
              </Button>
            </Link>
          </div>
          {slideCount > 1 ? (
            <div className={styles.dots} aria-hidden="true">
              {Array.from({ length: slideCount }, (_, i) => (
                <span
                  key={i}
                  className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ""}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
