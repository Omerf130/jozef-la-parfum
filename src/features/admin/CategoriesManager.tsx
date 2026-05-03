"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { categorySchema, type CategoryInput } from "@/lib/validation/category";
import type { CategoryDTO } from "@/types";
import styles from "./CategoriesManager.module.scss";

interface CategoriesManagerProps {
  initial: CategoryDTO[];
}

export function CategoriesManager({ initial }: CategoriesManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={styles.layout}>
      <div className={styles.list}>
        <header>
          <h2>קטגוריות</h2>
          <Button variant="ghost" onClick={() => setEditing(null)}>
            + חדש
          </Button>
        </header>
        {initial.length === 0 ? (
          <p className={styles.empty}>אין קטגוריות</p>
        ) : (
          <ul>
            {initial.map((c) => (
              <li
                key={c._id}
                className={editing?._id === c._id ? styles.activeItem : ""}
              >
                <button onClick={() => setEditing(c)}>
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

interface CategoryFormProps {
  initial: CategoryDTO | null;
  onSaved: () => void;
  onError: (msg: string) => void;
  onDeleted: () => void;
}

function CategoryForm({ initial, onSaved, onError, onDeleted }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
    if (!confirm("האם למחוק את הקטגוריה?")) return;
    try {
      const res = await fetch(`/api/categories/${initial._id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "מחיקה נכשלה");
      }
      onDeleted();
    } catch (e) {
      onError(e instanceof Error ? e.message : "שגיאה");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>{initial ? "עריכת קטגוריה" : "קטגוריה חדשה"}</h2>
      <Input label="שם" {...register("name")} error={errors.name?.message} />
      <Input label="Slug" {...register("slug")} hint="ייווצר אוטומטית אם נשאר ריק" />
      <Textarea label="תיאור" rows={3} {...register("description")} />
      <Input label="כתובת תמונה" {...register("image")} dir="ltr" />
      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting}>
          {initial ? "שמור" : "צור"}
        </Button>
        {initial ? (
          <Button type="button" variant="danger" onClick={onDelete}>
            מחק
          </Button>
        ) : null}
      </div>
    </form>
  );
}
