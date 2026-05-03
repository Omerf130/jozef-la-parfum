import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminShell } from "@/features/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <AdminShell email={session.user.email ?? ""} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  );
}
