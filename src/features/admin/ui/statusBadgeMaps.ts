export type AdminStatusBadgeVariant =
  | "active"
  | "inactive"
  | "featured"
  | "lowStock"
  | "outOfStock"
  | "paid"
  | "pending"
  | "failed"
  | "refunded"
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "couponActive"
  | "couponInactive"
  | "public"
  | "private";

export const STATUS_BADGE_LABELS: Record<AdminStatusBadgeVariant, string> = {
  active: "פעיל",
  inactive: "מושבת",
  featured: "מומלץ",
  lowStock: "מלאי נמוך",
  outOfStock: "אזל מהמלאי",
  paid: "שולם",
  pending: "ממתין",
  failed: "נכשל",
  refunded: "זוכה",
  new: "חדש",
  processing: "בטיפול",
  shipped: "נשלח",
  delivered: "נמסר",
  cancelled: "בוטל",
  couponActive: "פעיל",
  couponInactive: "לא פעיל",
  public: "באתר",
  private: "חיצוני",
};

export function paymentStatusVariant(status: string): AdminStatusBadgeVariant {
  const map: Record<string, AdminStatusBadgeVariant> = {
    paid: "paid",
    pending: "pending",
    failed: "failed",
    refunded: "refunded",
  };
  return map[status] ?? "pending";
}

export function orderStatusVariant(status: string): AdminStatusBadgeVariant {
  const map: Record<string, AdminStatusBadgeVariant> = {
    new: "new",
    processing: "processing",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return map[status] ?? "new";
}

/** Returns badge variant only for low/out of stock; null for normal stock (show plain count). */
export function stockVariant(totalStock: number): "lowStock" | "outOfStock" | null {
  if (totalStock <= 0) return "outOfStock";
  if (totalStock <= 5) return "lowStock";
  return null;
}
