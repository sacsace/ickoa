"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Role } from "@prisma/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyRow } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { formatKoDateTime } from "@/components/admin/admin-board-ui";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";

const ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "COMMUNITY_ADMIN",
  "EVENT_ADMIN",
];
const ROLE_LABELS: Record<Role, string> = {
  MEMBER: "회원",
  SUPER_ADMIN: "Root 관리자",
  CONTENT_ADMIN: "콘텐츠 관리자",
  COMMUNITY_ADMIN: "커뮤니티 관리자",
  EVENT_ADMIN: "이벤트 관리자",
};

type UserItem = {
  id: string;
  name: string | null;
  loginId: string | null;
  email: string | null;
  role: Role;
  createdAt: Date | string;
  emailVerified: Date | string | null;
  _count: {
    posts: number;
    comments: number;
    eventRegs: number;
    clubMembers: number;
  };
};

function MemberInfoDialog({
  user,
  open,
  onClose,
}: {
  user: UserItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !user) return null;

  const rows: { label: string; value: string }[] = [
    { label: "이름", value: user.name?.trim() || "—" },
    {
      label: "계정",
      value: user.loginId ? `@${user.loginId}` : user.email ?? "—",
    },
    { label: "이메일", value: user.email ?? "—" },
    { label: "역할", value: ROLE_LABELS[user.role] },
    { label: "가입일", value: formatKoDateTime(user.createdAt) },
    {
      label: "이메일 인증",
      value: user.emailVerified ? formatKoDateTime(user.emailVerified) : "미인증",
    },
    { label: "게시글", value: `${user._count.posts}건` },
    { label: "댓글", value: `${user._count.comments}건` },
    { label: "행사 참가", value: `${user._count.eventRegs}건` },
    { label: "동호회", value: `${user._count.clubMembers}개` },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-info-title"
        className="relative w-full max-w-md border border-border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="member-info-title" className="text-base font-semibold text-foreground">
          회원 정보
        </h2>
        <dl className="mt-4 grid gap-3 text-sm">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[7rem_1fr] gap-2 border-b border-border pb-2 last:border-0"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium text-foreground break-all">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex justify-end">
          <Button ref={closeRef} type="button" size="sm" variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserListSection({
  title,
  users,
  linkMode,
  onSelect,
  searchPlaceholder,
  actions,
}: {
  title: string;
  users: UserItem[];
  linkMode: "admin" | "member";
  onSelect?: (user: UserItem) => void;
  searchPlaceholder: string;
  actions?: ReactNode;
}) {
  const getSearchText = useCallback(
    (user: UserItem) =>
      `${user.name ?? ""} ${user.loginId ?? ""} ${user.email ?? ""} ${ROLE_LABELS[user.role]}`,
    [],
  );
  const list = useAdminList(users, getSearchText);

  return (
    <section className="mb-8 last:mb-0">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      <AdminListControls
        query={list.query}
        onQueryChange={list.setQuery}
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        filteredCount={list.filteredCount}
        totalCount={list.totalCount}
        searchPlaceholder={searchPlaceholder}
        actions={actions}
      />
      <AdminTableShell>
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">이름</th>
              <th className="w-40 px-3 py-2.5 text-center font-medium text-muted-foreground">계정</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">역할</th>
            </tr>
          </thead>
          <tbody>
            {list.visible.map((user, index) => (
              <tr key={user.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {adminListRowNumber(
                    list.filteredCount,
                    index,
                    list.viewMode,
                    list.page,
                  )}
                </td>
                <td className="px-3 py-3">
                  {linkMode === "admin" ? (
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium hover:text-brand hover:underline"
                    >
                      {user.name ?? "—"}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelect?.(user)}
                      className="font-medium text-left hover:text-brand hover:underline"
                    >
                      {user.name ?? "—"}
                    </button>
                  )}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {user.loginId ? `@${user.loginId}` : user.email ?? "—"}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {ROLE_LABELS[user.role]}
                </td>
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={4}
                message={
                  users.length === 0 ? "목록이 비어 있습니다." : "검색 결과가 없습니다."
                }
              />
            )}
          </tbody>
        </table>
      </AdminTableShell>
      <AdminListPaginationFooter
        viewMode={list.viewMode}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
      />
    </section>
  );
}

export function AdminUsersList({
  users,
  isSuperAdmin,
}: {
  users: UserItem[];
  isSuperAdmin: boolean;
}) {
  const [selected, setSelected] = useState<UserItem | null>(null);
  const adminUsers = users.filter((u) => ADMIN_ROLES.includes(u.role));
  const memberUsers = users.filter((u) => u.role === "MEMBER");

  return (
    <>
      <AdminPageHeader title="회원" subtitle={`총 ${users.length}명`} />
      <UserListSection
        title={`관리자 (${adminUsers.length})`}
        users={adminUsers}
        linkMode="admin"
        searchPlaceholder="이름, 계정, 역할 검색..."
        actions={
          isSuperAdmin ? (
            <Link href="/admin/users/new">
              <Button size="sm">관리자 등록</Button>
            </Link>
          ) : undefined
        }
      />
      <UserListSection
        title={`일반 회원 (${memberUsers.length})`}
        users={memberUsers}
        linkMode="member"
        onSelect={setSelected}
        searchPlaceholder="이름, 계정 검색..."
      />
      <MemberInfoDialog
        user={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
