"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSiteEvent } from "@/actions/events";

export function EventForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    maxAttendees: 50,
    image: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const created = await createSiteEvent({
          title: form.title,
          description: form.description,
          location: form.location,
          date: form.date,
          maxAttendees: Number(form.maxAttendees),
          image: form.image || undefined,
        });
        router.push(`/events/${created.id}`);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (message === "Unauthorized") setError("로그인이 필요합니다.");
        else setError(message || "등록에 실패했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">행사 등록</h2>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">내용</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={8}
            className="w-full border border-border bg-white px-3 py-3 text-sm outline-none focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">장소</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
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
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">정원</label>
            <input
              type="number"
              min={1}
              value={form.maxAttendees}
              onChange={(e) =>
                setForm({ ...form, maxAttendees: Number(e.target.value) })
              }
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            이미지 URL (선택)
          </label>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://"
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Link href="/events">
            <Button type="button" variant="outline" size="sm">
              취소
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "등록 중..." : "등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
