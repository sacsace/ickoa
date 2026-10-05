"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { AdminFileUpload } from "@/components/admin/admin-file-upload";
import { Button } from "@/components/ui/button";
import { createMagazineIssue } from "@/actions/admin";

export function AdminMagazineForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    volume: "",
    publishedAt: "",
    title: "다이나믹 코리안",
    subtitle: "재인도 첸나이 한인회보",
    editorNote: "",
    coverUrl: "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [hasCover, setHasCover] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pdfFile) {
      setError("PDF 파일을 선택해 주세요.");
      return;
    }
    if (!hasCover && !form.coverUrl.trim()) {
      setError("표지 이미지 파일 또는 URL을 입력해 주세요.");
      return;
    }
    const fd = new FormData();
    fd.set("volume", form.volume);
    fd.set("publishedAt", form.publishedAt);
    fd.set("title", form.title);
    fd.set("subtitle", form.subtitle);
    fd.set("editorNote", form.editorNote);
    fd.set("coverUrl", form.coverUrl);
    fd.set("pdf", pdfFile);
    const coverInput = document.querySelector<HTMLInputElement>('input[name="cover"]');
    if (coverInput?.files?.[0]) fd.set("cover", coverInput.files[0]);

    startTransition(async () => {
      try {
        const issue = await createMagazineIssue(fd);
        router.push(`/admin/magazine/${issue.id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="한인회보 등록" subtitle="PDF와 표지를 업로드합니다" />
      <AdminBackLink href="/admin/magazine" />
      <form onSubmit={handleCreate} className="space-y-4 border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">호수 *</label>
            <input type="number" min={1} value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} className="h-11 w-full border border-border bg-background px-4 text-sm" required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">발행월 (YYYY-MM) *</label>
            <input value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} placeholder="2025-07" pattern="\d{4}-\d{2}" className="h-11 w-full border border-border bg-background px-4 text-sm" required />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11 w-full border border-border bg-background px-4 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">부제</label>
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="h-11 w-full border border-border bg-background px-4 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">편집자 노트 (선택)</label>
          <textarea value={form.editorNote} onChange={(e) => setForm({ ...form, editorNote: e.target.value })} rows={3} className="w-full border border-border bg-background px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">PDF 파일 *</label>
          <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} className="w-full text-sm" required />
          <p className="mt-1 text-xs text-muted-foreground">최대 25MB · PDF 형식</p>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">표지 이미지 *</label>
          <AdminFileUpload name="cover" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" disabled={isPending} hint="권장 600×800px (3:4) · JPEG/PNG/WebP · 최대 25MB" onFileChange={(f) => setHasCover(!!f)} />
          <input value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="또는 표지 이미지 URL" className="mt-2 h-11 w-full border border-border bg-background px-4 text-sm" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>{isPending ? "업로드 중..." : "등록"}</Button>
          <Link href="/admin/magazine"><Button type="button" size="sm" variant="outline">취소</Button></Link>
        </div>
      </form>
    </>
  );
}
