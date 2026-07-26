import { AdminStatusBadge } from "@/features/admin/ui/AdminStatusBadge";
import { stockVariant } from "@/features/admin/ui/statusBadgeMaps";
import styles from "./AdminStockDisplay.module.scss";

interface AdminStockDisplayProps {
  totalStock: number;
}

/** Shows badge only for low/out of stock; plain count otherwise. */
export function AdminStockDisplay({ totalStock }: AdminStockDisplayProps) {
  const variant = stockVariant(totalStock);
  if (variant === "outOfStock") {
    return <AdminStatusBadge variant="outOfStock" />;
  }
  if (variant === "lowStock") {
    return (
      <span className={styles.lowWrap}>
        <AdminStatusBadge variant="lowStock" />
        <span className={styles.count}>{totalStock}</span>
      </span>
    );
  }
  return <span>{totalStock}</span>;
}
