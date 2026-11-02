"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { AdminFileUpload } from "@/components/admin/admin-file-upload";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/community/content-editor";
import { createLeadershipMember, updateLeadershipMember } from "@/actions/about";
import { LEADERSHIP_LEVELS, inferLeadershipLevel } from "@/lib/leadership";

type LeadershipFormProps = {
  initial?: {
    id: string;
    name: string;
    nameEn: string | null;
    role: string;
    bio: string | null;
    image: string | null;
    level?: number;
    order: number;
    published: boolean;
  };
};

export function AdminLeadershipForm({ initial }: LeadershipFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [hasImageFile, setHasImageFile] = useState(false);
  const [clearImage, setClearImage] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameEn: initial?.nameEn ?? "",
    role: initial?.role ?? "",
    bio: initial?.bio ?? "",
    imageUrl: "",
    level: String(
      initial?.level && initial.level > 0
        ? initial.level
        : initial?.role
          ? inferLeadershipLevel(initial.role)
          : 1,
    ),
    published: initial?.published ?? true,
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    formData.set("name", form.name);
    formData.set("nameEn", form.nameEn);
    formData.set("role", form.role);
    formData.set("bio", form.bio);
    formData.set("imageUrl", form.imageUrl);
    formData.set("level", form.level);
    formData.set("published", form.published ? "1" : "0");
    if (clearImage) formData.set("clearImage", "1");

    startTransition(async () => {
      try {
        if (initial) await updateLeadershipMember(initial.id, formData);
        else await createLeadershipMember(formData);
        router.push("/admin/about/leadership");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  const showCurrentImage = Boolean(initial?.image) && !clearImage && !hasImageFile;

  return (
    <>
      <AdminPageHeader title={initial ? "임원 수정" : "임원 등록"} />
      <AdminBackLink href="/admin/about/leadership" />
      <p className="mb-4 text-sm text-muted-foreground">
        조직도 단계를 고르면 사이트에 그 단 위치로 표시됩니다. 같은 단계 안에서는 등록 순서로
        왼쪽부터 나열됩니다.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">조직도 단계 *</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              required
            >
              {LEADERSHIP_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">직책 *</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="회장"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">이름 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">영문 이름</label>
            <input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="Kim OO"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">소개</label>
          <ContentEditor
            value={form.bio}
            onChange={(bio) => setForm({ ...form, bio })}
            placeholder="소개를 입력하세요"
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
                  className="h-24 w-20 shrink-0 object-cover"
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
            hint="JPEG/PNG/WebP/GIF · 최대 10MB · 드래그 앤 드롭 또는 파일 선택"
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
            placeholder="또는 이미지 URL 입력 (https://... / /uploads/...)"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          사이트에 공개
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : initial ? "수정" : "등록"}
          </Button>
          <Link href="/admin/about/leadership">
            <Button type="button" size="sm" variant="outline">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
