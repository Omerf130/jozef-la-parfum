"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminFormActions, adminFormStickyClassName } from "@/features/admin/ui/AdminFormActions";
import { AdminConfirmModalBody } from "@/features/admin/ui/AdminConfirmModalBody";
import { AdminFeedback } from "@/features/admin/ui/AdminFeedback";
import { useUnsavedChangesGuard } from "@/features/admin/ui/useUnsavedChangesGuard";
import styles from "./ShippingSettingsForm.module.scss";

interface Props {
  initialShippingPrice: number;
  initialFreeThreshold: number;
}

export function ShippingSettingsForm({
  initialShippingPrice,
  initialFreeThreshold,
}: Props) {
  const router = useRouter();
  const [shippingPrice, setShippingPrice] = useState(initialShippingPrice);
  const [freeThreshold, setFreeThreshold] = useState(initialFreeThreshold);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isDirty = useMemo(
    () => shippingPrice !== initialShippingPrice || freeThreshold !== initialFreeThreshold,
    [shippingPrice, freeThreshold, initialShippingPrice, initialFreeThreshold],
  );

  const { leaveOpen, guardNavigation, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingPriceILS: shippingPrice,
          freeShippingThreshold: freeThreshold,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "שמירה נכשלה");
      }
      setMessage({ type: "success", text: "נשמר בהצלחה" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "שגיאה" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSave}
        className={`${styles.wrap} ${adminFormStickyClassName()}`}
        noValidate
      >
        <div className={styles.card}>
          <h2>משלוח</h2>

          <section className={styles.block}>
            <h3>מחיר משלוח</h3>
            <label className={styles.field}>
              <span>מחיר משלוח (₪)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={shippingPrice}
                onChange={(e) => {
                  setMessage(null);
                  setShippingPrice(Number(e.target.value));
                }}
                className={styles.input}
              />
            </label>
          </section>

          <section className={styles.block}>
            <h3>משלוח חינם</h3>
            <label className={styles.field}>
              <span>סף למשלוח חינם (₪)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={freeThreshold}
                onChange={(e) => {
                  setMessage(null);
                  setFreeThreshold(Number(e.target.value));
                }}
                className={styles.input}
              />
              <small className={styles.hint}>
                הזמנות מעל סכום זה יקבלו משלוח חינם. הגדירו 0 כדי לבטל.
              </small>
            </label>
          </section>

          {message ? (
            <AdminFeedback variant={message.type} message={message.text} />
          ) : null}
        </div>

        <AdminFormActions
          saveLabel="שמור"
          loading={saving}
          backHref="/admin"
          backLabel="לוח בקרה"
          onBackClick={() => guardNavigation(() => router.push("/admin"))}
        />
      </form>

      <AdminConfirmModalBody
        open={leaveOpen}
        title="שינויים שלא נשמרו"
        description="יש שינויים שלא נשמרו. לעזוב את העמוד בכל זאת?"
        confirmLabel="עזוב"
        cancelLabel="המשך עריכה"
        danger
        onConfirm={confirmLeave}
        onClose={cancelLeave}
      />
    </>
  );
}
