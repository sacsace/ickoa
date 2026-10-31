"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { deleteSiteGuide } from "@/actions/guides";
import { guideListPath } from "@/data/guide";

export function GuideDeleteButton({
  guideId,
  title,
  category,
  categorySlug,
}: {
  guideId: string;
  title: string;
  category: string;
  categorySlug?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        삭제
      </Button>
      <AdminConfirmDialog
        open={open}
        title="가이드 삭제"
        description={`「${title}」을(를) 삭제합니다.`}
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          startTransition(async () => {
            try {
              const result = await deleteSiteGuide(guideId);
              setOpen(false);
              router.push(
                guideListPath(result.category || category, categorySlug),
              );
              router.refresh();
            } catch {
              alert("삭제 권한이 없거나 로그인 상태가 아닙니다.");
              setOpen(false);
            }
          });
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
