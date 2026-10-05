import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AdminUsersList } from "@/components/admin/admin-users-list";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
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
      isSuperAdmin={session?.user?.role === "SUPER_ADMIN"}
    />
  );
}
