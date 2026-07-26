import {
  STATUS_BADGE_LABELS,
  type AdminStatusBadgeVariant,
} from "@/features/admin/ui/statusBadgeMaps";
import styles from "./AdminStatusBadge.module.scss";

interface AdminStatusBadgeProps {
  variant: AdminStatusBadgeVariant;
  label?: string;
  className?: string;
}

export function AdminStatusBadge({ variant, label, className }: AdminStatusBadgeProps) {
  const text = label ?? STATUS_BADGE_LABELS[variant];
  return (
    <span className={[styles.badge, styles[variant], className].filter(Boolean).join(" ")}>
      {text}
    </span>
  );
}
