"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { couponSchema, type CouponInput } from "@/lib/validation/coupon";
import type { CouponDTO } from "@/types";
import styles from "./CouponsManager.module.scss";

interface CouponsManagerProps {
  initial: CouponDTO[];
}

function formatDiscount(c: CouponDTO): string {
  return c.discountType === "percent" ? `${c.discountValue}%` : `₪${c.discountValue}`;
}

function formatTarget(c: CouponDTO): string {
  return c.appliesTo === "products" ? "מוצרים" : "משלוח";
}

export function CouponsManager({ initial }: CouponsManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<CouponDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={styles.layout}>
      <div className={styles.list}>
        <header>
          <h2>קופונים</h2>
          <Button variant="ghost" onClick={() => setEditing(null)}>
            + חדש
          </Button>
        </header>
        {initial.length === 0 ? (
          <p className={styles.empty}>אין קופונים</p>
        ) : (
          <ul>
            {initial.map((c) => (
              <li
                key={c._id}
                className={editing?._id === c._id ? styles.activeItem : ""}
              >
                <button type="button" onClick={() => setEditing(c)}>
                  <strong>{c.code}</strong>
                  <small>
                    {c.isPublic ? "באתר" : "חיצוני"} · {formatTarget(c)} · {formatDiscount(c)}
                    {!c.isActive ? " · לא פעיל" : ""}
                  </small>
                  <small>
                    {c.usedCount}
                    {c.maxUses != null ? ` / ${c.maxUses}` : ""} שימושים
                  </small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.editor}>
        <CouponForm
          key={editing?._id ?? "new"}
          initial={editing}
          onSaved={() => {
            setEditing(null);
            setError(null);
            router.refresh();
          }}
          onError={setError}
          onDeleted={() => {
            setEditing(null);
            router.refresh();
          }}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    </div>
  );
}

interface CouponFormProps {
  initial: CouponDTO | null;
  onSaved: () => void;
  onError: (msg: string) => void;
  onDeleted: () => void;
}

function CouponForm({ initial, onSaved, onError, onDeleted }: CouponFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: initial
      ? {
          code: initial.code,
          appliesTo: initial.appliesTo,
          discountType: initial.discountType,
          discountValue: initial.discountValue,
          minOrderAmount: initial.minOrderAmount ?? undefined,
          maxUses: initial.maxUses ?? undefined,
          maxUsesPerCustomer: initial.maxUsesPerCustomer ?? 1,
          expiresAt: initial.expiresAt
            ? initial.expiresAt.slice(0, 16)
            : undefined,
          isActive: initial.isActive,
          isPublic: initial.isPublic,
          description: initial.description ?? undefined,
        }
      : {
          appliesTo: "products",
          discountType: "percent",
          discountValue: 10,
          maxUsesPerCustomer: 1,
          isActive: true,
          isPublic: false,
        },
  });

  const discountType = watch("discountType");

  async function onSubmit(values: CouponInput) {
    onError("");
    try {
      const url = initial ? `/api/coupons/${initial._id}` : "/api/coupons";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שמירה נכשלה");
      onSaved();
    } catch (e) {
      onError(e instanceof Error ? e.message : "שגיאה");
    }
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`למחוק את הקופון ${initial.code}?`)) return;
    onError("");
    try {
      const res = await fetch(`/api/coupons/${initial._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "מחיקה נכשלה");
      onDeleted();
    } catch (e) {
      onError(e instanceof Error ? e.message : "שגיאה");
    }
  }

  async function toggleActive() {
    if (!initial) return;
    onError("");
    try {
      const res = await fetch(`/api/coupons/${initial._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !initial.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "עדכון נכשל");
      onSaved();
    } catch (e) {
      onError(e instanceof Error ? e.message : "שגיאה");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>{initial ? `עריכת ${initial.code}` : "קופון חדש"}</h2>

      <Input
        label="קוד קופון"
        {...register("code")}
        error={errors.code?.message}
        dir="ltr"
        disabled={!!initial}
      />

      <Select
        label="הנחה על"
        options={[
          { value: "products", label: "מוצרים" },
          { value: "shipping", label: "משלוח" },
        ]}
        {...register("appliesTo")}
        error={errors.appliesTo?.message}
      />

      <Select
        label="סוג הנחה"
        options={[
          { value: "percent", label: "אחוזים" },
          { value: "fixed", label: "סכום קבוע (₪)" },
        ]}
        {...register("discountType")}
        error={errors.discountType?.message}
      />

      <Input
        label={discountType === "percent" ? "אחוז הנחה" : "סכום הנחה (₪)"}
        type="number"
        {...register("discountValue", { valueAsNumber: true })}
        error={errors.discountValue?.message}
        dir="ltr"
      />

      <Input
        label="מינימום הזמנה (₪) — אופציונלי"
        type="number"
        {...register("minOrderAmount", { valueAsNumber: true })}
        error={errors.minOrderAmount?.message}
        dir="ltr"
      />

      <Input
        label="מקסימום שימושים כולל — אופציונלי"
        type="number"
        {...register("maxUses", { valueAsNumber: true })}
        error={errors.maxUses?.message}
        dir="ltr"
      />

      <Input
        label="מקסימום שימושים ללקוח (לפי אימייל)"
        type="number"
        {...register("maxUsesPerCustomer", { valueAsNumber: true })}
        error={errors.maxUsesPerCustomer?.message}
        dir="ltr"
      />

      <Input
        label="תאריך תפוגה — אופציונלי"
        type="datetime-local"
        {...register("expiresAt")}
        error={errors.expiresAt?.message}
        dir="ltr"
      />

      <Input
        label="הערה פנימית — אופציונלי"
        {...register("description")}
        error={errors.description?.message}
      />

      <label className={styles.checkbox}>
        <input type="checkbox" {...register("isActive")} />
        <span>קופון פעיל</span>
      </label>

      <label className={styles.checkbox}>
        <input type="checkbox" {...register("isPublic")} />
        <span>הצג באתר (דף הבית)</span>
      </label>
      <p className={styles.help}>
        אם לא מסומן — שתפו את הקוד ידנית ברשתות חברתיות, וואטסאפ או אימייל.
      </p>

      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting}>
          {initial ? "שמור שינויים" : "צור קופון"}
        </Button>
        {initial ? (
          <>
            <Button type="button" variant="ghost" onClick={toggleActive}>
              {initial.isActive ? "השבת" : "הפעל"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleDelete}>
              מחק
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}
