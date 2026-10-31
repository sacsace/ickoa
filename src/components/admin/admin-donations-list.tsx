"use client";

import Link from "next/link";
import { useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyRow, formatKoDateTime } from "@/components/admin/admin-board-ui";
import {
  AdminListControls,
  AdminListPaginationFooter,
  AdminTableShell,
  ADMIN_TABLE_ROW_CLASS,
  adminListRowNumber,
  useAdminList,
} from "@/components/admin/admin-list-controls";

type DonationRow = {
  id: string;
  amount: number;
  status: string;
  donorName: string | null;
  donorEmail: string | null;
  createdAt: Date;
};

export function AdminDonationsList({ donations }: { donations: DonationRow[] }) {
  const paidTotal = donations.filter((d) => d.status === "paid").reduce((sum, d) => sum + d.amount, 0);
  const getSearchText = useCallback(
    (item: DonationRow) =>
      `${item.donorName ?? ""} ${item.donorEmail ?? ""} ${item.status}`,
    [],
  );
  const list = useAdminList(donations, getSearchText);

  return (
    <>
      <AdminPageHeader title="후원 내역" subtitle="Razorpay 결제 기록" />
      <div className="mb-6 rounded-sm border border-border bg-white p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">완료된 후원 합계</p>
        <p className="text-xl font-semibold">₹{(paidTotal / 100).toLocaleString("en-IN")}</p>
      </div>
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
        searchPlaceholder="후원자, 이메일, 상태 검색..."
      />
      <AdminTableShell>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">후원자</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">금액</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">상태</th>
              <th className="w-36 px-3 py-2.5 text-center font-medium text-muted-foreground">일시</th>
            </tr>
          </thead>
          <tbody>
            {list.visible.map((d, index) => (
              <tr key={d.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {adminListRowNumber(
                    list.filteredCount,
                    index,
                    list.viewMode,
                    list.page,
                  )}
                </td>
                <td className="px-3 py-3">
                  <Link href={`/admin/donations/${d.id}`} className="font-medium hover:text-brand hover:underline">
                    {d.donorName ?? "—"}
                  </Link>
                  {d.donorEmail && <p className="text-xs text-muted-foreground">{d.donorEmail}</p>}
                </td>
                <td className="px-3 py-3 text-center">₹{(d.amount / 100).toLocaleString("en-IN")}</td>
                <td className={`px-3 py-3 text-center ${d.status === "paid" ? "text-brand" : "text-muted-foreground"}`}>{d.status}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{formatKoDateTime(d.createdAt)}</td>
              </tr>
            ))}
            {list.visible.length === 0 && (
              <AdminEmptyRow
                colSpan={5}
                message={
                  donations.length === 0 ? "후원 내역이 없습니다." : "검색 결과가 없습니다."
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
