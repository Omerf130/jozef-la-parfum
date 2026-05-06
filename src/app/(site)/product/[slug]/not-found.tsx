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
              padding: "14px 28px",
              background: "#0d0d0d",
              color: "#ffffff",
              fontSize: "0.78rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 500,
              border: "1px solid #0d0d0d",
            }}
          >
            חזרה לבית
          </Link>
        }
      />
    </div>
  );
}
