"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useUnsavedChangesGuard(isDirty: boolean) {
  const [leaveOpen, setLeaveOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const guardNavigation = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setLeaveOpen(true);
    },
    [isDirty],
  );

  const confirmLeave = useCallback(() => {
    setLeaveOpen(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const cancelLeave = useCallback(() => {
    setLeaveOpen(false);
    pendingActionRef.current = null;
  }, []);

  return { leaveOpen, guardNavigation, confirmLeave, cancelLeave };
}
