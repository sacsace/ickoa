"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import {
  addGalleryPhoto,
  deleteGalleryAlbum,
  deleteGalleryPhoto,
  toggleGalleryAlbumPublished,
} from "@/actions/admin";

type AlbumDetail = {
  id: string;
  slug: string;
  title: string;
  cover: string;
  published: boolean;
  photos: { id: string; src: string; caption: string }[];
};

export function AdminGalleryDetail({ album }: { album: AlbumDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<{ id: string; caption: string } | null>(null);

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
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "사진 추가 실패");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title={album.title} subtitle={`/gallery/${album.slug}`} />
      <AdminBackLink href="/admin/gallery" />
      <div className="mb-4">
        <Link href={`/gallery/${album.slug}`} target="_blank" className="text-sm text-brand hover:underline">사이트에서 보기</Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => startTransition(async () => { await toggleGalleryAlbumPublished(album.id, !album.published); router.refresh(); })}>{album.published ? "비공개" : "공개"}</Button>
        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" disabled={isPending} onClick={() => setDeleteOpen(true)}>앨범 삭제</Button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {album.photos.map((p) => (
          <div key={p.id} className="text-sm">
            <div className="relative h-20 w-20 overflow-hidden bg-muted">
              <Image src={p.src} alt={p.caption} fill className="object-cover" sizes="80px" unoptimized={p.src.startsWith("http")} />
            </div>
            <button type="button" onClick={() => setDeletePhotoTarget(p)} className="mt-1 text-xs text-red-600">삭제</button>
          </div>
        ))}
        {album.photos.length === 0 && <p className="text-sm text-muted-foreground">등록된 사진이 없습니다.</p>}
      </div>
      <div className="border border-border p-4">
        <h3 className="mb-3 text-sm font-medium">사진 추가</h3>
        <div className="flex flex-wrap gap-2">
          <input value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} placeholder="사진 설명" className="h-9 min-w-[160px] flex-1 border border-border bg-background px-3 text-sm" />
          <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="text-sm" />
          <Button type="button" size="sm" disabled={isPending || !photoFile} onClick={handleAddPhoto}>추가</Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <AdminConfirmDialog open={deleteOpen} title="앨범 삭제" description={`「${album.title}」 앨범을 삭제합니다.`} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => startTransition(async () => { await deleteGalleryAlbum(album.id); router.push("/admin/gallery"); router.refresh(); })} onCancel={() => setDeleteOpen(false)} />
      <AdminConfirmDialog open={deletePhotoTarget !== null} title="사진 삭제" description="이 사진을 삭제하시겠습니까?" confirmLabel="삭제" destructive loading={isPending} onConfirm={() => { if (!deletePhotoTarget) return; startTransition(async () => { await deleteGalleryPhoto(deletePhotoTarget.id); setDeletePhotoTarget(null); router.refresh(); }); }} onCancel={() => setDeletePhotoTarget(null)} />
    </>
  );
}
