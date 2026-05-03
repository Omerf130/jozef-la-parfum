"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validation/admin";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  async function onSubmit(values: AdminLoginInput) {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (result?.error) {
      setServerError("פרטי התחברות שגויים");
      return;
    }
    router.replace(from);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        label="דוא&quot;ל"
        type="email"
        autoComplete="email"
        dir="ltr"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="סיסמה"
        type="password"
        autoComplete="current-password"
        dir="ltr"
        {...register("password")}
        error={errors.password?.message}
      />
      {serverError ? (
        <p
          style={{
            color: "#b3261e",
            fontSize: "0.9rem",
            margin: "0 0 12px",
          }}
        >
          {serverError}
        </p>
      ) : null}
      <Button type="submit" loading={isSubmitting} fullWidth size="lg">
        התחבר
      </Button>
    </form>
  );
}
