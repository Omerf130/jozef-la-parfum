"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CookieConsent.module.scss";

const STORAGE_KEY = "cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "accepted") {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="alert">
      <p className={styles.text}>
        אתר זה משתמש בעוגיות כדי לשפר את חוויית הגלישה.{" "}
        <Link href="/privacy" className={styles.link}>
          מדיניות פרטיות
        </Link>
      </p>
      <button type="button" className={styles.accept} onClick={accept}>
        מאשר/ת
      </button>
    </div>
  );
}
