"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { AdminFileUpload } from "@/components/admin/admin-file-upload";
import { Button } from "@/components/ui/button";
import { createGalleryAlbum } from "@/actions/admin";

type CategoryOption = { id: string; name: string; slug: string };

export function AdminGalleryForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    titleEn: "",
    slug: "",
    category: categories[0]?.slug ?? "ickoa",
    coverUrl: "",
  });
  const [hasCover, setHasCover] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (categories.length === 0) {
      setError("갤러리 카테고리를 먼저 등록해 주세요.");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    const coverInput = document.querySelector<HTMLInputElement>('input[name="cover"]');
    if (coverInput?.files?.[0]) fd.set("cover", coverInput.files[0]);
    if (!hasCover && !form.coverUrl.trim()) {
      setError("표지 이미지를 업로드하거나 URL을 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      try {
        const album = await createGalleryAlbum(fd);
        router.push(`/admin/gallery/${album.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "등록 실패");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="앨범 등록" />
      <AdminBackLink href="/admin/gallery" />
      <form onSubmit={handleCreate} className="space-y-4 border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">앨범 제목 (한국어) *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Album title (English)</label>
            <input
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">슬러그 *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="ickoa-events"
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">카테고리</label>
            {categories.length > 0 ? (
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-11 w-full border border-border bg-background px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <Link
                href="/admin/gallery/categories/new"
                className="block text-sm text-brand hover:underline"
              >
                카테고리 먼저 등록하기
              </Link>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">표지 이미지 *</label>
          <AdminFileUpload
            name="cover"
            accept="image/*"
            disabled={isPending}
            hint="권장 1200×800px · JPEG/PNG/WebP · 최대 25MB"
            onFileChange={(f) => setHasCover(!!f)}
          />
          <input
            value={form.coverUrl}
            onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
            placeholder="또는 표지 URL"
            className="mt-2 h-11 w-full border border-border bg-background px-4 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending || categories.length === 0}>
            {isPending ? "등록 중..." : "등록"}
          </Button>
          <Link href="/admin/gallery">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
