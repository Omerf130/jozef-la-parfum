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
