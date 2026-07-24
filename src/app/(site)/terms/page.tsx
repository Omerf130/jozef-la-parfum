import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteName";
import styles from "@/styles/legal-page.module.scss";
import { TermsContent } from "@/content/legal/TermsContent";

export const metadata: Metadata = {
  title: "תנאי שימוש",
  description: `תנאי השימוש, מדיניות ביטול עסקה והמכירה באתר ${SITE_NAME}`,
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <article className={styles.page}>
      <TermsContent />
    </article>
  );
}
