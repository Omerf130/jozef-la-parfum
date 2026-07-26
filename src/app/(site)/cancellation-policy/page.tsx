import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteName";
import styles from "@/styles/legal-page.module.scss";
import { CancellationContent } from "@/content/legal/CancellationContent";

export const metadata: Metadata = {
  title: "מדיניות ביטול עסקה",
  description: `מדיניות ביטול עסקה לרכישות מרחוק באתר ${SITE_NAME}`,
  robots: { index: true, follow: true },
};

export default function CancellationPolicyPage() {
  return (
    <article className={styles.page}>
      <CancellationContent />
    </article>
  );
}
