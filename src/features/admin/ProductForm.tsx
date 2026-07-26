"use client";



import Image from "next/image";

import { useRouter } from "next/navigation";

import { useState } from "react";

import { useForm, useFieldArray } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/Button";

import { EmptyState } from "@/components/EmptyState";

import { Input, Textarea } from "@/components/Input";

import { Select } from "@/components/Select";

import { productSchema, type ProductInput } from "@/lib/validation/product";

import type { CategoryDTO, ProductDTO } from "@/types";

import { AdminConfirmModalBody } from "@/features/admin/ui/AdminConfirmModalBody";

import { AdminFeedback } from "@/features/admin/ui/AdminFeedback";

import { AdminFormActions, adminFormStickyClassName } from "@/features/admin/ui/AdminFormActions";

import { scrollToFirstError } from "@/features/admin/ui/scrollToFirstError";

import { useUnsavedChangesGuard } from "@/features/admin/ui/useUnsavedChangesGuard";

import styles from "./ProductForm.module.scss";



interface ProductFormProps {

  categories: CategoryDTO[];

  initial?: ProductDTO;

  returnTo?: string;

}



export function ProductForm({ categories, initial, returnTo = "/admin/products" }: ProductFormProps) {

  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);

  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const [deactivating, setDeactivating] = useState(false);



  const {

    register,

    control,

    handleSubmit,

    formState: { errors, isSubmitting, isDirty },

    setValue,

    watch,

  } = useForm<ProductInput>({

    resolver: zodResolver(productSchema),

    defaultValues: initial

      ? {

          ...initial,

          category:

            typeof initial.category === "object"

              ? initial.category._id

              : (initial.category as string),

          salePrice: initial.salePrice ?? undefined,

        }

      : {

          name: "",

          brand: "",

          description: "",

          price: 0,

          category: categories[0]?._id ?? "",

          gender: "unisex",

          concentration: "EDP",

          sizes: [{ ml: 50, price: 0, stock: 0 }],

          notes: { top: [], middle: [], base: [] },

          images: [],

          isFeatured: false,

          isActive: true,

        },

  });



  const { leaveOpen, guardNavigation, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  const sizesArray = useFieldArray({ control, name: "sizes" });

  const images = watch("images") ?? [];



  const setNotes = (level: "top" | "middle" | "base", v: string) => {

    setValue(

      `notes.${level}`,

      v

        .split(",")

        .map((s) => s.trim())

        .filter(Boolean),

      { shouldDirty: true },

    );

  };



  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {

    const files = e.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);

    try {

      const next: string[] = [...images];

      for (const file of Array.from(files)) {

        const formData = new FormData();

        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "העלאה נכשלה");

        next.push(data.url);

      }

      setValue("images", next, { shouldDirty: true });

    } catch (err) {

      setServerError(err instanceof Error ? err.message : "שגיאה בהעלאה");

    } finally {

      setUploading(false);

    }

  }



  function removeImage(idx: number) {

    setValue(

      "images",

      images.filter((_, i) => i !== idx),

      { shouldDirty: true },

    );

  }



  async function onSubmit(values: ProductInput) {

    setServerError(null);

    try {

      const url = initial ? `/api/products/${initial._id}` : "/api/products";

      const method = initial ? "PATCH" : "POST";

      const res = await fetch(url, {

        method,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(values),

      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "שמירה נכשלה");

      router.push(returnTo);

      router.refresh();

    } catch (e) {

      setServerError(e instanceof Error ? e.message : "שגיאה");

    }

  }



  async function onDeactivate() {

    if (!initial) return;

    setDeactivating(true);

    try {

      const res = await fetch(`/api/products/${initial._id}`, { method: "DELETE" });

      if (!res.ok) {

        const data = await res.json();

        throw new Error(data.error || "מחיקה נכשלה");

      }

      setDeactivateOpen(false);

      router.push(returnTo);

      router.refresh();

    } catch (e) {

      setServerError(e instanceof Error ? e.message : "שגיאה");

      setDeactivateOpen(false);

    } finally {

      setDeactivating(false);

    }

  }



  function handleBack() {

    guardNavigation(() => router.push(returnTo));

  }



  return (

    <>

      <form

        onSubmit={handleSubmit(onSubmit, scrollToFirstError)}

        className={`${styles.form} ${adminFormStickyClassName()}`}

        noValidate

      >

        <div className={styles.grid}>

          <section className={styles.section}>

            <h2>פרטי מוצר</h2>

            <div className={styles.fieldStack}>

              <div className={styles.required}>

                <Input label="שם" {...register("name")} error={errors.name?.message} />

              </div>

              <div className={styles.required}>

                <Input label="יצרן" {...register("brand")} error={errors.brand?.message} />

              </div>

              <Input label="כתובת קצרה (slug)" {...register("slug")} hint="ייווצר אוטומטית אם נשאר ריק" />

              <div className={styles.required}>

                <Textarea label="תיאור" rows={5} {...register("description")} error={errors.description?.message} />

              </div>

            </div>

          </section>



          <section className={styles.section}>

            <h2>תמחור</h2>

            <div className={styles.row2}>

              <Input

                label="מחיר (₪)"

                type="number"

                step="0.01"

                {...register("price", { valueAsNumber: true })}

                error={errors.price?.message}

              />

              <Input

                label="מחיר מבצע (₪)"

                type="number"

                step="0.01"

                {...register("salePrice", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}

                error={errors.salePrice?.message}

              />

            </div>

          </section>



          <section className={styles.section}>

            <h2>סיווג</h2>

            <div className={styles.row3}>

              <div className={styles.required}>

                <Select

                  label="קטגוריה"

                  {...register("category")}

                  options={categories.map((c) => ({ value: c._id, label: c.name }))}

                  error={errors.category?.message}

                />

              </div>

              <Select

                label="מין"

                {...register("gender")}

                options={[

                  { value: "male", label: "לגבר" },

                  { value: "female", label: "לאישה" },

                  { value: "unisex", label: "יוניסקס" },

                ]}

              />

              <Select

                label="ריכוז"

                {...register("concentration")}

                options={[

                  { value: "EDT", label: "EDT" },

                  { value: "EDP", label: "EDP" },

                  { value: "Parfum", label: "Parfum" },

                  { value: "Cologne", label: "Cologne" },

                ]}

              />

            </div>

          </section>



          <section className={styles.section}>

            <h2>סטטוס</h2>

            <div className={styles.checks}>

              <label>

                <input type="checkbox" {...register("isFeatured")} /> מוצר מומלץ

              </label>

              <label>

                <input type="checkbox" {...register("isActive")} /> פעיל לתצוגה

              </label>

            </div>

          </section>



          <section className={`${styles.section} ${styles.fullWidth}`}>

            <h2>גדלים ומלאי</h2>

            {sizesArray.fields.map((f, i) => (

              <div key={f.id} className={styles.sizeRow}>

                <Input

                  label="מ״ל"

                  type="number"

                  {...register(`sizes.${i}.ml`, { valueAsNumber: true })}

                />

                <Input

                  label="מחיר"

                  type="number"

                  step="0.01"

                  {...register(`sizes.${i}.price`, { valueAsNumber: true })}

                />

                <Input

                  label="מלאי"

                  type="number"

                  {...register(`sizes.${i}.stock`, { valueAsNumber: true })}

                />

                <button

                  type="button"

                  onClick={() => sizesArray.remove(i)}

                  className={styles.removeSize}

                  aria-label="הסר גודל"

                >

                  ×

                </button>

              </div>

            ))}

            <Button

              type="button"

              variant="ghost"

              onClick={() => sizesArray.append({ ml: 50, price: 0, stock: 0 })}

            >

              + הוסף גודל

            </Button>

            {errors.sizes?.message ? (

              <p className={styles.fieldError}>{errors.sizes.message}</p>

            ) : null}

          </section>



          <section className={styles.section}>

            <h2>פירמידת ניחוח</h2>

            <div className={styles.fieldStack}>

              <Input

                label="צמרת (מופרדים בפסיק)"

                defaultValue={initial?.notes.top.join(", ")}

                onChange={(e) => setNotes("top", e.target.value)}

              />

              <Input

                label="לב"

                defaultValue={initial?.notes.middle.join(", ")}

                onChange={(e) => setNotes("middle", e.target.value)}

              />

              <Input

                label="בסיס"

                defaultValue={initial?.notes.base.join(", ")}

                onChange={(e) => setNotes("base", e.target.value)}

              />

            </div>

          </section>



          <section className={`${styles.section} ${styles.fullWidth}`}>

            <h2>תמונות</h2>

            {images.length === 0 ? (

              <EmptyState title="אין תמונות" description="העלו תמונות מוצר להצגה בחנות." />

            ) : (

              <div className={styles.images}>

                {images.map((src, i) => (

                  <div key={src + i} className={styles.imageItem}>

                    <Image src={src} alt="" fill sizes="(max-width: 768px) 45vw, 140px" />

                    <button

                      type="button"

                      onClick={() => removeImage(i)}

                      className={styles.removeImg}

                      aria-label="הסר תמונה"

                    >

                      ×

                    </button>

                  </div>

                ))}

              </div>

            )}

            <label className={styles.uploadLabel}>

              <input

                type="file"

                accept="image/*"

                multiple

                onChange={handleUpload}

                disabled={uploading}

                hidden

              />

              <span>{uploading ? "מעלה…" : "+ העלאת תמונות"}</span>

            </label>

          </section>

        </div>



        {serverError ? <AdminFeedback variant="error" message={serverError} /> : null}



        <AdminFormActions

          saveLabel={initial ? "שמור שינויים" : "צור מוצר"}

          loading={isSubmitting}

          backHref={returnTo}

          backLabel="חזרה"

          onBackClick={handleBack}

          renderExtra={

            initial

              ? () => (

                  <Button type="button" variant="danger" onClick={() => setDeactivateOpen(true)}>

                    השבת מוצר

                  </Button>

                )

              : undefined

          }

        />

      </form>



      <AdminConfirmModalBody

        open={deactivateOpen}

        title="השבתת מוצר"

        description="האם להשבית את המוצר? לא יוצג ללקוחות."

        confirmLabel="השבת"

        danger

        loading={deactivating}

        onConfirm={() => void onDeactivate()}

        onClose={() => setDeactivateOpen(false)}

      />



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

