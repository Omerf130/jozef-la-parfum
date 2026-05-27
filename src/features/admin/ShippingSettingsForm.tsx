"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import styles from "./ShippingSettingsForm.module.scss";

interface Props {
  initialShippingPrice: number;
  initialFreeThreshold: number;
}

export function ShippingSettingsForm({
  initialShippingPrice,
  initialFreeThreshold,
}: Props) {
  const [shippingPrice, setShippingPrice] = useState(initialShippingPrice);
  const [freeThreshold, setFreeThreshold] = useState(initialFreeThreshold);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave() {
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
      setMessage({ type: "ok", text: "נשמר בהצלחה" });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "שגיאה" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.card}>
      <h2>משלוח</h2>

      <label className={styles.field}>
        <span>מחיר משלוח (₪)</span>
        <input
          type="number"
          min={0}
          step={1}
          value={shippingPrice}
          onChange={(e) => setShippingPrice(Number(e.target.value))}
          className={styles.input}
        />
      </label>

      <label className={styles.field}>
        <span>סף למשלוח חינם (₪)</span>
        <input
          type="number"
          min={0}
          step={1}
          value={freeThreshold}
          onChange={(e) => setFreeThreshold(Number(e.target.value))}
          className={styles.input}
        />
        <small className={styles.hint}>
          הזמנות מעל סכום זה יקבלו משלוח חינם. הגדירו 0 כדי לבטל.
        </small>
      </label>

      <div className={styles.actions}>
        <Button onClick={handleSave} loading={saving}>
          שמור
        </Button>
        {message && (
          <span className={message.type === "ok" ? styles.ok : styles.err}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
