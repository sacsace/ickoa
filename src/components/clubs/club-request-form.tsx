"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { requestClub } from "@/actions/community";
import { isSiteSession } from "@/lib/session-kind";

export function ClubRequestForm() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const allowed = isSiteSession(session);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", reason: "" });

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">동호회 등록을 요청하려면 로그인해 주세요.</p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(pathname || "/clubs/request")}`}
          className="mt-4 inline-flex h-8 items-center justify-center rounded-[3px] bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          {status === "loading" ? "확인 중..." : "로그인 후 요청"}
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await requestClub({
          name: form.name,
          description: form.description,
          reason: form.reason,
        });
        alert("동호회 등록 요청을 보냈습니다. 관리자 확인 후 반영됩니다.");
        router.push("/clubs");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        setError(message || "요청에 실패했습니다. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">동호회 등록 요청</h2>
      </div>
      <div className="space-y-3 p-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">동호회 이름</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">소개</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full border border-border bg-white px-3 py-3 text-sm outline-none focus:border-brand"
            placeholder="동호회 활동 내용을 간단히 적어 주세요"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">요청 사유</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            className="w-full border border-border bg-white px-3 py-3 text-sm outline-none focus:border-brand"
            placeholder="왜 이 동호회가 필요한지 관리자에게 알려 주세요"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Link href="/clubs">
            <Button type="button" variant="outline" size="sm" disabled={isPending}>
              취소
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "보내는 중..." : "요청 보내기"}
          </Button>
        </div>
      </div>
    </form>
  );
}
