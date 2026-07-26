import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteName";
import styles from "@/styles/legal-page.module.scss";
import { CookieContent } from "@/content/legal/CookieContent";

export const metadata: Metadata = {
  title: "מדיניות קובצי Cookie",
  description: `מדיניות קובצי Cookie וטכנולוגיות מעקב באתר ${SITE_NAME}`,
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <article className={styles.page}>
      <CookieContent />
    </article>
  );
}
