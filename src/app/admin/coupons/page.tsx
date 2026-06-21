import { connectDB } from "@/lib/db";
import { CouponModel } from "@/models/Coupon";
import { ProductModel } from "@/models/Product";
import { serializeCoupon } from "@/lib/serializers";
import { CouponsManager } from "@/features/admin/CouponsManager";
import styles from "../categories/page.module.scss";

export default async function AdminCouponsPage() {
  await connectDB();
  const [coupons, products] = await Promise.all([
    CouponModel.find().sort({ createdAt: -1 }).lean(),
    ProductModel.find({ isActive: true }).select("name").sort({ name: 1 }).lean(),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>קופונים</h1>
        <p>יצירה, עריכה והשבתה של קודי הנחה.</p>
      </header>
      <CouponsManager
        initial={coupons.map(serializeCoupon)}
        products={products.map((p) => ({ _id: p._id.toString(), name: p.name }))}
      />
    </div>
  );
}
