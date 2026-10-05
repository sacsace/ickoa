"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink, AdminEmptyRow } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { approveClubRequest, rejectClubRequest } from "@/actions/admin";

type Item = {
  id: string;
  name: string;
  description: string | null;
  reason: string | null;
  status: string;
  createdAt: string;
  requesterName: string | null;
};

function statusLabel(status: string) {
  if (status === "APPROVED") return "승인";
  if (status === "REJECTED") return "거절";
  return "대기";
}

export function AdminClubRequestsList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  function run(id: string, action: (id: string) => Promise<void>) {
    setError("");
    setBusyId(id);
    startTransition(async () => {
      try {
        await action(id);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        setError(message || "처리에 실패했습니다.");
      } finally {
        setBusyId(null);
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="동호회 등록 요청" subtitle={`총 ${items.length}건`} />
      <AdminBackLink href="/admin/clubs" />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">동호회</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">요청자</th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">상태</th>
              <th className="w-40 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <AdminEmptyRow colSpan={5} message="등록 요청이 없습니다." />
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-3 text-center text-muted-foreground">{items.length - index}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{item.name}</p>
                    {item.description ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                    ) : null}
                    {item.reason ? (
                      <p className="mt-1 text-xs text-muted-foreground">사유: {item.reason}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{item.requesterName ?? "—"}</td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{statusLabel(item.status)}</td>
                  <td className="px-3 py-3 text-center">
                    {item.status === "PENDING" ? (
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          disabled={isPending && busyId === item.id}
                          onClick={() => run(item.id, approveClubRequest)}
                        >
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending && busyId === item.id}
                          onClick={() => run(item.id, rejectClubRequest)}
                        >
                          거절
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
