"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink, AdminEmptyRow } from "@/components/admin/admin-board-ui";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";
import { Button } from "@/components/ui/button";
import { deleteGuideCategory } from "@/actions/admin";

type CategoryItem = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  order: number;
  guideCount: number;
};

export function AdminGuideCategoriesList({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [error, setError] = useState("");
  const getSearchText = useCallback(
    (item: CategoryItem) =>
      `${item.name} ${item.nameEn ?? ""} ${item.slug}`,
    [],
  );
  const list = useAdminList(categories, getSearchText);

  return (
    <>
      <AdminPageHeader
        title="생활가이드 카테고리"
        subtitle={`총 ${categories.length}개`}
      />
      <AdminBackLink href="/admin/guides" />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
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
        searchPlaceholder="이름, 영문, 슬러그 검색..."
        actions={
          <Link href="/admin/guides/categories/new">
            <Button size="sm">카테고리 등록</Button>
          </Link>
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">
                번호
              </th>
              <th className="w-14 px-3 py-2.5 text-center font-medium text-muted-foreground">
                순서
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">이름</th>
              <th className="w-32 px-3 py-2.5 text-center font-medium text-muted-foreground">
                영문
              </th>
              <th className="w-36 px-3 py-2.5 text-center font-medium text-muted-foreground">
                슬러그
              </th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">
                가이드
              </th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">
                관리
              </th>
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
                <td className="px-3 py-3 text-center text-muted-foreground">{item.order}</td>
                <td className="px-3 py-3 font-medium">{item.name}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {item.nameEn ?? "—"}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.slug}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {item.guideCount}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/guides/categories/${item.id}`}
                      className="text-xs text-brand hover:underline"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setError("");
                        setDeleteTarget(item);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={7}
                message={
                  categories.length === 0
                    ? "등록된 카테고리가 없습니다."
                    : "검색 결과가 없습니다."
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
      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="카테고리 삭제"
        description={
          deleteTarget
            ? deleteTarget.guideCount > 0
              ? `「${deleteTarget.name}」 카테고리와 가이드 ${deleteTarget.guideCount}건을 함께 삭제합니다. 삭제 후에는 복구할 수 없습니다.`
              : `「${deleteTarget.name}」 카테고리를 삭제합니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            try {
              const result = await deleteGuideCategory(deleteTarget.id);
              if (result.error) {
                setError(result.error);
                setDeleteTarget(null);
                return;
              }
              setDeleteTarget(null);
              router.refresh();
            } catch {
              setError("삭제에 실패했습니다.");
              setDeleteTarget(null);
            }
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
