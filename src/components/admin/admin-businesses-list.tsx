"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminEmptyRow } from "@/components/admin/admin-board-ui";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";
import { Button } from "@/components/ui/button";
import { deleteBusiness } from "@/actions/admin";

type Item = {
  id: string;
  name: string;
  category: string;
  region: string;
  address: string;
};

export function AdminBusinessesList({
  items,
  categories: categoryOptions,
}: {
  items: Item[];
  categories: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const categoryFiltered = useMemo(() => {
    if (!category) return items;
    return items.filter((item) => item.category === category);
  }, [items, category]);

  const getSearchText = useCallback(
    (item: Item) => `${item.name} ${item.address} ${item.region} ${item.category}`,
    [],
  );
  const list = useAdminList(categoryFiltered, getSearchText);

  const categories = useMemo(() => {
    const fromData = Array.from(new Set(items.map((i) => i.category)));
    const ordered = categoryOptions.filter((c) => fromData.includes(c));
    const extra = fromData.filter((c) => !categoryOptions.includes(c)).sort();
    return [...ordered, ...extra];
  }, [items, categoryOptions]);

  return (
    <>
      <AdminPageHeader title="한인 기업 디렉토리" subtitle={`총 ${items.length}곳`} />
      <AdminListControls
        query={list.query}
        onQueryChange={list.setQuery}
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        filteredCount={list.filteredCount}
        totalCount={items.length}
        searchPlaceholder="기업명, 업종, 지역, 주소 검색..."
        actions={
          <>
            <Link href="/admin/businesses/categories">
              <Button size="sm" variant="outline">
                업종 관리
              </Button>
            </Link>
            <Link href="/admin/businesses/bulk">
              <Button size="sm" variant="outline">
                일괄 등록
              </Button>
            </Link>
            <Link href="/admin/businesses/new">
              <Button size="sm">기업 등록</Button>
            </Link>
          </>
        }
        filters={
          categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory(null)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === null
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                전체
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory((prev) => (prev === cat ? null : cat))}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">기업명</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">업종</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">지역</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
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
                <td className="max-w-[360px] truncate px-3 py-3" title={`${item.name} · ${item.address}`}>
                  <Link
                    href={`/admin/businesses/${item.id}`}
                    className="font-medium hover:text-brand hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span className="text-muted-foreground"> · {item.address}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-center text-muted-foreground">
                  {item.category}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-center text-muted-foreground">
                  {item.region}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/admin/businesses/${item.id}`}
                      className="text-xs text-brand hover:underline"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeleteTarget(item)}
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
                colSpan={5}
                message={items.length === 0 ? "등록된 기업이 없습니다." : "검색 결과가 없습니다."}
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
        title="기업 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.name}」을(를) 디렉토리에서 삭제합니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          startTransition(async () => {
            await deleteBusiness(id);
            setDeleteTarget(null);
            router.refresh();
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
