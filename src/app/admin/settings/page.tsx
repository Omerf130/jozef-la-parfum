import { getSiteSettingsForAdmin } from "@/lib/siteSettings";
import { ShippingSettingsForm } from "@/features/admin/ShippingSettingsForm";
import styles from "../categories/page.module.scss";

export default async function AdminSettingsPage() {
  const { shippingPriceILS, freeShippingThreshold } =
    await getSiteSettingsForAdmin();

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>הגדרות</h1>
        <p>הגדרות משלוח ותשלום.</p>
      </header>
      <ShippingSettingsForm
        key={`${shippingPriceILS}-${freeShippingThreshold}`}
        initialShippingPrice={shippingPriceILS}
        initialFreeThreshold={freeShippingThreshold}
      />
    </div>
  );
}
