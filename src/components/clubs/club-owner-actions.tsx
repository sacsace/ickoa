"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteClubIntro } from "@/actions/community";

export function ClubOwnerActions({
  clubId,
  clubSlug,
  compact = false,
}: {
  clubId: string;
  clubSlug: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        "이 동호회 소개와 멤버·공지 데이터가 삭제됩니다. 계속할까요?",
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteClubIntro(clubId);
        router.push("/clubs");
        router.refresh();
      } catch (err) {
        window.alert(
          err instanceof Error ? err.message : "삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <div
      className={compact ? "mt-4 flex gap-1.5" : "mt-4 flex flex-wrap gap-2"}
      onClick={(e) => e.stopPropagation()}
    >
      <Link
        href={`/clubs/${encodeURIComponent(clubSlug)}/edit`}
        onClick={(e) => e.stopPropagation()}
      >
        <Button type="button" size="sm" variant="outline" disabled={isPending}>
          수정
        </Button>
      </Link>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending ? "삭제 중..." : "삭제"}
      </Button>
    </div>
  );
}
