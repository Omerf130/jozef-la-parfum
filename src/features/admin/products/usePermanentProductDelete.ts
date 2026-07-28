"use client";

import { useCallback, useState } from "react";

export async function permanentDeleteProduct(productId: string): Promise<void> {
  const res = await fetch(`/api/products/${productId}/permanent`, { method: "DELETE" });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "מחיקה נכשלה");
  }
}

export function usePermanentProductDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await permanentDeleteProduct(productId);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { deleteProduct, loading, error, clearError };
}
