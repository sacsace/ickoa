"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminEmptyRow } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { deleteGuide } from "@/actions/admin";

type GuideItem = { id: string; title: string; category: string; region: string };

export function AdminGuidesList({ guides }: { guides: GuideItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<GuideItem | null>(null);

  return (
    <>
      <AdminPageHeader title="생활 가이드" subtitle={`총 ${guides.length}건`} />
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Link href="/admin/guides/categories">
          <Button size="sm" variant="outline">
            카테고리 관리
          </Button>
        </Link>
        <Link href="/admin/guides/new">
          <Button size="sm">글쓰기</Button>
        </Link>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">제목</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">카테고리</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">지역</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((item, index) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 text-center text-muted-foreground">{guides.length - index}</td>
                <td className="px-3 py-3">
                  <Link href={`/admin/guides/${item.id}`} className="font-medium hover:text-brand hover:underline">
                    {item.title}
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.category}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.region}</td>
                <td className="px-3 py-3 text-center">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setDeleteTarget(item)}
                    className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {guides.length === 0 && <AdminEmptyRow colSpan={5} message="등록된 가이드가 없습니다." />}
          </tbody>
        </table>
      </div>
      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="가이드 삭제"
        description={deleteTarget ? `「${deleteTarget.title}」 가이드를 삭제합니다. 삭제 후에는 복구할 수 없습니다.` : ""}
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            await deleteGuide(deleteTarget.id);
            setDeleteTarget(null);
            router.refresh();
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
