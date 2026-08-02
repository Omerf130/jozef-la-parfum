"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./DiscoverMood.module.scss";

interface SequenceRevealProps {
  children: ReactNode;
}

function isInViewport(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

export function SequenceReveal({ children }: SequenceRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || isInViewport(node)) {
      setVisible(true);
      return;
    }

    setEnhanced(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const className = [
    styles.revealRoot,
    enhanced ? styles.revealEnhanced : "",
    visible ? styles.revealVisible : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
