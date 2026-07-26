"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { AdminFeedback } from "@/features/admin/ui/AdminFeedback";
import { MAX_HERO_IMAGES } from "@/lib/validation/siteSettings";
import styles from "./HeroImagesManager.module.scss";

interface HeroImagesManagerProps {
  initialDesktop: string[];
  initialMobile: string[];
}

function HeroSection({
  title,
  target,
  urls,
  uploading,
  pendingRemove,
  onUpload,
  onRemove,
  emptyTitle,
  emptyDescription,
  aspectClass,
}: {
  title: string;
  target: "desktop" | "mobile";
  urls: string[];
  uploading: null | "desktop" | "mobile";
  pendingRemove: string | null;
  onUpload: (target: "desktop" | "mobile", file: File) => void | Promise<void>;
  onRemove: (target: "desktop" | "mobile", url: string) => void | Promise<void>;
  emptyTitle: string;
  emptyDescription: string;
  aspectClass: string;
}) {
  const isUploading = uploading === target;
  const atLimit = urls.length >= MAX_HERO_IMAGES;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.toolbar}>
        <label className={styles.fileLabel}>
          <input
            type="file"
            accept="image/*"
            className={styles.fileInput}
            disabled={uploading !== null || atLimit}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void onUpload(target, f);
            }}
          />
          <span>{isUploading ? "מעלה..." : "+ העלאת תמונה"}</span>
        </label>
        <span className={styles.count}>
          {urls.length} / {MAX_HERO_IMAGES}
        </span>
      </div>

      {urls.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul className={styles.grid}>
          {urls.map((url) => (
            <li key={url} className={styles.tile}>
              <div className={`${styles.thumb} ${aspectClass}`}>
                <Image src={url} alt="" fill sizes="(max-width: 768px) 45vw, 200px" className={styles.thumbImg} />
              </div>
              <code className={styles.url} title={url}>
                {url}
              </code>
              <div className={styles.tileActions}>
                <label className={styles.replaceLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    disabled={uploading !== null}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) {
                        void (async () => {
                          await onRemove(target, url);
                          await onUpload(target, f);
                        })();
                      }
                    }}
                  />
                  <span>החלף</span>
                </label>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={pendingRemove === url}
                  disabled={pendingRemove !== null && pendingRemove !== url}
                  onClick={() => void onRemove(target, url)}
                >
                  הסר
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function HeroImagesManager({ initialDesktop, initialMobile }: HeroImagesManagerProps) {
  const router = useRouter();
  const [desktop, setDesktop] = useState<string[]>(initialDesktop);
  const [mobile, setMobile] = useState<string[]>(initialMobile);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState<null | "desktop" | "mobile">(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  async function persist(nextDesktop: string[], nextMobile: string[]) {
    const res = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroImagesDesktop: nextDesktop,
        heroImagesMobile: nextMobile,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "שמירה נכשלה");
    }
    setDesktop(data.heroImagesDesktop as string[]);
    setMobile(data.heroImagesMobile as string[]);
  }

  async function handleUpload(target: "desktop" | "mobile", file: File) {
    setError(null);
    setSuccess(null);
    const list = target === "desktop" ? desktop : mobile;
    if (list.length >= MAX_HERO_IMAGES) {
      setError(`ניתן להעלות עד ${MAX_HERO_IMAGES} תמונות לכל קטגוריה`);
      return;
    }
    setUploading(target);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("prefix", "hero");
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok) {
        throw new Error(typeof upData.error === "string" ? upData.error : "העלאה נכשלה");
      }
      const url = upData.url as string;
      const nextDesktop = target === "desktop" ? [...desktop, url] : desktop;
      const nextMobile = target === "mobile" ? [...mobile, url] : mobile;
      await persist(nextDesktop, nextMobile);
      setSuccess(target === "desktop" ? "תמונת דסקטופ נשמרה" : "תמונת מובייל נשמרה");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setUploading(null);
    }
  }

  async function handleRemove(target: "desktop" | "mobile", url: string) {
    setError(null);
    setSuccess(null);
    setPendingRemove(url);
    try {
      const nextDesktop = target === "desktop" ? desktop.filter((u) => u !== url) : desktop;
      const nextMobile = target === "mobile" ? mobile.filter((u) => u !== url) : mobile;
      await persist(nextDesktop, nextMobile);
      setSuccess("התמונה הוסרה");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setPendingRemove(null);
    }
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>
        דסקטופ: תמונות אופקיות למסכים רחבים (מעל 768px). מובייל: תמונות אנכיות (עד 768px).
        אם לא הוגדרו תמונות מובייל, יוצגו תמונות הדסקטופ גם במובייל. יותר מתמונה אחת — מעבר
        אוטומטי כל 6 שניות.
      </p>

      {error ? <AdminFeedback variant="error" message={error} /> : null}
      {success ? <AdminFeedback variant="success" message={success} /> : null}

      <HeroSection
        title="דסקטופ (מעל 768px) — תמונות אופקיות"
        target="desktop"
        urls={desktop}
        uploading={uploading}
        pendingRemove={pendingRemove}
        onUpload={handleUpload}
        onRemove={handleRemove}
        emptyTitle="אין תמונות דסקטופ"
        emptyDescription="העלו תמונות אופקיות לתצוגה במסכים רחבים."
        aspectClass={styles.thumbLandscape}
      />

      <HeroSection
        title="מובייל (עד 768px) — תמונות אנכיות"
        target="mobile"
        urls={mobile}
        uploading={uploading}
        pendingRemove={pendingRemove}
        onUpload={handleUpload}
        onRemove={handleRemove}
        emptyTitle="אין תמונות מובייל"
        emptyDescription="יוצגו תמונות הדסקטופ (אם קיימות) — או העלו תמונות אנכיות."
        aspectClass={styles.thumbPortrait}
      />
    </div>
  );
}
