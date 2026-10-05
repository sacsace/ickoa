"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyRow } from "@/components/admin/admin-board-ui";

type ReportItem = {
  id: string;
  reason: string;
  resolved: boolean;
  post: { title: string };
  reporter: { name: string | null };
};

export function AdminReportsList({ reports }: { reports: ReportItem[] }) {
  return (
    <>
      <AdminPageHeader title="신고" subtitle={`총 ${reports.length}건`} />
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">게시글</th>
              <th className="w-32 px-3 py-2.5 text-center font-medium text-muted-foreground">신고 사유</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">신고자</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">상태</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((item, index) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 text-center text-muted-foreground">{reports.length - index}</td>
                <td className="px-3 py-3">
                  <Link href={`/admin/reports/${item.id}`} className="font-medium hover:text-brand hover:underline">{item.post.title}</Link>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.reason}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.reporter.name ?? "—"}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.resolved ? "처리됨" : "대기"}</td>
              </tr>
            ))}
            {reports.length === 0 && <AdminEmptyRow colSpan={5} message="신고 내역이 없습니다." />}
          </tbody>
        </table>
      </div>
    </>
  );
}
