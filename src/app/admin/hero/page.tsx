import { getSiteSettingsForAdmin } from "@/lib/siteSettings";
import { HeroImagesManager } from "@/features/admin/HeroImagesManager";
import styles from "../categories/page.module.scss";

export default async function AdminHeroPage() {
  const { heroImagesDesktop, heroImagesMobile } = await getSiteSettingsForAdmin();

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>באנר ראשי (Hero)</h1>
        <p>תמונות רקע בחלק העליון של דף הבית — דסקטופ ומובייל.</p>
      </header>
      <HeroImagesManager
        key={`${heroImagesDesktop.join("|")}__${heroImagesMobile.join("|")}`}
        initialDesktop={heroImagesDesktop}
        initialMobile={heroImagesMobile}
      />
    </div>
  );
}
