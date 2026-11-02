"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminAlertDialog } from "@/components/admin/admin-alert-dialog";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/community/content-editor";
import { createClub, updateClub } from "@/actions/admin";
import type { AdminDialogVariant } from "@/components/admin/admin-dialog";

export function AdminClubForm({
  mode,
  club,
}: {
  mode: "create" | "edit";
  club?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    order?: number;
    leaderEmail?: string | null;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
    variant: AdminDialogVariant;
    redirect?: boolean;
  } | null>(null);
  const [form, setForm] = useState({
    name: club?.name ?? "",
    slug: club?.slug ?? "",
    description: club?.description ?? "",
    icon: club?.icon ?? "",
    order: club?.order ?? 0,
    leaderEmail: club?.leaderEmail ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const payload = {
          name: form.name,
          slug: form.slug || undefined,
          description: form.description || undefined,
          icon: form.icon || undefined,
          order: Number(form.order) || 0,
          leaderEmail: form.leaderEmail,
        };
        if (mode === "edit" && club) {
          await updateClub(club.id, payload);
        } else {
          await createClub(payload);
        }
        setAlert({
          title: mode === "edit" ? "수정 완료" : "등록 완료",
          message: "동호회가 저장되었습니다.",
          variant: "success",
          redirect: true,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "저장에 실패했습니다.";
        setError(message);
        setAlert({
          title: "저장 실패",
          message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title={mode === "edit" ? "동호회 수정" : "동호회 등록"}
        subtitle={mode === "edit" ? "동호회 정보를 수정합니다" : "새 동호회를 등록합니다"}
      />
      <AdminBackLink href="/admin/clubs" />
      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">이름</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            그룹장 이메일
          </label>
          <input
            type="email"
            value={form.leaderEmail}
            onChange={(e) => setForm({ ...form, leaderEmail: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="사이트 회원 이메일"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            가입 승인은 이 그룹장만 할 수 있습니다.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">설명</label>
          <ContentEditor
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="동호회 소개를 입력하세요"
            minHeight={200}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              슬러그 (비우면 자동 생성)
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">정렬</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: Number(e.target.value) || 0 })
              }
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">아이콘</label>
          <input
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중..." : "저장"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/clubs")}
          >
            목록
          </Button>
        </div>
      </form>
      <AdminAlertDialog
        open={alert !== null}
        title={alert?.title}
        message={alert?.message ?? ""}
        variant={alert?.variant ?? "default"}
        onClose={() => {
          const shouldRedirect = alert?.redirect;
          setAlert(null);
          if (shouldRedirect) {
            router.push("/admin/clubs");
            router.refresh();
          }
        }}
      />
    </>
  );
}
