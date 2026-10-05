"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminFileUpload } from "@/components/admin/admin-file-upload";
import { Button } from "@/components/ui/button";
import {
  deleteHeroSlide,
  moveHeroSlide,
  submitHeroSlide,
  toggleHeroSlideActive,
} from "@/actions/admin";

type HeroSlideRow = {
  id: string;
  mediaType: string;
  mediaUrl: string;
  caption: string | null;
  captionEn: string | null;
  link: string | null;
  active: boolean;
  order: number;
};

const IMAGE_UPLOAD_HINT =
  "권장 크기 1920×1080px (16:9) · JPEG, PNG, WebP, GIF · 최대 25MB";
const VIDEO_UPLOAD_HINT =
  "권장 해상도 1920×1080 · MP4, WebM, MOV · 최대 25MB";

export function AdminHeroClient({ slides }: { slides: HeroSlideRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const lastResetKey = useRef<number | undefined>(undefined);
  const [formState, formAction, formPending] = useActionState(submitHeroSlide, {
    error: null,
  });
  const [form, setForm] = useState({
    mediaType: "IMAGE",
    caption: "",
    captionEn: "",
    link: "",
    mediaUrl: "",
  });
  const [hasMediaFile, setHasMediaFile] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlideRow | null>(null);

  useEffect(() => {
    if (!formState.resetKey || formState.resetKey === lastResetKey.current) return;
    lastResetKey.current = formState.resetKey;
    setFormKey(formState.resetKey);
    setForm({
      mediaType: "IMAGE",
      caption: "",
      captionEn: "",
      link: "",
      mediaUrl: "",
    });
    setHasMediaFile(false);
    setUploadKey((k) => k + 1);
    router.refresh();
  }, [formState.resetKey, router]);

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleHeroSlideActive(id, active);
      router.refresh();
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startTransition(async () => {
      await deleteHeroSlide(id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    startTransition(async () => {
      await moveHeroSlide(id, direction);
      router.refresh();
    });
  }

  const accept =
    form.mediaType === "VIDEO"
      ? "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
      : "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

  return (
    <div>
      <AdminPageHeader
        title="히어로 슬라이드"
        subtitle="메인 화면 배경 이미지·동영상"
      />

      <form
        key={formKey}
        action={formAction}
        className="mb-10 space-y-4 border border-border p-4"
      >
        <h2 className="text-sm font-medium">새 슬라이드</h2>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">미디어 유형</label>
          <select
            name="mediaType"
            value={form.mediaType}
            onChange={(e) => {
              setForm({ ...form, mediaType: e.target.value });
              setHasMediaFile(false);
              setUploadKey((k) => k + 1);
            }}
            className="h-10 w-full border border-border bg-background px-3 text-sm"
          >
            <option value="IMAGE">이미지</option>
            <option value="VIDEO">동영상</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">파일 업로드</label>
          <AdminFileUpload
            key={uploadKey}
            name="media"
            accept={accept}
            disabled={formPending}
            hint={form.mediaType === "VIDEO" ? VIDEO_UPLOAD_HINT : IMAGE_UPLOAD_HINT}
            onFileChange={(file) => setHasMediaFile(!!file)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">또는 URL</label>
          <input
            name="mediaUrl"
            value={form.mediaUrl}
            onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
            placeholder="/image/hero-community.jpg"
            className="h-10 w-full border border-border bg-background px-3 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            파일 업로드가 우선 적용됩니다. URL은 기존 이미지 경로를 직접 지정할 때 사용하세요.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">캡션 (한국어)</label>
            <input
              name="caption"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="h-10 w-full border border-border bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">캡션 (English)</label>
            <input
              name="captionEn"
              value={form.captionEn}
              onChange={(e) => setForm({ ...form, captionEn: e.target.value })}
              className="h-10 w-full border border-border bg-background px-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">링크 URL (선택)</label>
          <input
            name="link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="h-10 w-full border border-border bg-background px-3 text-sm"
          />
        </div>

        {formState.error && <p className="text-sm text-red-600">{formState.error}</p>}

        <Button
          type="submit"
          size="sm"
          disabled={formPending || isPending || (!hasMediaFile && !form.mediaUrl.trim())}
        >
          {formPending ? "업로드 중..." : "등록"}
        </Button>
      </form>

      <h2 className="mb-3 text-sm font-medium">등록된 슬라이드 ({slides.length})</h2>

      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-wrap items-center gap-4 border border-border p-3"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-muted">
              {slide.mediaType === "VIDEO" ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  동영상
                </div>
              ) : (
                <Image
                  src={slide.mediaUrl}
                  alt={slide.caption ?? "slide"}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={slide.mediaUrl.startsWith("http")}
                />
              )}
            </div>

            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">
                {slide.caption || slide.mediaUrl.split("/").pop()}
              </p>
              <p className="truncate text-xs text-muted-foreground">{slide.mediaUrl}</p>
              <p className="text-xs text-muted-foreground">
                {slide.mediaType === "VIDEO" ? "동영상" : "이미지"} · {slide.active ? "활성" : "비활성"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                disabled={isPending || index === 0}
                onClick={() => handleMove(slide.id, "up")}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                위로
              </button>
              <button
                type="button"
                disabled={isPending || index === slides.length - 1}
                onClick={() => handleMove(slide.id, "down")}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                아래로
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleToggle(slide.id, !slide.active)}
                className="text-muted-foreground hover:text-foreground"
              >
                {slide.active ? "비활성" : "활성"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeleteTarget(slide)}
                className="text-red-600 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <p className="border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            등록된 슬라이드가 없습니다.
          </p>
        )}
      </div>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="슬라이드 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.caption || deleteTarget.mediaUrl.split("/").pop()}」 슬라이드를 삭제합니다. 삭제 후에는 복구할 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        destructive
        loading={isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
