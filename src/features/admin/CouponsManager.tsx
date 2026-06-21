"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { Select } from "@/components/Select";
import { couponSchema, type CouponInput } from "@/lib/validation/coupon";
import type { CouponDTO } from "@/types";
import styles from "./CouponsManager.module.scss";

export interface AdminProductOption {
  _id: string;
  name: string;
}

interface CouponsManagerProps {
  initial: CouponDTO[];
  products: AdminProductOption[];
}

function formatDiscount(c: CouponDTO): string {
  return c.discountType === "percent" ? `${c.discountValue}%` : `₪${c.discountValue}`;
}

function formatTarget(c: CouponDTO): string {
  if (c.appliesTo === "shipping") return "משלוח";
  if (c.productIds.length > 0) return `${c.productIds.length} מוצרים`;
  return "כל המוצרים";
}

export function CouponsManager({ initial, products }: CouponsManagerProps) {
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
          products={products}
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
  products: AdminProductOption[];
  onSaved: () => void;
  onError: (msg: string) => void;
  onDeleted: () => void;
}

function CouponForm({ initial, products, onSaved, onError, onDeleted }: CouponFormProps) {
  const [productSearch, setProductSearch] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
          productIds: initial.productIds,
        }
      : {
          appliesTo: "products",
          discountType: "percent",
          discountValue: 10,
          maxUsesPerCustomer: 1,
          isActive: true,
          isPublic: false,
          productIds: [],
        },
  });

  const discountType = watch("discountType");
  const appliesTo = watch("appliesTo");
  const selectedProductIds = watch("productIds") ?? [];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.trim().toLowerCase()),
  );

  function toggleProduct(productId: string) {
    const current = selectedProductIds;
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    setValue("productIds", next, { shouldDirty: true });
  }

  async function onSubmit(values: CouponInput) {
    onError("");
    try {
      const payload = {
        ...values,
        productIds: values.appliesTo === "shipping" ? [] : values.productIds ?? [],
      };
      const url = initial ? `/api/coupons/${initial._id}` : "/api/coupons";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

      {appliesTo === "products" ? (
        <fieldset className={styles.productPicker}>
          <legend>מוצרים (ריק = כל המוצרים)</legend>
          {products.length === 0 ? (
            <p className={styles.help}>אין מוצרים פעילים</p>
          ) : (
            <>
              <div className={styles.productSearch}>
                <Input
                  label="חיפוש מוצר"
                  placeholder="הקלידו שם מוצר..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              {filteredProducts.length === 0 ? (
                <p className={styles.help}>לא נמצאו מוצרים</p>
              ) : (
                <ul>
                  {filteredProducts.map((p) => (
                    <li key={p._id}>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(p._id)}
                          onChange={() => toggleProduct(p._id)}
                        />
                        <span>{p.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </fieldset>
      ) : null}

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
        label="מינימום הזמנה (₪)"
        type="number"
        {...register("minOrderAmount", {
          setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
        })}
        error={errors.minOrderAmount?.message}
        dir="ltr"
      />
      {appliesTo === "products" && selectedProductIds.length > 0 ? (
        <p className={styles.help}>המינימום נבדק לפי סכום המוצרים הזכאים בלבד.</p>
      ) : null}

      <Input
        label="מקסימום שימושים כולל"
        type="number"
        {...register("maxUses", {
          setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
        })}
        error={errors.maxUses?.message}
        dir="ltr"
      />

      <Input
        label="מקסימום שימושים ללקוח (לפי אימייל)"
        type="number"
        {...register("maxUsesPerCustomer", {
          setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
        })}
        error={errors.maxUsesPerCustomer?.message}
        dir="ltr"
      />

      <Input
        label="תאריך תפוגה"
        type="datetime-local"
        {...register("expiresAt")}
        error={errors.expiresAt?.message}
        dir="ltr"
      />

      <Textarea
        label="תיאור"
        hint="מוצג ללקוחות בדף הבית עבור קופונים ציבוריים. מתאים לקופונים כלליים ולקופונים על מוצרים ספציפיים."
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
