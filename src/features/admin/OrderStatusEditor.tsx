"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import type { PaymentStatus, OrderStatus } from "@/types";
import styles from "./OrderStatusEditor.module.scss";

interface OrderStatusEditorProps {
  orderId: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
}

const PAYMENT_OPTIONS = [
  { value: "pending", label: "ממתין" },
  { value: "paid", label: "שולם" },
  { value: "failed", label: "נכשל" },
  { value: "refunded", label: "זוכה" },
];

const ORDER_OPTIONS = [
  { value: "new", label: "חדש" },
  { value: "processing", label: "בטיפול" },
  { value: "shipped", label: "נשלח" },
  { value: "delivered", label: "נמסר" },
  { value: "cancelled", label: "בוטל" },
];

export function OrderStatusEditor({
  orderId,
  paymentStatus,
  orderStatus,
}: OrderStatusEditorProps) {
  const router = useRouter();
  const [pay, setPay] = useState<PaymentStatus>(paymentStatus);
  const [ord, setOrd] = useState<OrderStatus>(orderStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: pay, orderStatus: ord }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שמירה נכשלה");
      setMessage("נשמר בהצלחה");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Select
        label="סטטוס תשלום"
        value={pay}
        onChange={(e) => setPay(e.target.value as PaymentStatus)}
        options={PAYMENT_OPTIONS}
      />
      <Select
        label="סטטוס הזמנה"
        value={ord}
        onChange={(e) => setOrd(e.target.value as OrderStatus)}
        options={ORDER_OPTIONS}
      />
      <Button onClick={save} loading={saving} fullWidth>
        עדכן
      </Button>
      {message ? <p className={styles.success}>{message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
