"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink, AdminEmptyRow, AdminWriteLink } from "@/components/admin/admin-board-ui";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { deleteGuideCategory } from "@/actions/admin";

type CategoryItem = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  order: number;
  guideCount: number;
};

export function AdminGuideCategoriesList({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [error, setError] = useState("");

  return (
    <>
      <AdminPageHeader
        title="생활가이드 카테고리"
        subtitle={`총 ${categories.length}개`}
      />
      <AdminBackLink href="/admin/guides" />
      <AdminWriteLink href="/admin/guides/categories/new" label="카테고리 등록" />

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-14 px-3 py-2.5 text-center font-medium text-muted-foreground">
                순서
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">이름</th>
              <th className="w-32 px-3 py-2.5 text-center font-medium text-muted-foreground">
                영문
              </th>
              <th className="w-36 px-3 py-2.5 text-center font-medium text-muted-foreground">
                슬러그
              </th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">
                가이드
              </th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 text-center text-muted-foreground">{item.order}</td>
                <td className="px-3 py-3 font-medium">{item.name}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {item.nameEn ?? "—"}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.slug}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {item.guideCount}
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/guides/categories/${item.id}`}
                      className="text-xs text-brand hover:underline"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setError("");
                        setDeleteTarget(item);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <AdminEmptyRow colSpan={6} message="등록된 카테고리가 없습니다." />
            )}
          </tbody>
        </table>
      </div>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="카테고리 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.name}」 카테고리를 삭제합니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            try {
              await deleteGuideCategory(deleteTarget.id);
              setDeleteTarget(null);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
              setDeleteTarget(null);
            }
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
