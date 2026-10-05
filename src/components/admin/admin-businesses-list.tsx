"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminEmptyRow, AdminWriteLink } from "@/components/admin/admin-board-ui";
import { deleteBusiness } from "@/actions/admin";

type Item = {
  id: string;
  name: string;
  category: string;
  region: string;
  address: string;
};

export function AdminBusinessesList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  return (
    <>
      <AdminPageHeader title="한인 기업 디렉토리" subtitle={`총 ${items.length}곳`} />
      <AdminWriteLink href="/admin/businesses/new" label="기업 등록" />

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">기업명</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">업종</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">지역</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <AdminEmptyRow colSpan={5} message="등록된 기업이 없습니다." />
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-3 text-center text-muted-foreground">{items.length - index}</td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/businesses/${item.id}`}
                      className="font-medium hover:text-brand hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.address}</p>
                  </td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{item.category}</td>
                  <td className="px-3 py-3 text-center text-muted-foreground">{item.region}</td>
                  <td className="px-3 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/businesses/${item.id}`}
                        className="text-xs text-brand hover:underline"
                      >
                        수정
                      </Link>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setDeleteTarget(item)}
                        className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="기업 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.name}」을(를) 디렉토리에서 삭제합니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          startTransition(async () => {
            await deleteBusiness(id);
            setDeleteTarget(null);
            router.refresh();
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
