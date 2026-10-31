"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink, AdminEmptyRow } from "@/components/admin/admin-board-ui";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";
import { Button } from "@/components/ui/button";
import { deleteLeadershipMember } from "@/actions/about";
import { LEADERSHIP_LEVELS, inferLeadershipLevel } from "@/lib/leadership";

type MemberItem = {
  id: string;
  name: string;
  nameEn: string | null;
  role: string;
  bio: string | null;
  image: string | null;
  level: number;
  published: boolean;
  order: number;
};

type NormalizedMember = MemberItem & { levelLabel: string };

export function AdminLeadershipList({ items }: { items: MemberItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const normalized = useMemo((): NormalizedMember[] => {
    return items.map((item) => {
      const level = item.level > 0 ? item.level : inferLeadershipLevel(item.role);
      const levelLabel =
        LEADERSHIP_LEVELS.find((l) => l.value === level)?.label ?? `${level}단`;
      return { ...item, level, levelLabel };
    });
  }, [items]);

  const getSearchText = useCallback(
    (item: NormalizedMember) =>
      `${item.name} ${item.nameEn ?? ""} ${item.role} ${item.levelLabel}`,
    [],
  );
  const list = useAdminList(normalized, getSearchText);

  return (
    <>
      <AdminPageHeader title="회장단" subtitle={`총 ${items.length}명 · 조직도 단계별 관리`} />
      <AdminBackLink href="/admin/about" />
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
        searchPlaceholder="이름, 직책, 단계 검색..."
        actions={
          <Link href="/admin/about/leadership/new">
            <Button size="sm">임원 등록</Button>
          </Link>
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">단계</th>
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">순서</th>
              <th className="w-32 px-3 py-2.5 text-center font-medium text-muted-foreground">직책</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">이름</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">공개</th>
              <th className="w-40 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody>
            {list.visible.map((item, index) => (
              <tr key={item.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {adminListRowNumber(
                    list.filteredCount,
                    index,
                    list.viewMode,
                    list.page,
                  )}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.levelLabel}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.order}</td>
                <td className="px-3 py-3 text-center font-medium">{item.role}</td>
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/about/leadership/${item.id}`}
                    className="hover:text-brand hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.nameEn ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.nameEn}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {item.published ? "공개" : "비공개"}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="inline-flex justify-center gap-2">
                    <Link href={`/admin/about/leadership/${item.id}`}>
                      <Button size="sm" variant="outline">
                        수정
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending && deletingId === item.id}
                      onClick={() => {
                        if (!confirm(`「${item.name}」을(를) 삭제할까요?`)) return;
                        setDeletingId(item.id);
                        startTransition(async () => {
                          await deleteLeadershipMember(item.id);
                          router.refresh();
                        });
                      }}
                    >
                      삭제
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={7}
                message={
                  items.length === 0 ? "등록된 회장단이 없습니다." : "검색 결과가 없습니다."
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
    </>
  );
}
