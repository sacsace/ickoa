"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createBusinessesBulk } from "@/actions/admin";
import { BUSINESS_CSV_TEMPLATE, parseBusinessCsv } from "@/lib/business-csv";

export function AdminBusinessBulkForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState(BUSINESS_CSV_TEMPLATE);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  function downloadTemplate() {
    const blob = new Blob([`\uFEFF${BUSINESS_CSV_TEMPLATE}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kaic-businesses-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFileChange(file: File | null) {
    if (!file) return;
    setError("");
    setResult(null);
    const content = await file.text();
    setText(content);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    startTransition(async () => {
      try {
        const rows = parseBusinessCsv(text);
        const res = await createBusinessesBulk(rows);
        setResult(res);
        if (res.created > 0) router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "일괄 등록에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title="한인 기업 일괄 등록"
        subtitle="CSV 파일 또는 아래 표 형식으로 여러 기업을 한 번에 등록합니다"
      />
      <AdminBackLink href="/admin/businesses" />

      <div className="mb-4 space-y-2 border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          필수 열: <span className="font-medium text-foreground">기업명, 업종, 지역, 주소</span>
        </p>
        <p>
          선택 열: 전화, 웹사이트, 위도, 경도, 소개 · 업종 예:{" "}
          {categories.length > 0 ? categories.join(", ") : "(업종 관리에서 등록)"}
        </p>
        <p>Excel에서는 「CSV UTF-8」로 저장한 뒤 업로드하세요. 한 번에 최대 500곳.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={downloadTemplate}>
            템플릿 다운로드
          </Button>
          <label className="inline-flex cursor-pointer">
            <span className="inline-flex h-8 items-center rounded-[3px] border border-border bg-white px-3 text-xs font-semibold hover:bg-muted">
              CSV 파일 선택
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">CSV 내용</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full border border-border bg-background px-3 py-3 font-mono text-xs outline-none focus:border-brand"
            spellCheck={false}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {result ? (
          <div className="space-y-1 text-sm">
            <p className="text-brand">
              {result.created}곳 등록 · {result.skipped}곳 건너뜀
            </p>
            {result.errors.length > 0 ? (
              <ul className="list-disc pl-5 text-muted-foreground">
                {result.errors.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => router.push("/admin/businesses")}
          >
            목록으로
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "등록 중..." : "일괄 등록"}
          </Button>
        </div>
      </form>
    </>
  );
}
