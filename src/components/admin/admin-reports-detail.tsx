"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { resolveReport } from "@/actions/admin";

type ReportDetail = {
  id: string;
  reason: string;
  resolved: boolean;
  post: { id: string; title: string; board: { slug: string } };
  reporter: { name: string | null };
};

export function AdminReportsDetail({ report }: { report: ReportDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <AdminPageHeader title="신고 상세" />
      <AdminBackLink href="/admin/reports" />
      <article className="border border-border p-4 md:p-6">
        <dl className="space-y-3 text-sm">
          <div><dt className="text-xs text-muted-foreground">게시글</dt><dd className="mt-1 font-medium">{report.post.title}</dd></div>
          <div><dt className="text-xs text-muted-foreground">신고 사유</dt><dd className="mt-1">{report.reason}</dd></div>
          <div><dt className="text-xs text-muted-foreground">신고자</dt><dd className="mt-1">{report.reporter.name ?? "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">상태</dt><dd className="mt-1">{report.resolved ? "처리됨" : "대기"}</dd></div>
        </dl>
      </article>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/reports"><Button size="sm" variant="outline">목록</Button></Link>
        <Link href={`/community/${report.post.board.slug}/${report.post.id}`} target="_blank"><Button size="sm" variant="outline">게시글 보기</Button></Link>
        {!report.resolved && (
          <Button size="sm" disabled={isPending} onClick={() => startTransition(async () => { await resolveReport(report.id); router.refresh(); })}>처리 완료</Button>
        )}
      </div>
    </>
  );
}
