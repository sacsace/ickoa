"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink, AdminEmptyRow, AdminWriteLink } from "@/components/admin/admin-board-ui";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { Button } from "@/components/ui/button";

type TaxonomyItem = {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  order: number;
  count: number;
  extra?: string | null;
};

type TaxonomyConfig = {
  title: string;
  subtitle: string;
  backHref: string;
  newHref: string;
  editHref: (id: string) => string;
  writeLabel: string;
  countLabel: string;
  onDelete: (id: string) => Promise<void>;
};

export function AdminTaxonomyList({
  items,
  config,
}: {
  items: TaxonomyItem[];
  config: TaxonomyConfig;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyItem | null>(null);
  const [error, setError] = useState("");

  return (
    <>
      <AdminPageHeader title={config.title} subtitle={config.subtitle} />
      <AdminBackLink href={config.backHref} />
      <AdminWriteLink href={config.newHref} label={config.writeLabel} />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-14 px-3 py-2.5 text-center font-medium text-muted-foreground">
                순서
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">이름</th>
              <th className="w-36 px-3 py-2.5 text-center font-medium text-muted-foreground">
                슬러그
              </th>
              <th className="w-20 px-3 py-2.5 text-center font-medium text-muted-foreground">
                {config.countLabel}
              </th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 text-center text-muted-foreground">{item.order}</td>
                <td className="px-3 py-3">
                  <p className="font-medium">{item.name}</p>
                  {item.nameEn || item.extra ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.nameEn || item.extra}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.slug}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{item.count}</td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={config.editHref(item.id)}
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
            {items.length === 0 && (
              <AdminEmptyRow colSpan={5} message="등록된 항목이 없습니다." />
            )}
          </tbody>
        </table>
      </div>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="삭제 확인"
        description={deleteTarget ? `「${deleteTarget.name}」을(를) 삭제합니다.` : ""}
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            try {
              await config.onDelete(deleteTarget.id);
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

export function AdminTaxonomyForm({
  mode,
  title,
  backHref,
  listHref,
  initial,
  onSubmit,
  showDescription = false,
  showIcon = false,
  showNameEn = true,
}: {
  mode: "create" | "edit";
  title: string;
  backHref: string;
  listHref: string;
  initial?: {
    name: string;
    nameEn?: string | null;
    slug: string;
    order: number;
    description?: string | null;
    icon?: string | null;
  };
  onSubmit: (data: {
    name: string;
    nameEn?: string;
    slug?: string;
    order?: number;
    description?: string;
    icon?: string;
  }) => Promise<void>;
  showDescription?: boolean;
  showIcon?: boolean;
  showNameEn?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameEn: initial?.nameEn ?? "",
    slug: initial?.slug ?? "",
    order: initial?.order ?? 0,
    description: initial?.description ?? "",
    icon: initial?.icon ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await onSubmit({
          name: form.name,
          nameEn: form.nameEn || undefined,
          slug: form.slug || undefined,
          order: Number(form.order),
          description: form.description || undefined,
          icon: form.icon || undefined,
        });
        router.push(listHref);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title={title}
        subtitle={mode === "edit" ? "항목을 수정합니다" : "새 항목을 등록합니다"}
      />
      <AdminBackLink href={backHref} />
      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">이름</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>
        {showNameEn ? (
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">영문 이름 (선택)</label>
            <input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        ) : null}
        {showDescription ? (
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border border-border bg-background px-4 py-3 text-sm"
            />
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              슬러그 (비우면 자동 생성)
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">표시 순서</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>
        {showIcon ? (
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">아이콘 키 (선택)</label>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="message, shopping, flag ..."
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : mode === "edit" ? "수정" : "등록"}
          </Button>
          <Link href={listHref}>
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
