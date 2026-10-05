"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { deleteGuide } from "@/actions/admin";

type GuideDetail = { id: string; title: string; content: string; category: string; region: string };

export function AdminGuidesDetail({ guide }: { guide: GuideDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <AdminPageHeader title="가이드 상세" />
      <AdminBackLink href="/admin/guides" />
      <div className="mb-4">
        <Link href={`/guide/${guide.id}`} target="_blank" className="text-sm text-brand hover:underline">사이트에서 보기</Link>
      </div>
      <article className="border border-border">
        <header className="border-b border-border px-4 py-5 md:px-6">
          <h2 className="text-lg font-semibold">{guide.title}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{guide.category} · {guide.region}</p>
        </header>
        <div className="whitespace-pre-wrap px-4 py-6 text-sm leading-relaxed md:px-6">{guide.content}</div>
      </article>
      <div className="mt-4 flex gap-2">
        <Link href="/admin/guides"><Button size="sm" variant="outline">목록</Button></Link>
        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" disabled={isPending} onClick={() => setDeleteOpen(true)}>삭제</Button>
      </div>
      <AdminConfirmDialog open={deleteOpen} title="가이드 삭제" description={`「${guide.title}」 가이드를 삭제합니다. 삭제 후에는 복구할 수 없습니다.`} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => startTransition(async () => { await deleteGuide(guide.id); router.push("/admin/guides"); router.refresh(); })} onCancel={() => setDeleteOpen(false)} />
    </>
  );
}
