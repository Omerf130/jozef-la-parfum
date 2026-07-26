import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteName";
import styles from "@/styles/legal-page.module.scss";
import { AccessibilityContent } from "@/content/legal/AccessibilityContent";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: `הצהרת נגישות האתר של ${SITE_NAME}`,
  robots: { index: true, follow: true },
};

export default function AccessibilityPage() {
  return (
    <article className={styles.page}>
      <AccessibilityContent />
    </article>
  );
}
