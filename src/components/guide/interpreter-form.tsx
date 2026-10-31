"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSiteGuide, updateSiteGuide } from "@/actions/guides";
import { guideListPath, guideWriteLabel } from "@/data/guide";
import {
  buildInterpreterContent,
  emptyInterpreterProfile,
  parseInterpreterProfile,
  type InterpreterProfile,
} from "@/lib/interpreter-guide";

const fieldClass =
  "h-11 w-full border border-border bg-card px-4 text-sm outline-none focus:border-brand/50";

const GENDER_OPTIONS = ["남", "여", "기타"] as const;

type InterpreterFormProps = {
  category: string;
  categorySlug?: string | null;
  initial?: {
    id: string;
    title: string;
    content: string;
    region: string;
  };
};

export function InterpreterForm({
  category,
  categorySlug,
  initial,
}: InterpreterFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const listHref = guideListPath(category, categorySlug);
  const writeLabel = guideWriteLabel(category);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState<InterpreterProfile>(() =>
    emptyInterpreterProfile(
      initial ? parseInterpreterProfile(initial) : undefined,
    ),
  );

  function updateField<K extends keyof InterpreterProfile>(
    key: K,
    value: InterpreterProfile[K],
  ) {
    setForm((prev) => emptyInterpreterProfile({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const name = (form.name ?? "").trim();
    const region = (form.region ?? "").trim();
    const age = (form.age ?? "").trim();
    const gender = (form.gender ?? "").trim();
    const languages = (form.languages ?? "").trim();
    const email = (form.email ?? "").trim();

    if (!name || !region || !age || !gender || !languages || !email) {
      setError("필수 항목을 모두 입력해 주세요.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("메일 주소 형식을 확인해 주세요.");
      return;
    }

    const profile = emptyInterpreterProfile({
      name,
      region,
      age,
      gender,
      languages,
      email,
      phone: (form.phone ?? "").trim(),
      notes: (form.notes ?? "").trim(),
    });

    startTransition(async () => {
      try {
        const payload = {
          title: profile.name,
          content: buildInterpreterContent(profile),
          category,
          region: profile.region,
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
        else
          setError(
            message || (isEdit ? "수정에 실패했습니다." : "등록에 실패했습니다."),
          );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl space-y-4">
      <div className="mb-2">
        <h2 className="text-base font-bold">
          {isEdit ? `${writeLabel} 수정` : `${writeLabel} 등록`}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          통역 가능한 정보를 회원 가입과 같은 방식으로 등록해 주세요.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">통역 가능 지역</label>
        <input
          value={form.region ?? ""}
          onChange={(e) => updateField("region", e.target.value)}
          className={fieldClass}
          placeholder="예: Chennai, Bangalore"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">이름</label>
        <input
          value={form.name ?? ""}
          onChange={(e) => updateField("name", e.target.value)}
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">나이</label>
        <input
          type="number"
          min={1}
          max={120}
          value={form.age ?? ""}
          onChange={(e) => updateField("age", e.target.value)}
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">성별</label>
        <select
          value={form.gender ?? ""}
          onChange={(e) => updateField("gender", e.target.value)}
          className={fieldClass}
          required
        >
          <option value="" disabled>
            선택
          </option>
          {GENDER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">구사 언어</label>
        <input
          value={form.languages ?? ""}
          onChange={(e) => updateField("languages", e.target.value)}
          className={fieldClass}
          placeholder="예: 한국어, 영어, 타밀어"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">메일 주소</label>
        <input
          type="email"
          value={form.email ?? ""}
          onChange={(e) => updateField("email", e.target.value)}
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          전화번호 <span className="font-normal text-muted-foreground">(선택)</span>
        </label>
        <input
          type="tel"
          value={form.phone ?? ""}
          onChange={(e) => updateField("phone", e.target.value)}
          className={fieldClass}
          placeholder="예: +91-98765-43210"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">특이사항</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
          className="min-h-28 w-full border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand/50"
          placeholder="가능 시간대, 전문 분야 등"
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
          {isPending
            ? isEdit
              ? "저장 중..."
              : "등록 중..."
            : isEdit
              ? "저장"
              : "등록"}
        </Button>
      </div>
    </form>
  );
}
