"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteNews } from "@/actions/admin";

type NewsDetail = {
  id: string;
  title: string;
  content: string;
  category: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function AdminNewsDetail({ news }: { news: NewsDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDeleteConfirm() {
    startTransition(async () => {
      await deleteNews(news.id);
      setDeleteOpen(false);
      router.push("/admin/news");
      router.refresh();
    });
  }

  return (
    <>
      <AdminPageHeader title="뉴스 상세" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/admin/news"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          ← 목록으로
        </Link>
        <Link
          href={`/news/${news.id}`}
          target="_blank"
          className="text-sm text-brand hover:underline"
        >
          사이트에서 보기
        </Link>
      </div>

      <article className="border border-border">
        <header className="border-b border-border px-4 py-5 md:px-6">
          <h2 className="text-lg font-semibold leading-snug">{news.title}</h2>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>카테고리 {news.category}</span>
            <span>지역 {news.region}</span>
            <span>등록 {formatDateTime(news.createdAt)}</span>
            {news.updatedAt > news.createdAt && (
              <span>수정 {formatDateTime(news.updatedAt)}</span>
            )}
          </div>
        </header>

        <div className="whitespace-pre-wrap px-4 py-6 text-sm leading-relaxed text-foreground md:px-6">
          {news.content}
        </div>
      </article>

      <div className="mt-4 flex gap-2">
        <Link href="/admin/news">
          <Button size="sm" variant="outline">
            목록
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
          disabled={isPending}
          onClick={() => setDeleteOpen(true)}
        >
          삭제
        </Button>
      </div>

      <AdminConfirmDialog
        open={deleteOpen}
        title="뉴스 삭제"
        description={`「${news.title}」 뉴스를 삭제합니다. 삭제 후에는 복구할 수 없습니다.`}
        confirmLabel="삭제"
        cancelLabel="취소"
        destructive
        loading={isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
