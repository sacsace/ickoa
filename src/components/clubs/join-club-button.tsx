"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { joinClub } from "@/actions/community";
import { isSiteSession } from "@/lib/session-kind";

export function JoinClubButton({ clubId }: { clubId: string }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const allowed = isSiteSession(session);
  const [isPending, startTransition] = useTransition();

  if (!allowed) {
    return (
      <Link href={`/login?callbackUrl=${encodeURIComponent(pathname || "/clubs")}`}>
        <Button size="sm" className="mt-4" disabled={status === "loading"}>
          로그인 후 가입
        </Button>
      </Link>
    );
  }

  function handleJoin() {
    startTransition(async () => {
      try {
        await joinClub(clubId);
        alert("동호회에 가입되었습니다!");
      } catch {
        alert("가입에 실패했습니다. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <Button size="sm" className="mt-4" onClick={handleJoin} disabled={isPending}>
      {isPending ? "처리 중..." : "가입하기"}
    </Button>
  );
}
