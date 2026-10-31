"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/community/content-editor";
import { InterpreterForm } from "@/components/guide/interpreter-form";
import { createSiteGuide, updateSiteGuide } from "@/actions/guides";
import { guideListPath, guideWriteLabel } from "@/data/guide";
import { isInterpreterCategory } from "@/lib/interpreter-guide";
import { plainTextFromHtml, sanitizePostHtml } from "@/lib/sanitize-html";

type GuideFormProps = {
  category: string;
  categorySlug?: string | null;
  initial?: {
    id: string;
    title: string;
    content: string;
    region: string;
  };
};

export function GuideForm(props: GuideFormProps) {
  if (isInterpreterCategory(props.category)) {
    return <InterpreterForm {...props} />;
  }
  return <GuideArticleForm {...props} />;
}

function GuideArticleForm({ category, categorySlug, initial }: GuideFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const listHref = guideListPath(category, categorySlug);
  const writeLabel = guideWriteLabel(category);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    content: initial?.content ?? "",
    region: initial?.region ?? "Chennai",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanContent = sanitizePostHtml(form.content);
    if (!form.title.trim() || !plainTextFromHtml(cleanContent)) {
      setError("제목과 내용을 입력해 주세요.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: form.title,
          content: cleanContent,
          category,
          region: form.region,
        };
        const saved = isEdit
          ? await updateSiteGuide(initial!.id, payload)
          : await createSiteGuide(payload);
        router.push(`/guide/${saved.id}`);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (message === "Unauthorized") setError("로그인이 필요합니다.");
        else if (message === "Forbidden") setError("수정 권한이 없습니다.");
        else setError(message || (isEdit ? "수정에 실패했습니다." : "등록에 실패했습니다."));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full border border-border bg-card">
      <div className="border-b border-border px-4 py-3 md:px-6">
        <h2 className="text-sm font-bold">
          {isEdit ? `${writeLabel} 수정` : `${writeLabel} 등록`}
        </h2>
      </div>
      <div className="space-y-4 p-4 md:p-6">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">제목</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">내용</label>
          <ContentEditor
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            placeholder="내용을 입력하세요"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">지역</label>
          <input
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Link href={isEdit && initial ? `/guide/${initial.id}` : listHref}>
            <Button type="button" variant="outline" size="sm">
              취소
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? (isEdit ? "저장 중..." : "등록 중...") : isEdit ? "저장" : "등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
