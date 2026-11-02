"use client";

import { useCallback, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyRow } from "@/components/admin/admin-board-ui";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
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
import { deleteUser } from "@/actions/admin";

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

  const rows: { label: string; value: string }[] = user
    ? [
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
      ]
    : [];

  return (
    <AdminDialog
      open={open && !!user}
      onClose={onClose}
      title="회원 정보"
      scrollBody
      initialFocusRef={closeRef}
      footer={
        <Button ref={closeRef} type="button" size="sm" variant="outline" onClick={onClose}>
          닫기
        </Button>
      }
    >
      <dl className="grid gap-3 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[7rem_1fr] gap-2 border-b border-border pb-2 last:border-0"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="break-all font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </AdminDialog>
  );
}

function UserListSection({
  title,
  users,
  linkMode,
  onSelect,
  onDelete,
  canDelete,
  searchPlaceholder,
  actions,
}: {
  title: string;
  users: UserItem[];
  linkMode: "admin" | "member";
  onSelect?: (user: UserItem) => void;
  onDelete?: (user: UserItem) => void;
  canDelete?: boolean;
  searchPlaceholder: string;
  actions?: ReactNode;
}) {
  const getSearchText = useCallback(
    (user: UserItem) =>
      `${user.name ?? ""} ${user.loginId ?? ""} ${user.email ?? ""} ${ROLE_LABELS[user.role]}`,
    [],
  );
  const list = useAdminList(users, getSearchText);
  const colSpan = canDelete ? 5 : 4;

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
              {canDelete ? (
                <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">
                  관리
                </th>
              ) : null}
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
                {canDelete ? (
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onDelete?.(user)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={colSpan}
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [error, setError] = useState("");
  const adminUsers = users.filter((u) => ADMIN_ROLES.includes(u.role));
  const memberUsers = users.filter((u) => u.role === "MEMBER");

  return (
    <>
      <AdminPageHeader title="회원" subtitle={`총 ${users.length}명`} />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <UserListSection
        title={`관리자 (${adminUsers.length})`}
        users={adminUsers}
        linkMode="admin"
        searchPlaceholder="이름, 계정, 역할 검색..."
        canDelete={isSuperAdmin}
        onDelete={setDeleteTarget}
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
        canDelete={isSuperAdmin}
        onDelete={setDeleteTarget}
      />
      <MemberInfoDialog
        user={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="회원 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.name ?? deleteTarget.email ?? "회원"}」 계정을 삭제합니다. 게시글·댓글 등 관련 데이터도 함께 삭제될 수 있으며 복구할 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            const result = await deleteUser(deleteTarget.id);
            if (result.error) {
              setError(result.error);
              setDeleteTarget(null);
              return;
            }
            setError("");
            setDeleteTarget(null);
            setSelected(null);
            router.refresh();
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
