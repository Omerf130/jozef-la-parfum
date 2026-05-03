"use client";

import { ErrorState } from "@/components/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "60px 16px", maxWidth: 720, margin: "0 auto" }}>
      <ErrorState
        title="אירעה שגיאה"
        description={error.message || "אנא נסו שוב מאוחר יותר."}
        onRetry={reset}
      />
    </div>
  );
}
