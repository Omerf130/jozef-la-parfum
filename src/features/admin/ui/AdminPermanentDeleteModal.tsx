"use client";

import { useEffect } from "react";
import { AdminConfirmModalBody } from "@/features/admin/ui/AdminConfirmModalBody";
import { usePermanentProductDelete } from "@/features/admin/products/usePermanentProductDelete";

const TITLE = "מחיקת מוצר לצמיתות";
const DESCRIPTION =
  "האם אתה בטוח שברצונך למחוק את המוצר לצמיתות?\nפעולה זו תמחק גם את כל התמונות המשויכות אליו ולא ניתן יהיה לשחזר את המוצר.";

interface AdminPermanentDeleteModalProps {
  open: boolean;
  productId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminPermanentDeleteModal({
  open,
  productId,
  onClose,
  onSuccess,
}: AdminPermanentDeleteModalProps) {
  const { deleteProduct, loading, error, clearError } = usePermanentProductDelete();

  useEffect(() => {
    if (open) clearError();
  }, [open, productId, clearError]);

  const handleClose = () => {
    if (loading) return;
    clearError();
    onClose();
  };

  const handleConfirm = async () => {
    if (!productId) return;
    const ok = await deleteProduct(productId);
    if (ok) {
      clearError();
      onSuccess();
      onClose();
    }
  };

  return (
    <AdminConfirmModalBody
      open={open && productId !== null}
      title={TITLE}
      description={DESCRIPTION}
      confirmLabel={loading ? "מוחק…" : "מחק לצמיתות"}
      danger
      loading={loading}
      error={error}
      onConfirm={() => void handleConfirm()}
      onClose={handleClose}
    />
  );
}
