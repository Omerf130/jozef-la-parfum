import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div style={{ padding: "80px 16px", maxWidth: 720, margin: "0 auto" }}>
      <EmptyState
        title="404 — לא נמצא"
        description="העמוד שחיפשת לא קיים או הועבר."
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
