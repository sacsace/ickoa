"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/community/content-editor";
import { createSiteEvent, updateSiteEvent } from "@/actions/events";
import { plainTextFromHtml } from "@/lib/sanitize-html";

function toDatetimeLocalValue(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type EventFormInitial = {
  id: string;
  title: string;
  description: string;
  location: string;
  mapsUrl?: string | null;
  date: Date | string;
  maxAttendees: number;
  image?: string | null;
};

export function EventForm({
  mode = "create",
  initial,
}: {
  mode?: "create" | "edit";
  initial?: EventFormInitial;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    location: initial?.location ?? "",
    mapsUrl: initial?.mapsUrl ?? "",
    date: initial ? toDatetimeLocalValue(initial.date) : "",
    maxAttendees: initial?.maxAttendees ?? 50,
    image: initial?.image ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !plainTextFromHtml(form.description) || !form.location.trim()) {
      setError("제목, 내용, 장소를 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      try {
        const payload = {
          title: form.title,
          description: form.description,
          location: form.location,
          mapsUrl: form.mapsUrl || undefined,
          date: form.date,
          maxAttendees: Number(form.maxAttendees),
          image: form.image || undefined,
        };
        if (mode === "edit" && initial) {
          await updateSiteEvent(initial.id, payload);
          router.push(`/events/${initial.id}`);
        } else {
          const created = await createSiteEvent(payload);
          router.push(`/events/${created.id}`);
        }
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (message === "Unauthorized") setError("로그인이 필요합니다.");
        else if (message === "Forbidden") setError("수정 권한이 없습니다.");
        else setError(message || (mode === "edit" ? "수정에 실패했습니다." : "등록에 실패했습니다."));
      }
    });
  }

  const cancelHref = mode === "edit" && initial ? `/events/${initial.id}` : "/events";

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">
          {mode === "edit" ? "행사 수정" : "행사 등록"}
        </h2>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            required
            suppressHydrationWarning
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">내용</label>
          <ContentEditor
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="행사 내용을 입력하세요"
            minHeight={240}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">장소</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            required
            suppressHydrationWarning
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Google 지도 URL (선택)
          </label>
          <input
            value={form.mapsUrl}
            onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
            placeholder="https://maps.google.com/... 또는 https://maps.app.goo.gl/..."
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            suppressHydrationWarning
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Google 지도에서 장소 공유 링크를 넣으면 상세 페이지에 위치가 표시됩니다.
          </p>
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
              suppressHydrationWarning
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
              suppressHydrationWarning
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
            suppressHydrationWarning
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Link href={cancelHref}>
            <Button type="button" variant="outline" size="sm">
              취소
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending
              ? mode === "edit"
                ? "저장 중..."
                : "등록 중..."
              : mode === "edit"
                ? "저장"
                : "등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
