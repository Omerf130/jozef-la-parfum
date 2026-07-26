"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CookieConsent.module.scss";

export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent";
export const COOKIE_CONSENT_ACCEPTED_EVENT = "cookie-consent-accepted";

const STORAGE_KEY = COOKIE_CONSENT_STORAGE_KEY;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "accepted") {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    window.dispatchEvent(new Event(COOKIE_CONSENT_ACCEPTED_EVENT));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="alert">
      <p className={styles.text}>
        אתר זה משתמש בעוגיות כדי לשפר את חוויית הגלישה.{" "}
        <Link href="/cookie-policy" className={styles.link}>
          מדיניות קובצי Cookie
        </Link>
      </p>
      <button type="button" className={styles.accept} onClick={accept}>
        מאשר/ת
      </button>
    </div>
  );
}
