"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminBackLink, formatKoDateTime } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/actions/admin";

type EventDetail = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxAttendees: number;
  _count: { registrations: number };
};

export function AdminEventsDetail({ event }: { event: EventDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <AdminPageHeader title="이벤트 상세" />
      <AdminBackLink href="/admin/events" />

      <div className="mb-4">
        <Link href={`/events/${event.id}`} target="_blank" className="text-sm text-brand hover:underline">
          사이트에서 보기
        </Link>
      </div>

      <article className="border border-border">
        <header className="border-b border-border px-4 py-5 md:px-6">
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>일시 {formatKoDateTime(event.date)}</span>
            <span>장소 {event.location}</span>
            <span>
              신청 {event._count.registrations}/{event.maxAttendees}명
            </span>
          </div>
        </header>
        <div className="whitespace-pre-wrap px-4 py-6 text-sm leading-relaxed md:px-6">
          {event.description}
        </div>
      </article>

      <div className="mt-4 flex gap-2">
        <Link href="/admin/events">
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
        title="이벤트 삭제"
        description={`「${event.title}」 이벤트를 삭제합니다. 삭제 후에는 복구할 수 없습니다.`}
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          startTransition(async () => {
            await deleteEvent(event.id);
            router.push("/admin/events");
            router.refresh();
          });
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
