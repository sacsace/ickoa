"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { isSiteSession } from "@/lib/session-kind";
import { cn } from "@/lib/utils";

export function EventRegisterButton({
  eventId,
  className,
}: {
  eventId: string;
  className?: string;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const allowed = isSiteSession(session);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  async function handleRegister() {
    setLoading(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    setLoading(false);

    if (res.status === 401) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname || "/events")}`;
      return;
    }

    const data = await res.json();
    if (data.qrDataUrl) setQrDataUrl(data.qrDataUrl);
    else if (data.error) alert(data.error);
  }

  if (!allowed) {
    return (
      <div className={cn(className)}>
        <Link href={`/login?callbackUrl=${encodeURIComponent(pathname || "/events")}`}>
          <Button size="sm" className="w-full" disabled={status === "loading"}>
            로그인 후 참가 신청
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <Button size="sm" className="w-full" onClick={handleRegister} disabled={loading}>
        {loading ? "처리 중..." : "참가 신청"}
      </Button>
      {qrDataUrl && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4 text-center">
          <p className="mb-2 text-xs text-muted-foreground">QR 체크인 코드</p>
          <Image src={qrDataUrl} alt="QR Code" width={160} height={160} className="mx-auto" />
        </div>
      )}
    </div>
  );
}
