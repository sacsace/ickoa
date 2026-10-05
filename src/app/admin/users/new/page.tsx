import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminUsersForm } from "@/components/admin/admin-users-form";

export default async function AdminUsersNewPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    redirect("/admin/users");
  }

  return <AdminUsersForm />;
}
