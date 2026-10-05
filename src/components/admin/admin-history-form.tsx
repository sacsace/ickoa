"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createHistoryEntry, updateHistoryEntry } from "@/actions/about";

type HistoryFormProps = {
  initial?: {
    id: string;
    year: string;
    title: string;
    description: string | null;
    order: number;
  };
};

export function AdminHistoryForm({ initial }: HistoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    year: initial?.year ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    order: String(initial?.order ?? 0),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      year: form.year,
      title: form.title,
      description: form.description,
      order: Number(form.order) || 0,
    };
    startTransition(async () => {
      try {
        if (initial) {
          await updateHistoryEntry(initial.id, payload);
        } else {
          await createHistoryEntry(payload);
        }
        router.push("/admin/about/history");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title={initial ? "연혁 수정" : "연혁 등록"} />
      <AdminBackLink href="/admin/about/history" />
      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">연도 *</label>
            <input
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="1985"
              required
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
          <label className="mb-1 block text-xs text-muted-foreground">설명</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full border border-border bg-background px-4 py-3 text-sm"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : initial ? "수정" : "등록"}
          </Button>
          <Link href="/admin/about/history">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
