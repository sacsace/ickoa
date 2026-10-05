"use client";

import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
