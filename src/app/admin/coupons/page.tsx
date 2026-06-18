import { connectDB } from "@/lib/db";
import { CouponModel } from "@/models/Coupon";
import { serializeCoupon } from "@/lib/serializers";
import { CouponsManager } from "@/features/admin/CouponsManager";
import styles from "../categories/page.module.scss";

export default async function AdminCouponsPage() {
  await connectDB();
  const coupons = (await CouponModel.find().sort({ createdAt: -1 }).lean()).map(serializeCoupon);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>קופונים</h1>
        <p>יצירה, עריכה והשבתה של קודי הנחה.</p>
      </header>
      <CouponsManager initial={coupons} />
    </div>
  );
}
