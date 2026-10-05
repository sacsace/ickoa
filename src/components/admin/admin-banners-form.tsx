"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createBanner } from "@/actions/admin";

export function AdminBannersForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ title: "", image: "", link: "" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const banner = await createBanner(form);
      router.push(`/admin/banners/${banner.id}`);
      router.refresh();
    });
  }

  return (
    <>
      <AdminPageHeader title="배너 등록" />
      <AdminBackLink href="/admin/banners" />
      <form onSubmit={handleCreate} className="space-y-4 border border-border p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11 w-full border border-border bg-background px-4 text-sm" required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">이미지 URL</label>
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://... 또는 /image/..." className="h-11 w-full border border-border bg-background px-4 text-sm" required />
          <p className="mt-1 text-xs text-muted-foreground">권장 크기 1200×400px (3:1) · JPEG/PNG/WebP</p>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">링크 URL (선택)</label>
          <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="h-11 w-full border border-border bg-background px-4 text-sm" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>{isPending ? "등록 중..." : "등록"}</Button>
          <Link href="/admin/banners"><Button type="button" size="sm" variant="outline">취소</Button></Link>
        </div>
      </form>
    </>
  );
}
