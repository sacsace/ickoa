"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createEvent } from "@/actions/admin";

export function AdminEventsForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    maxAttendees: 50,
    date: "",
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const event = await createEvent({
          ...form,
          date: new Date(form.date),
          maxAttendees: Number(form.maxAttendees),
        });
        router.push(`/admin/events/${event.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="이벤트 등록" subtitle="새 행사를 등록합니다" />
      <AdminBackLink href="/admin/events" />

      <form onSubmit={handleCreate} className="space-y-4 border border-border p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목</label>
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
            rows={8}
            className="w-full border border-border bg-background px-4 py-3 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">장소</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">일시</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">정원</label>
            <input
              type="number"
              min={1}
              value={form.maxAttendees}
              onChange={(e) => setForm({ ...form, maxAttendees: Number(e.target.value) })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "등록 중..." : "등록"}
          </Button>
          <Link href="/admin/events">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
