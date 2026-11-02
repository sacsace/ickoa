"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { galleryAlbumPathId } from "@/lib/gallery-slug";
import {
  addGalleryPhoto,
  deleteGalleryAlbum,
  deleteGalleryPhoto,
  toggleGalleryAlbumPublished,
  updateGalleryAlbum,
} from "@/actions/admin";

type AlbumDetail = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  cover: string;
  published: boolean;
  photos: { id: string; src: string; caption: string }[];
};

type CategoryOption = { id: string; name: string; slug: string };

export function AdminGalleryDetail({
  album,
  categories = [],
}: {
  album: AlbumDetail;
  categories?: CategoryOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<{ id: string; caption: string } | null>(null);
  const [meta, setMeta] = useState({
    title: album.title,
    titleEn: album.titleEn,
    slug: album.slug,
    description: album.description,
    descriptionEn: album.descriptionEn,
    category: album.category,
  });

  useEffect(() => {
    setMeta({
      title: album.title,
      titleEn: album.titleEn,
      slug: album.slug,
      description: album.description,
      descriptionEn: album.descriptionEn,
      category: album.category,
    });
  }, [
    album.title,
    album.titleEn,
    album.slug,
    album.description,
    album.descriptionEn,
    album.category,
  ]);

  const sitePath = `/gallery/${galleryAlbumPathId({ id: album.id, slug: meta.slug || album.slug })}`;

  function handleSaveMeta() {
    setMetaError(null);
    startTransition(async () => {
      try {
        await updateGalleryAlbum(album.id, meta);
        router.refresh();
      } catch (err) {
        setMetaError(err instanceof Error ? err.message : "앨범 정보 저장 실패");
      }
    });
  }

  function handleAddPhoto() {
    setError(null);
    const fd = new FormData();
    fd.set("albumId", album.id);
    fd.set("caption", photoCaption);
    if (photoFile) fd.set("photo", photoFile);
    startTransition(async () => {
      try {
        await addGalleryPhoto(fd);
        setPhotoCaption("");
        setPhotoFile(null);
        if (photoInputRef.current) photoInputRef.current.value = "";
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "사진 추가 실패");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title={album.title} subtitle={sitePath} />
      <AdminBackLink href="/admin/gallery" />
      <div className="mb-4">
        <Link href={sitePath} target="_blank" className="text-sm text-brand hover:underline">
          사이트에서 보기
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await toggleGalleryAlbumPublished(album.id, !album.published);
              router.refresh();
            })
          }
        >
          {album.published ? "비공개" : "공개"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50"
          disabled={isPending}
          onClick={() => setDeleteOpen(true)}
        >
          앨범 삭제
        </Button>
      </div>

      <div className="mb-6 border border-border p-4">
        <h3 className="mb-3 text-sm font-medium">앨범 정보</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">제목 (한국어) *</label>
            <input
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              className="h-10 w-full border border-border bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Title (English)</label>
            <input
              value={meta.titleEn}
              onChange={(e) => setMeta({ ...meta, titleEn: e.target.value })}
              className="h-10 w-full border border-border bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">슬러그 (영문·숫자·하이픈)</label>
            <input
              value={meta.slug}
              onChange={(e) => setMeta({ ...meta, slug: e.target.value })}
              className="h-10 w-full border border-border bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">카테고리</label>
            {categories.length > 0 ? (
              <select
                value={meta.category}
                onChange={(e) => setMeta({ ...meta, category: e.target.value })}
                className="h-10 w-full border border-border bg-background px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={meta.category}
                onChange={(e) => setMeta({ ...meta, category: e.target.value })}
                className="h-10 w-full border border-border bg-background px-3 text-sm"
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">설명 (한국어)</label>
            <textarea
              value={meta.description}
              onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              rows={2}
              className="w-full border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">Description (English)</label>
            <textarea
              value={meta.descriptionEn}
              onChange={(e) => setMeta({ ...meta, descriptionEn: e.target.value })}
              rows={2}
              className="w-full border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        {metaError && <p className="mt-2 text-sm text-red-600">{metaError}</p>}
        <div className="mt-3">
          <Button type="button" size="sm" disabled={isPending || !meta.title.trim()} onClick={handleSaveMeta}>
            {isPending ? "저장 중..." : "정보 저장"}
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {album.photos.map((p) => (
          <div key={p.id} className="text-sm">
            <div className="relative h-20 w-20 overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- local upload paths bypass next/image optimizer */}
              <img
                src={p.src}
                alt={p.caption || album.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.25";
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setDeletePhotoTarget(p)}
              className="mt-1 text-xs text-red-600"
            >
              삭제
            </button>
          </div>
        ))}
        {album.photos.length === 0 && (
          <p className="text-sm text-muted-foreground">등록된 사진이 없습니다.</p>
        )}
      </div>
      <div className="border border-border p-4">
        <h3 className="mb-3 text-sm font-medium">사진 추가</h3>
        <div className="flex flex-wrap gap-2">
          <input
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            placeholder="사진 설명"
            className="h-9 min-w-[160px] flex-1 border border-border bg-background px-3 text-sm"
          />
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <Button type="button" size="sm" disabled={isPending || !photoFile} onClick={handleAddPhoto}>
            추가
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <AdminConfirmDialog
        open={deleteOpen}
        title="앨범 삭제"
        description={`「${album.title}」 앨범을 삭제합니다.`}
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() =>
          startTransition(async () => {
            await deleteGalleryAlbum(album.id);
            router.push("/admin/gallery");
            router.refresh();
          })
        }
        onCancel={() => setDeleteOpen(false)}
      />
      <AdminConfirmDialog
        open={deletePhotoTarget !== null}
        title="사진 삭제"
        description="이 사진을 삭제하시겠습니까?"
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deletePhotoTarget) return;
          startTransition(async () => {
            await deleteGalleryPhoto(deletePhotoTarget.id);
            setDeletePhotoTarget(null);
            router.refresh();
          });
        }}
        onCancel={() => setDeletePhotoTarget(null)}
      />
    </>
  );
}
