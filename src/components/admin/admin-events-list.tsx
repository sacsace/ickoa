"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminEmptyRow, formatKoDateTime } from "@/components/admin/admin-board-ui";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/actions/admin";

type EventItem = {
  id: string;
  title: string;
  date: Date;
  location: string;
  maxAttendees: number;
  _count: { registrations: number };
};

export function AdminEventsList({ events }: { events: EventItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const getSearchText = useCallback(
    (item: EventItem) => `${item.title} ${item.location}`,
    [],
  );
  const list = useAdminList(events, getSearchText);

  return (
    <>
      <AdminPageHeader title="이벤트" subtitle={`총 ${events.length}건`} />
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
        searchPlaceholder="제목, 장소 검색..."
        actions={
          <Link href="/admin/events/new">
            <Button size="sm">행사 등록</Button>
          </Link>
        }
      />
      <AdminTableShell>
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center font-medium text-muted-foreground">일시</th>
              <th className="whitespace-nowrap px-3 py-2.5 text-center font-medium text-muted-foreground">장소</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">신청</th>
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
                <td className="px-3 py-3">
                  <Link href={`/admin/events/${item.id}`} className="font-medium hover:text-brand hover:underline">
                    {item.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-center text-muted-foreground">
                  {formatKoDateTime(item.date).replace(/\s+/g, " ")}
                </td>
                <td
                  className="max-w-[200px] truncate whitespace-nowrap px-3 py-3 text-center text-muted-foreground"
                  title={item.location}
                >
                  {item.location}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {item._count.registrations}/{item.maxAttendees}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/admin/events/${item.id}`}
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
                colSpan={6}
                message={
                  events.length === 0 ? "등록된 이벤트가 없습니다." : "검색 결과가 없습니다."
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
        title="이벤트 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.title}」 이벤트를 삭제합니다. 삭제 후에는 복구할 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          startTransition(async () => {
            await deleteEvent(id);
            setDeleteTarget(null);
            router.refresh();
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
