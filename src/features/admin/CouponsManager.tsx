"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Input, Textarea } from "@/components/Input";
import { Select } from "@/components/Select";
import { couponSchema, type CouponInput } from "@/lib/validation/coupon";
import { formatIsraelDateTimeLocal } from "@/lib/israelDateTime";
import type { CouponDTO } from "@/types";
import { AdminConfirmModalBody } from "@/features/admin/ui/AdminConfirmModalBody";
import { AdminFeedback } from "@/features/admin/ui/AdminFeedback";
import { AdminFormActions, adminFormStickyClassName } from "@/features/admin/ui/AdminFormActions";
import { AdminStatusBadge } from "@/features/admin/ui/AdminStatusBadge";
import { scrollToFirstError } from "@/features/admin/ui/scrollToFirstError";
import { useUnsavedChangesGuard } from "@/features/admin/ui/useUnsavedChangesGuard";
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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [formDirty, setFormDirty] = useState(false);
  const { leaveOpen, guardNavigation, confirmLeave, cancelLeave } = useUnsavedChangesGuard(formDirty);

  function selectCoupon(c: CouponDTO | null) {
    guardNavigation(() => {
      setEditing(c);
      setFeedback(null);
    });
  }

  return (
    <div className={styles.layout}>
      <div className={styles.list}>
        <header>
          <h2>קופונים</h2>
          <Button variant="ghost" onClick={() => selectCoupon(null)}>
            + חדש
          </Button>
        </header>
        {initial.length === 0 ? (
          <EmptyState
            title="אין קופונים"
            description="צרו קופון ראשון להנחות ומבצעים."
            action={
              <Button variant="ghost" onClick={() => selectCoupon(null)}>
                + קופון חדש
              </Button>
            }
          />
        ) : (
          <ul>
            {initial.map((c) => (
              <li
                key={c._id}
                className={editing?._id === c._id ? styles.activeItem : ""}
              >
                <button type="button" onClick={() => selectCoupon(c)}>
                  <strong>{c.code}</strong>
                  <span className={styles.listBadges}>
                    <AdminStatusBadge variant={c.isPublic ? "public" : "private"} />
                    {!c.isActive ? <AdminStatusBadge variant="couponInactive" /> : null}
                  </span>
                  <small>
                    {formatTarget(c)} · {formatDiscount(c)}
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
          onDirtyChange={setFormDirty}
          onCancel={() => selectCoupon(null)}
          onSaved={() => {
            setFeedback({ type: "success", text: "נשמר בהצלחה" });
            setEditing(null);
            setFormDirty(false);
            router.refresh();
          }}
          onError={(msg) => setFeedback(msg ? { type: "error", text: msg } : null)}
          onDeleted={() => {
            setFeedback({ type: "success", text: "הקופון נמחק" });
            setEditing(null);
            setFormDirty(false);
            router.refresh();
          }}
        />
        {feedback ? (
          <AdminFeedback variant={feedback.type} message={feedback.text} />
        ) : null}
      </div>

      <AdminConfirmModalBody
        open={leaveOpen}
        title="שינויים שלא נשמרו"
        description="יש שינויים שלא נשמרו. לעזוב את העריכה בכל זאת?"
        confirmLabel="עזוב"
        cancelLabel="המשך עריכה"
        danger
        onConfirm={confirmLeave}
        onClose={cancelLeave}
      />
    </div>
  );
}

interface CouponFormProps {
  initial: CouponDTO | null;
  products: AdminProductOption[];
  onDirtyChange: (dirty: boolean) => void;
  onCancel: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
  onDeleted: () => void;
}

function CouponForm({ initial, products, onDirtyChange, onCancel, onSaved, onError, onDeleted }: CouponFormProps) {
  const [productSearch, setProductSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
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
            ? formatIsraelDateTimeLocal(new Date(initial.expiresAt))
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

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

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

  async function onDelete() {
    if (!initial) return;
    setDeleting(true);
    onError("");
    try {
      const res = await fetch(`/api/coupons/${initial._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "מחיקה נכשלה");
      setDeleteOpen(false);
      onDeleted();
    } catch (e) {
      onError(e instanceof Error ? e.message : "שגיאה");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
        className={adminFormStickyClassName()}
        noValidate
      >
        <h2>{initial ? `עריכת ${initial.code}` : "קופון חדש"}</h2>

        <section className={styles.formSection}>
          <h3>קוד והיקף</h3>
          <Input
            label="קוד קופון *"
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
        </section>

        <section className={styles.formSection}>
          <h3>הנחה</h3>
          <Select
            label="סוג הנחה"
            options={[
              { value: "percent", label: "אחוזים" },
              { value: "fixed", label: "סכום קבוע (₪)" },
            ]}
            {...register("discountType")}
            error={errors.discountType?.message}
          />
          <div className={styles.row2}>
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
          </div>
          {appliesTo === "products" && selectedProductIds.length > 0 ? (
            <p className={styles.help}>המינימום נבדק לפי סכום המוצרים הזכאים בלבד.</p>
          ) : null}
        </section>

        <section className={styles.formSection}>
          <h3>מגבלות</h3>
          <div className={styles.row2}>
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
              label="מקסימום שימושים ללקוח"
              type="number"
              {...register("maxUsesPerCustomer", {
                setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
              })}
              error={errors.maxUsesPerCustomer?.message}
              dir="ltr"
            />
          </div>
          <Input
            label="תאריך תפוגה"
            type="datetime-local"
            {...register("expiresAt")}
            error={errors.expiresAt?.message}
            dir="ltr"
          />
        </section>

        <section className={styles.formSection}>
          <h3>תצוגה</h3>
          <Textarea
            label="תיאור"
            hint="מוצג ללקוחות בדף הבית עבור קופונים ציבוריים."
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
        </section>

        <AdminFormActions
          saveLabel={initial ? "שמור שינויים" : "צור קופון"}
          loading={isSubmitting}
          backHref="/admin/coupons"
          backLabel="ביטול"
          onBackClick={onCancel}
          renderExtra={
            initial
              ? () => (
                  <>
                    <Button type="button" variant="ghost" onClick={toggleActive}>
                      {initial.isActive ? "השבת" : "הפעל"}
                    </Button>
                    <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
                      מחק
                    </Button>
                  </>
                )
              : undefined
          }
        />
      </form>

      <AdminConfirmModalBody
        open={deleteOpen}
        title="מחיקת קופון"
        description={`למחוק את הקופון ${initial?.code ?? ""}? פעולה זו אינה ניתנת לביטול.`}
        confirmLabel="מחק"
        danger
        loading={deleting}
        onConfirm={() => void onDelete()}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
