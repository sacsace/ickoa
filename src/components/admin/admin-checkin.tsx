"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";

export function AdminCheckinClient() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`체크인 완료: ${data.user?.name} (${data.event?.title})`);
        setQrCode("");
        router.refresh();
      } else {
        setResult(data.error ?? "체크인 실패");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="QR 체크인" />
      <div className="max-w-md">
        <form onSubmit={handleCheckin} className="border border-border p-4 space-y-4">
          <input
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="QR 코드 UUID 입력"
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
            required
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "처리 중..." : "체크인"}
          </Button>
          {result && <p className="text-sm text-brand">{result}</p>}
        </form>
      </div>
    </>
  );
}
