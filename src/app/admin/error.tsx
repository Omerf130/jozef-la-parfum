"use client";

import { ErrorState } from "@/components/ErrorState";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 32 }}>
      <ErrorState
        title="שגיאה בטעינת הניהול"
        description={error.message}
        onRetry={reset}
      />
    </div>
  );
}
