"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createActivityReport, updateActivityReport } from "@/actions/about";

type ReportFormProps = {
  initial?: {
    id: string;
    year: number | null;
    title: string;
    content: string;
    fileUrl: string | null;
    published: boolean;
    order: number;
  };
};

export function AdminActivityReportForm({ initial }: ReportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    year: initial?.year != null ? String(initial.year) : "",
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    fileUrl: initial?.fileUrl ?? "",
    published: initial?.published ?? true,
    order: String(initial?.order ?? 0),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const yearNum = form.year.trim() ? Number(form.year) : null;
    const payload = {
      title: form.title,
      content: form.content,
      year: yearNum != null && !Number.isNaN(yearNum) ? yearNum : null,
      fileUrl: form.fileUrl,
      published: form.published,
      order: Number(form.order) || 0,
    };
    startTransition(async () => {
      try {
        if (initial) {
          await updateActivityReport(initial.id, payload);
        } else {
          await createActivityReport(payload);
        }
        router.push("/admin/about/reports");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title={initial ? "활동 보고서 수정" : "활동 보고서 등록"} />
      <AdminBackLink href="/admin/about/reports" />
      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">연도</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="2025"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">표시 순서</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              사이트에 공개
            </label>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목 *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">내용 *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            className="w-full border border-border bg-background px-4 py-3 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">첨부 파일 URL (선택)</label>
          <input
            value={form.fileUrl}
            onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="https://... 또는 /uploads/..."
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : initial ? "수정" : "등록"}
          </Button>
          <Link href="/admin/about/reports">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
