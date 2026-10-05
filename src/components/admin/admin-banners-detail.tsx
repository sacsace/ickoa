"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { deleteBanner, toggleBannerActive } from "@/actions/admin";

type BannerDetail = { id: string; title: string; image: string; link: string | null; active: boolean };

export function AdminBannersDetail({ banner }: { banner: BannerDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <AdminPageHeader title="배너 상세" />
      <AdminBackLink href="/admin/banners" />
      <article className="border border-border">
        <header className="border-b border-border px-4 py-5 md:px-6">
          <h2 className="text-lg font-semibold">{banner.title}</h2>
          <p className="mt-2 text-xs text-muted-foreground">{banner.active ? "활성" : "비활성"}{banner.link ? ` · ${banner.link}` : ""}</p>
        </header>
        <div className="relative mx-4 my-6 aspect-[3/1] max-w-2xl overflow-hidden bg-muted md:mx-6">
          <Image src={banner.image} alt={banner.title} fill className="object-cover" unoptimized={banner.image.startsWith("http")} />
        </div>
      </article>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/banners"><Button size="sm" variant="outline">목록</Button></Link>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => startTransition(async () => { await toggleBannerActive(banner.id, !banner.active); router.refresh(); })}>{banner.active ? "비활성" : "활성"}</Button>
        <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" disabled={isPending} onClick={() => setDeleteOpen(true)}>삭제</Button>
      </div>
      <AdminConfirmDialog open={deleteOpen} title="배너 삭제" description={`「${banner.title}」 배너를 삭제합니다.`} confirmLabel="삭제" destructive loading={isPending} onConfirm={() => startTransition(async () => { await deleteBanner(banner.id); router.push("/admin/banners"); router.refresh(); })} onCancel={() => setDeleteOpen(false)} />
    </>
  );
}
