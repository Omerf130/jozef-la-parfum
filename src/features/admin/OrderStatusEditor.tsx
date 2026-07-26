"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { AdminFeedback } from "@/features/admin/ui/AdminFeedback";
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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  function clearFeedback() {
    setFeedback(null);
  }

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: pay, orderStatus: ord }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שמירה נכשלה");
      setFeedback({
        type: "success",
        text: data.emailSent ? "נשמר ומייל אישור נשלח ללקוח" : "נשמר בהצלחה",
      });
      router.refresh();
    } catch (e) {
      setFeedback({
        type: "error",
        text: e instanceof Error ? e.message : "שגיאה",
      });
    } finally {
      setSaving(false);
    }
  }

  async function sendConfirmationEmail() {
    setSendingEmail(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendConfirmationEmail: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שליחה נכשלה");
      if (data.emailSent) {
        setFeedback({ type: "success", text: "מייל אישור נשלח ללקוח" });
      } else {
        setFeedback({ type: "error", text: "שליחת המייל נכשלה — בדוק את הלוגים" });
      }
      router.refresh();
    } catch (e) {
      setFeedback({
        type: "error",
        text: e instanceof Error ? e.message : "שגיאה",
      });
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className={styles.editor}>
      <Select
        label="סטטוס תשלום"
        value={pay}
        onChange={(e) => {
          clearFeedback();
          setPay(e.target.value as PaymentStatus);
        }}
        options={PAYMENT_OPTIONS}
      />
      <Select
        label="סטטוס הזמנה"
        value={ord}
        onChange={(e) => {
          clearFeedback();
          setOrd(e.target.value as OrderStatus);
        }}
        options={ORDER_OPTIONS}
      />
      <div className={styles.actionsCol}>
        <Button onClick={save} loading={saving} fullWidth disabled={sendingEmail}>
          עדכן סטטוס
        </Button>
        <Button
          onClick={sendConfirmationEmail}
          loading={sendingEmail}
          variant="ghost"
          fullWidth
          disabled={saving}
        >
          שלח מייל אישור ללקוח
        </Button>
      </div>
      {feedback ? (
        <AdminFeedback variant={feedback.type} message={feedback.text} className={styles.feedback} />
      ) : null}
    </div>
  );
}
