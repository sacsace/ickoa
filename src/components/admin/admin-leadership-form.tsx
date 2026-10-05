"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createLeadershipMember, updateLeadershipMember } from "@/actions/about";

type LeadershipFormProps = {
  initial?: {
    id: string;
    name: string;
    nameEn: string | null;
    role: string;
    bio: string | null;
    image: string | null;
    order: number;
    published: boolean;
  };
};

export function AdminLeadershipForm({ initial }: LeadershipFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameEn: initial?.nameEn ?? "",
    role: initial?.role ?? "",
    bio: initial?.bio ?? "",
    image: initial?.image ?? "",
    order: String(initial?.order ?? 0),
    published: initial?.published ?? true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      nameEn: form.nameEn,
      role: form.role,
      bio: form.bio,
      image: form.image,
      order: Number(form.order) || 0,
      published: form.published,
    };
    startTransition(async () => {
      try {
        if (initial) await updateLeadershipMember(initial.id, payload);
        else await createLeadershipMember(payload);
        router.push("/admin/about/leadership");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title={initial ? "임원 수정" : "임원 등록"} />
      <AdminBackLink href="/admin/about/leadership" />
      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">직책 *</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="회장"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">표시 순서</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">이름 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">영문 이름</label>
            <input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="Kim OO"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">소개</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full border border-border bg-background px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">사진 URL</label>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="https://... 또는 /uploads/..."
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          사이트에 공개
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : initial ? "수정" : "등록"}
          </Button>
          <Link href="/admin/about/leadership">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
