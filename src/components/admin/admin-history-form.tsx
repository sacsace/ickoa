"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { AdminFileUpload } from "@/components/admin/admin-file-upload";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/community/content-editor";
import { createHistoryEntry, updateHistoryEntry } from "@/actions/about";

type HistoryFormProps = {
  initial?: {
    id: string;
    year: string;
    title: string;
    description: string | null;
    image?: string | null;
    order: number;
  };
};

export function AdminHistoryForm({ initial }: HistoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [hasImageFile, setHasImageFile] = useState(false);
  const [clearImage, setClearImage] = useState(false);
  const [form, setForm] = useState({
    year: initial?.year ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    imageUrl: "",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    formData.set("year", form.year);
    formData.set("title", form.title);
    formData.set("description", form.description);
    formData.set("imageUrl", form.imageUrl);
    if (clearImage) formData.set("clearImage", "1");

    startTransition(async () => {
      try {
        if (initial) {
          await updateHistoryEntry(initial.id, formData);
        } else {
          await createHistoryEntry(formData);
        }
        router.push("/admin/about/history");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  const showCurrentImage = Boolean(initial?.image) && !clearImage && !hasImageFile;

  return (
    <>
      <AdminPageHeader title={initial ? "연혁 수정" : "연혁 등록"} />
      <AdminBackLink href="/admin/about/history" />
      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">연도 *</label>
          <input
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="2000-2002년"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목 *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">설명</label>
          <ContentEditor
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="연혁 설명을 입력하세요"
            minHeight={180}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">사진</label>
          {showCurrentImage ? (
            <div className="mb-3 border border-border bg-muted/20 p-3">
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={initial!.image!}
                  alt=""
                  className="h-24 w-36 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">현재 등록된 사진</p>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setClearImage(true)}
                    className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    사진 제거
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <AdminFileUpload
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            disabled={isPending}
            hint="JPEG/PNG/WebP/GIF · 최대 10MB"
            onFileChange={(file) => {
              setHasImageFile(!!file);
              if (file) setClearImage(false);
            }}
          />
          <input
            value={form.imageUrl}
            onChange={(e) => {
              setForm({ ...form, imageUrl: e.target.value });
              if (e.target.value.trim()) setClearImage(false);
            }}
            className="mt-2 h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="또는 이미지 URL 입력 (https://... / /history/...)"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : initial ? "수정" : "등록"}
          </Button>
          <Link href="/admin/about/history">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
