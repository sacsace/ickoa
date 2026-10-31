"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/community/content-editor";
import { submitContactInquiry } from "@/actions/mail";
import { plainTextFromHtml, sanitizePostHtml } from "@/lib/sanitize-html";

const fieldClass =
  "h-11 w-full border border-border bg-card px-4 text-sm outline-none focus:border-brand/50";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanMessage = sanitizePostHtml(form.message);
    if (!plainTextFromHtml(cleanMessage)) {
      setError("문의 내용을 입력해 주세요.");
      return;
    }

    startTransition(async () => {
      try {
        await submitContactInquiry({ ...form, message: cleanMessage });
        setDone(true);
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "문의 접수에 실패했습니다.");
      }
    });
  }

  if (done) {
    return (
      <div className="border border-border bg-card p-6 md:p-8">
        <h2 className="text-lg font-bold">문의가 접수되었습니다</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          확인 후 남겨 주신 메일로 답변드리겠습니다.
        </p>
        <Button
          type="button"
          className="mt-6"
          variant="outline"
          onClick={() => setDone(false)}
        >
          다른 문의 작성
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border bg-card p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">이름</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={fieldClass}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">메일 주소</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={fieldClass}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            전화번호 <span className="font-normal text-muted-foreground">(선택)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">제목</label>
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className={fieldClass}
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">문의 내용</label>
        <ContentEditor
          value={form.message}
          onChange={(message) => setForm({ ...form, message })}
          placeholder="문의 내용을 입력하세요"
          minHeight={480}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="whitespace-nowrap">
          {isPending ? "접수 중..." : "문의하기"}
        </Button>
      </div>
    </form>
  );
}
