"use client";

import { useCallback, useEffect, useRef } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import styles from "./admin-confirm.module.scss";

interface AdminConfirmModalBodyProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminConfirmModalBody({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "ביטול",
  danger,
  loading,
  onConfirm,
  onClose,
}: AdminConfirmModalBodyProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      if (danger) {
        cancelRef.current?.focus();
      } else {
        confirmRef.current?.focus();
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, danger]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" || loading) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.target !== confirmRef.current) return;
      e.preventDefault();
      onConfirm();
    },
    [loading, onConfirm],
  );

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.content} onKeyDown={handleKeyDown}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <Button
            ref={confirmRef}
            type="button"
            variant={danger ? "danger" : "primary"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button
            ref={cancelRef}
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
