"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Role } from "@prisma/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { updateUserRole } from "@/actions/admin";

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "CONTENT_ADMIN", "COMMUNITY_ADMIN", "EVENT_ADMIN"];
const ROLE_LABELS: Record<Role, string> = {
  MEMBER: "회원",
  SUPER_ADMIN: "Root 관리자",
  CONTENT_ADMIN: "콘텐츠 관리자",
  COMMUNITY_ADMIN: "커뮤니티 관리자",
  EVENT_ADMIN: "이벤트 관리자",
};

type UserDetail = {
  id: string;
  name: string | null;
  loginId: string | null;
  email: string | null;
  role: Role;
  createdAt: Date;
};

export function AdminUsersDetail({
  user,
  isSuperAdmin,
}: {
  user: UserDetail;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isAdmin = ADMIN_ROLES.includes(user.role);

  return (
    <>
      <AdminPageHeader title="회원 상세" />
      <AdminBackLink href="/admin/users" />
      <article className="border border-border p-4 md:p-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">이름</dt><dd className="mt-1 font-medium">{user.name ?? "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">아이디</dt><dd className="mt-1">{user.loginId ? `@${user.loginId}` : "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">이메일</dt><dd className="mt-1">{user.email ?? "—"}</dd></div>
          <div>
            <dt className="text-xs text-muted-foreground">역할</dt>
            <dd className="mt-1">
              {isSuperAdmin && isAdmin && user.loginId !== "root" ? (
                <select
                  value={user.role}
                  disabled={isPending}
                  onChange={(e) => startTransition(async () => { await updateUserRole(user.id, e.target.value as Role); router.refresh(); })}
                  className="border border-border bg-background px-3 py-1.5 text-sm"
                >
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              ) : (
                ROLE_LABELS[user.role]
              )}
            </dd>
          </div>
        </dl>
      </article>
    </>
  );
}
