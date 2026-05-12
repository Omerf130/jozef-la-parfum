"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { MAX_HERO_IMAGES } from "@/lib/validation/siteSettings";
import styles from "./HeroImagesManager.module.scss";

interface HeroImagesManagerProps {
  initialDesktop: string[];
  initialMobile: string[];
}

export function HeroImagesManager({ initialDesktop, initialMobile }: HeroImagesManagerProps) {
  const router = useRouter();
  const [desktop, setDesktop] = useState<string[]>(initialDesktop);
  const [mobile, setMobile] = useState<string[]>(initialMobile);
  const [error, setError] = useState<string | null>(null);
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
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setUploading(null);
    }
  }

  async function handleRemove(target: "desktop" | "mobile", url: string) {
    setError(null);
    setPendingRemove(url);
    try {
      const nextDesktop = target === "desktop" ? desktop.filter((u) => u !== url) : desktop;
      const nextMobile = target === "mobile" ? mobile.filter((u) => u !== url) : mobile;
      await persist(nextDesktop, nextMobile);
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
        דסקטופ: תמונות אופקיות למסכים רחבים (מעל 768px). מובייל: תמונות אנכיות
        (עד 768px). אם לא הוגדרו תמונות מובייל, יוצגו תמונות הדסקטופ גם במובייל.
        יותר מתמונה אחת ברשימה — מעבר אוטומטי כל 6 שניות.
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>דסקטופ (מעל 768px) — תמונות אופקיות</h2>
        <div className={styles.toolbar}>
          <label className={styles.fileLabel}>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              disabled={uploading !== null || desktop.length >= MAX_HERO_IMAGES}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void handleUpload("desktop", f);
              }}
            />
            <span>{uploading === "desktop" ? "מעלה..." : "+ העלאת תמונה"}</span>
          </label>
          <span className={styles.count}>
            {desktop.length} / {MAX_HERO_IMAGES}
          </span>
        </div>
        {desktop.length === 0 ? (
          <p className={styles.empty}>אין תמונות דסקטופ.</p>
        ) : (
          <ul className={styles.list}>
            {desktop.map((url) => (
              <li key={url} className={styles.row}>
                <div className={styles.thumb}>
                  <Image src={url} alt="" fill sizes="120px" className={styles.thumbImg} />
                </div>
                <code className={styles.url}>{url}</code>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={pendingRemove === url}
                  disabled={pendingRemove !== null && pendingRemove !== url}
                  onClick={() => void handleRemove("desktop", url)}
                >
                  הסר
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>מובייל (עד 768px) — תמונות אנכיות</h2>
        <div className={styles.toolbar}>
          <label className={styles.fileLabel}>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              disabled={uploading !== null || mobile.length >= MAX_HERO_IMAGES}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void handleUpload("mobile", f);
              }}
            />
            <span>{uploading === "mobile" ? "מעלה..." : "+ העלאת תמונה"}</span>
          </label>
          <span className={styles.count}>
            {mobile.length} / {MAX_HERO_IMAGES}
          </span>
        </div>
        {mobile.length === 0 ? (
          <p className={styles.empty}>
            אין תמונות מובייל — יוצגו תמונות הדסקטופ (אם קיימות).
          </p>
        ) : (
          <ul className={styles.list}>
            {mobile.map((url) => (
              <li key={url} className={styles.row}>
                <div className={styles.thumb}>
                  <Image src={url} alt="" fill sizes="120px" className={styles.thumbImg} />
                </div>
                <code className={styles.url}>{url}</code>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={pendingRemove === url}
                  disabled={pendingRemove !== null && pendingRemove !== url}
                  onClick={() => void handleRemove("mobile", url)}
                >
                  הסר
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
