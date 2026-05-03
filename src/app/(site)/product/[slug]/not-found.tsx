import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div style={{ maxWidth: 720, margin: "60px auto", padding: "0 16px" }}>
      <EmptyState
        title="המוצר לא נמצא"
        description="ייתכן שהמוצר הוסר מהמכירה או שכתובת ה-URL שגויה."
        action={
          <Link
            href="/"
            style={{
              padding: "12px 22px",
              background: "#0d0d0d",
              color: "#f5efe6",
              borderRadius: 4,
            }}
          >
            חזרה לבית
          </Link>
        }
      />
    </div>
  );
}
