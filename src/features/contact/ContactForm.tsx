"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/Input";
import { contactSchema, type ContactInput } from "@/lib/validation/contact";
import styles from "./ContactForm.module.scss";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(values: ContactInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "שליחה נכשלה");
      }
      setSubmitted(true);
      reset();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "שגיאה בלתי צפויה");
    }
  }

  if (submitted) {
    return (
      <div className={styles.thanks}>
        <h2>תודה על פנייתך!</h2>
        <p>קיבלנו את ההודעה ונחזור אליך בהקדם האפשרי.</p>
        <Button onClick={() => setSubmitted(false)} variant="ghost">
          שלח הודעה נוספת
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <h2 className={styles.title}>שליחת הודעה</h2>

      <div className={styles.row}>
        <Input
          label="שם מלא"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label='דוא"ל'
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
      </div>

      <div className={styles.row}>
        <Input
          label="טלפון (אופציונלי)"
          type="tel"
          {...register("phone")}
          error={errors.phone?.message}
        />
        <Input
          label="נושא"
          {...register("subject")}
          error={errors.subject?.message}
        />
      </div>

      <Textarea
        label="הודעה"
        rows={5}
        {...register("message")}
        error={errors.message?.message}
      />

      {serverError ? <p className={styles.serverError}>{serverError}</p> : null}

      <Button type="submit" loading={isSubmitting} fullWidth size="lg">
        שלח
      </Button>
    </form>
  );
}
