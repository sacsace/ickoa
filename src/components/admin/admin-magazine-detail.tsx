"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { deleteMagazineIssue, toggleMagazinePublished } from "@/actions/admin";

type MagazineDetail = {
  id: string;
  slug: string;
  volume: number;
  title: string;
  subtitle: string;
  publishedAt: string;
  coverImage: string;
  pdfUrl: string;
  editorNote: string | null;
  published: boolean;
};

export function AdminMagazineDetail({ issue }: { issue: MagazineDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <AdminPageHeader title={`Vol.${issue.volume} 상세`} />
      <AdminBackLink href="/admin/magazine" />
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={`/magazine/${issue.slug}`} target="_blank" className="text-brand hover:underline">사이트에서 보기</Link>
        <Link href={`/magazine/${issue.slug}/read`} target="_blank" className="text-brand hover:underline">PDF 뷰어</Link>
        <a href={issue.pdfUrl} download className="text-muted-foreground hover:text-foreground">PDF 다운로드</a>
      </div>
      <article className="border border-border">
        <div className="flex flex-col gap-6 p-4 md:flex-row md:p-6">
          <div className="relative mx-auto h-56 w-40 shrink-0 overflow-hidden bg-muted">
            <Image src={issue.coverImage} alt={`Vol.${issue.volume}`} fill className="object-cover object-top" sizes="160px" />
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="text-xs text-muted-foreground">발행 {issue.publishedAt} · {issue.published ? "공개" : "비공개"}</p>
            <h2 className="mt-2 text-lg font-semibold">{issue.title}</h2>
            <p className="mt-1 text-muted-foreground">{issue.subtitle}</p>
            {issue.editorNote && <p className="mt-4 whitespace-pre-wrap leading-relaxed">{issue.editorNote}</p>}
          </div>
        </div>
      </article>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/magazine"><Button size="sm" variant="outline">목록</Button></Link>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => startTransition(async () => { await toggleMagazinePublished(issue.id, !issue.published); router.refresh(); })}>{issue.published ? "비공개" : "공개"}</Button>
        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" disabled={isPending} onClick={() => setDeleteOpen(true)}>삭제</Button>
      </div>
      <AdminConfirmDialog open={deleteOpen} title="한인회보 삭제" description={`Vol.${issue.volume} 한인회보를 삭제합니다.`} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => startTransition(async () => { await deleteMagazineIssue(issue.id); router.push("/admin/magazine"); router.refresh(); })} onCancel={() => setDeleteOpen(false)} />
    </>
  );
}
