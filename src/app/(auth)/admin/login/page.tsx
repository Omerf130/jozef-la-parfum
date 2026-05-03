import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/features/admin/LoginForm";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "כניסת מנהל",
  robots: { index: false },
};

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "admin") {
    redirect("/admin");
  }
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.head}>
          <span className={styles.brandMark}>J</span>
          <h1>כניסת מנהל</h1>
          <p>הזן את פרטי הכניסה לניהול הבוטיק.</p>
        </header>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
