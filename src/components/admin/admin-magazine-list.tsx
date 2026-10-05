"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminEmptyRow, AdminWriteLink } from "@/components/admin/admin-board-ui";
import { deleteMagazineIssue } from "@/actions/admin";

type MagazineItem = {
  id: string;
  volume: number;
  title: string;
  publishedAt: string;
  published: boolean;
};

export function AdminMagazineList({ issues }: { issues: MagazineItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<MagazineItem | null>(null);

  return (
    <>
      <AdminPageHeader title="한인회보" subtitle={`총 ${issues.length}건`} />
      <AdminWriteLink href="/admin/magazine/new" label="호 등록" />
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">호수</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">발행월</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">상태</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((item, index) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 text-center text-muted-foreground">{issues.length - index}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">Vol.{item.volume}</td>
                <td className="px-3 py-3">
                  <Link href={`/admin/magazine/${item.id}`} className="font-medium hover:text-brand hover:underline">{item.title}</Link>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.publishedAt}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.published ? "공개" : "비공개"}</td>
                <td className="px-3 py-3 text-center">
                  <button type="button" disabled={isPending} onClick={() => setDeleteTarget(item)} className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40">삭제</button>
                </td>
              </tr>
            ))}
            {issues.length === 0 && <AdminEmptyRow colSpan={6} message="등록된 한인회보가 없습니다." />}
          </tbody>
        </table>
      </div>
      <AdminConfirmDialog open={deleteTarget !== null} title="한인회보 삭제" description={deleteTarget ? `Vol.${deleteTarget.volume} 한인회보를 삭제합니다.` : ""} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => { if (!deleteTarget) return; startTransition(async () => { await deleteMagazineIssue(deleteTarget.id); setDeleteTarget(null); router.refresh(); }); }} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
