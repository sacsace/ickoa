"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminDialog } from "@/components/admin/admin-dialog";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminEmptyRow, formatKoDateTime } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";
import { RichHtmlBody } from "@/components/ui/rich-html-body";
import { deleteContactInquiry } from "@/actions/mail";
import { plainTextFromHtml } from "@/lib/sanitize-html";

type InquiryItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  mailed: boolean;
  createdAt: string;
};

export function AdminInquiriesList({
  inquiries,
  canDelete,
}: {
  inquiries: InquiryItem[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<InquiryItem | null>(null);
  const [selected, setSelected] = useState<InquiryItem | null>(null);

  const getSearchText = useCallback(
    (item: InquiryItem) =>
      `${item.name} ${item.email} ${item.phone ?? ""} ${item.subject} ${plainTextFromHtml(item.message)}`,
    [],
  );
  const list = useAdminList(inquiries, getSearchText);

  return (
    <>
      <AdminPageHeader title="문의 내역" subtitle={`총 ${inquiries.length}건`} />
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
        searchPlaceholder="이름, 메일, 제목, 내용 검색..."
      />
      <AdminTableShell>
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">
                번호
              </th>
              <th className="w-36 px-3 py-2.5 text-left font-medium text-muted-foreground">
                일시
              </th>
              <th className="w-28 px-3 py-2.5 text-left font-medium text-muted-foreground">
                이름
              </th>
              <th className="w-44 px-3 py-2.5 text-left font-medium text-muted-foreground">
                메일
              </th>
              <th className="w-28 px-3 py-2.5 text-left font-medium text-muted-foreground">
                전화
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                제목 / 내용
              </th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">
                발송
              </th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">
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
                <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                  {formatKoDateTime(item.createdAt)}
                </td>
                <td className="px-3 py-3 font-medium">{item.name}</td>
                <td className="truncate px-3 py-3 text-muted-foreground">{item.email}</td>
                <td className="px-3 py-3 text-muted-foreground">{item.phone || "—"}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="text-left hover:text-brand"
                    onClick={() => setSelected(item)}
                  >
                    <p className="font-medium hover:underline">{item.subject}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {plainTextFromHtml(item.message)}
                    </p>
                  </button>
                </td>
                <td className="px-3 py-3 text-center text-xs text-muted-foreground">
                  {item.mailed ? "메일 발송" : "접수만"}
                </td>
                <td className="px-3 py-3 text-center">
                  {canDelete ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeleteTarget(item)}
                      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                    >
                      삭제
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={8}
                message={
                  inquiries.length === 0
                    ? "접수된 문의가 없습니다."
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

      <AdminDialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? "문의"}
        description={
          selected
            ? `${formatKoDateTime(selected.createdAt)} · ${selected.name} · ${selected.email}${
                selected.phone ? ` · ${selected.phone}` : ""
              }`
            : undefined
        }
        maxWidth="2xl"
        scrollBody
        footer={
          <Button type="button" size="sm" variant="outline" onClick={() => setSelected(null)}>
            닫기
          </Button>
        }
      >
        {selected ? (
          <RichHtmlBody
            content={selected.message}
            className="prose prose-sm max-w-none"
          />
        ) : null}
      </AdminDialog>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="문의 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.subject}」 문의를 삭제합니다. 삭제 후 복구할 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          startTransition(async () => {
            await deleteContactInquiry(id);
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
