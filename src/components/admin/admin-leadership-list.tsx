"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink, AdminEmptyRow } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { deleteLeadershipMember } from "@/actions/about";

type MemberItem = {
  id: string;
  name: string;
  nameEn: string | null;
  role: string;
  published: boolean;
  order: number;
};

export function AdminLeadershipList({ items }: { items: MemberItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <>
      <AdminPageHeader title="회장단" subtitle={`총 ${items.length}명`} />
      <AdminBackLink href="/admin/about" />
      <div className="mb-4 flex justify-end">
        <Link href="/admin/about/leadership/new">
          <Button size="sm">임원 등록</Button>
        </Link>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2">순서</th>
              <th className="px-3 py-2">직책</th>
              <th className="px-3 py-2">이름</th>
              <th className="px-3 py-2">공개</th>
              <th className="px-3 py-2 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-3 py-3 text-muted-foreground">{item.order}</td>
                <td className="px-3 py-3 font-medium">{item.role}</td>
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/about/leadership/${item.id}`}
                    className="hover:text-brand hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.nameEn ? (
                    <span className="ml-2 text-xs text-muted-foreground">{item.nameEn}</span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {item.published ? "공개" : "비공개"}
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link href={`/admin/about/leadership/${item.id}`}>
                      <Button size="sm" variant="outline">
                        수정
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending && deletingId === item.id}
                      onClick={() => {
                        if (!confirm(`「${item.name}」을(를) 삭제할까요?`)) return;
                        setDeletingId(item.id);
                        startTransition(async () => {
                          await deleteLeadershipMember(item.id);
                          router.refresh();
                        });
                      }}
                    >
                      삭제
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <AdminEmptyRow colSpan={5} message="등록된 회장단이 없습니다." />
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
