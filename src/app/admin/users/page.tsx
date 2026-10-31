import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AdminUsersList } from "@/components/admin/admin-users-list";
import { getAdminUser } from "@/lib/session-kind";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  const admin = getAdminUser(session);
  // loginId null 회원은 SQL NOT (loginId = 'root')에서 빠져 목록이 0이 됨 → null 포함
  const users = await prisma.user.findMany({
    where: {
      OR: [{ loginId: null }, { loginId: { not: "root" } }],
    },
    select: {
      id: true,
      name: true,
      loginId: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          posts: true,
          comments: true,
          eventRegs: true,
          clubMembers: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminUsersList
      users={users}
      isSuperAdmin={admin?.role === "SUPER_ADMIN"}
    />
  );
}
