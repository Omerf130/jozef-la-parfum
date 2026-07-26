"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Input, Textarea } from "@/components/Input";
import { categorySchema, type CategoryInput } from "@/lib/validation/category";
import type { CategoryDTO } from "@/types";
import { AdminConfirmModalBody } from "@/features/admin/ui/AdminConfirmModalBody";
import { AdminFeedback } from "@/features/admin/ui/AdminFeedback";
import { AdminFormActions, adminFormStickyClassName } from "@/features/admin/ui/AdminFormActions";
import { scrollToFirstError } from "@/features/admin/ui/scrollToFirstError";
import { useUnsavedChangesGuard } from "@/features/admin/ui/useUnsavedChangesGuard";
import styles from "./CategoriesManager.module.scss";

interface CategoriesManagerProps {
  initial: CategoryDTO[];
}

export function CategoriesManager({ initial }: CategoriesManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [formDirty, setFormDirty] = useState(false);
  const { leaveOpen, guardNavigation, confirmLeave, cancelLeave } = useUnsavedChangesGuard(formDirty);

  function selectCategory(c: CategoryDTO | null) {
    guardNavigation(() => {
      setEditing(c);
      setFeedback(null);
    });
  }

  return (
    <div className={styles.layout}>
      <div className={styles.list}>
        <header>
          <h2>קטגוריות</h2>
          <Button variant="ghost" onClick={() => selectCategory(null)}>
            + חדש
          </Button>
        </header>
        {initial.length === 0 ? (
          <EmptyState
            title="אין קטגוריות"
            description="צרו קטגוריה ראשונה לארגון המוצרים."
            action={
              <Button variant="ghost" onClick={() => selectCategory(null)}>
                + קטגוריה חדשה
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
                <button type="button" onClick={() => selectCategory(c)}>
                  <strong>{c.name}</strong>
                  <small>/{c.slug}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.editor}>
        <CategoryForm
          key={editing?._id ?? "new"}
          initial={editing}
          onDirtyChange={setFormDirty}
          onCancel={() => selectCategory(null)}
          onSaved={() => {
            setFeedback({ type: "success", text: "נשמר בהצלחה" });
            setEditing(null);
            setFormDirty(false);
            router.refresh();
          }}
          onError={(msg) => setFeedback(msg ? { type: "error", text: msg } : null)}
          onDeleted={() => {
            setFeedback({ type: "success", text: "הקטגוריה נמחקה" });
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

interface CategoryFormProps {
  initial: CategoryDTO | null;
  onDirtyChange: (dirty: boolean) => void;
  onCancel: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
  onDeleted: () => void;
}

function CategoryForm({ initial, onDirtyChange, onCancel, onSaved, onError, onDeleted }: CategoryFormProps) {
  const [uploading, setUploading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initial
      ? {
          name: initial.name,
          slug: initial.slug,
          description: initial.description ?? "",
          image: initial.image ?? "",
        }
      : { name: "", slug: "", description: "", image: "" },
  });

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const imageUrl = watch("image");
  const isBlobUrl =
    typeof imageUrl === "string" &&
    /^https:\/\/[^/]*\.public\.blob\.vercel-storage\.com\//.test(imageUrl);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", "categories");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "העלאה נכשלה");
      setValue("image", data.url, { shouldDirty: true });
    } catch (err) {
      onError(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function clearImage() {
    setValue("image", "", { shouldDirty: true });
  }

  async function onSubmit(values: CategoryInput) {
    try {
      const url = initial ? `/api/categories/${initial._id}` : "/api/categories";
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

  async function onDelete() {
    if (!initial) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${initial._id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "מחיקה נכשלה");
      }
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
        <h2>{initial ? "עריכת קטגוריה" : "קטגוריה חדשה"}</h2>

        <section className={styles.formSection}>
          <h3>פרטים</h3>
          <Input label="שם *" {...register("name")} error={errors.name?.message} />
          <Input label="Slug" {...register("slug")} hint="ייווצר אוטומטית אם נשאר ריק" />
          <Textarea label="תיאור" rows={3} {...register("description")} />
        </section>

        <section className={styles.formSection}>
          <h3>תמונה</h3>
          <input type="hidden" {...register("image")} />
          <div className={styles.imageField}>
            {imageUrl ? (
              <>
                <div className={styles.imagePreview}>
                  {isBlobUrl ? (
                    <Image src={imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 200px" />
                  ) : (
                    <div className={styles.imageFallback}>
                      <span>תמונה לא תקינה</span>
                      <small dir="ltr">{imageUrl}</small>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={clearImage}
                    className={styles.removeImg}
                    aria-label="הסר תמונה"
                  >
                    ×
                  </button>
                </div>
                <label className={styles.replaceLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    hidden
                  />
                  <span>{uploading ? "מעלה…" : "החלף תמונה"}</span>
                </label>
              </>
            ) : (
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  hidden
                />
                <span>{uploading ? "מעלה…" : "+ העלאת תמונה"}</span>
              </label>
            )}
          </div>
        </section>

        <AdminFormActions
          saveLabel={initial ? "שמור" : "צור"}
          loading={isSubmitting}
          backHref="/admin/categories"
          backLabel="ביטול"
          onBackClick={onCancel}
          renderExtra={
            initial
              ? () => (
                  <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
                    מחק
                  </Button>
                )
              : undefined
          }
        />
      </form>

      <AdminConfirmModalBody
        open={deleteOpen}
        title="מחיקת קטגוריה"
        description="האם למחוק את הקטגוריה? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחק"
        danger
        loading={deleting}
        onConfirm={() => void onDelete()}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
