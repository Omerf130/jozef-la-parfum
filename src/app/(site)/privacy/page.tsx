import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteName";
import styles from "@/styles/legal-page.module.scss";
import { PrivacyContent } from "@/content/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: `מדיניות הפרטיות, קובצי Cookie והצהרת נגישות של ${SITE_NAME}`,
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className={styles.page}>
      <PrivacyContent />
    </article>
  );
}
