import { AdminShellClient } from "./AdminShellClient";

interface AdminShellProps {
  email: string;
  children: React.ReactNode;
  logoutAction: () => Promise<void>;
}

export function AdminShell({ email, children, logoutAction }: AdminShellProps) {
  return (
    <AdminShellClient email={email} logoutAction={logoutAction}>
      {children}
    </AdminShellClient>
  );
}
