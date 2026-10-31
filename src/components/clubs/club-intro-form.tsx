"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ContentEditor } from "@/components/community/content-editor";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/providers/alert-provider";
import { createClubIntro, updateClubIntro } from "@/actions/community";
import { isSiteSession } from "@/lib/session-kind";
import { plainTextFromHtml } from "@/lib/sanitize-html";

export function ClubIntroForm({
  mode,
  club,
}: {
  mode: "create" | "edit";
  club?: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const alert = useAlert();
  const { data: session, status } = useSession();
  const allowed = isSiteSession(session);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: club?.name ?? "",
    description: club?.description ?? "",
  });

  if (status === "loading") {
    return (
      <div className="border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">로그인 상태를 확인하는 중...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          동호회 소개를 등록하려면 사이트 회원으로 로그인해 주세요.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(pathname || "/clubs/new")}`}
          className="mt-4 inline-flex h-8 items-center justify-center rounded-[3px] bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark"
        >
          로그인 후 등록
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !plainTextFromHtml(form.description)) {
      setError("동호회 이름과 소개를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "edit" && club) {
        const updated = await updateClubIntro(club.id, {
          name: form.name,
          description: form.description,
        });
        await alert({
          title: "수정 완료",
          message: "동호회 소개가 수정되었습니다.",
          variant: "success",
        });
        router.push(`/clubs/${updated.slug}`);
      } else {
        const created = await createClubIntro({
          name: form.name,
          description: form.description,
        });
        await alert({
          title: "등록 완료",
          message: "동호회 소개가 등록되었습니다.",
          variant: "success",
        });
        router.push(`/clubs/${created.slug}`);
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  const cancelHref = club ? `/clubs/${encodeURIComponent(club.slug)}` : "/clubs";

  return (
    <form onSubmit={handleSubmit} className="w-full border border-border bg-card">
      <div className="border-b border-border px-4 py-3 md:px-6">
        <h2 className="text-sm font-bold">
          {mode === "edit" ? "동호회 소개 수정" : "동호회 소개 등록"}
        </h2>
      </div>
      <div className="space-y-4 p-4 md:p-6">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">동호회 이름</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">소개</label>
          <ContentEditor
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            placeholder="동호회 활동과 모임을 소개해 주세요"
            minHeight={420}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Link href={cancelHref}>
            <Button type="button" variant="outline" size="sm" disabled={loading}>
              취소
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "저장 중..." : mode === "edit" ? "수정 저장" : "소개 등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
