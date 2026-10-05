import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AdminUsersDetail } from "@/components/admin/admin-users-detail";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      loginId: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  return (
    <AdminUsersDetail
      user={user}
      isSuperAdmin={session?.user?.role === "SUPER_ADMIN"}
    />
  );
}
