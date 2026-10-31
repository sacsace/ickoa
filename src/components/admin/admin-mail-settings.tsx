"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { sendTestMail, updateMailSetting } from "@/actions/mail";
import type { MailSettingPublic } from "@/lib/mail";

const fieldClass =
  "h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30 disabled:bg-muted disabled:text-muted-foreground";

const GMAIL_PRESET = {
  host: "smtp.gmail.com",
  port: "587",
  secure: false,
} as const;

function isGmailPreset(host: string, port: string, secure: boolean) {
  return (
    host.trim().toLowerCase() === GMAIL_PRESET.host &&
    String(port) === GMAIL_PRESET.port &&
    secure === GMAIL_PRESET.secure
  );
}

export function AdminMailSettings({
  initial,
}: {
  initial: MailSettingPublic;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [testTo, setTestTo] = useState(initial.fromEmail || "");
  const [form, setForm] = useState({
    enabled: initial.enabled,
    host: initial.host,
    port: String(initial.port || 587),
    secure: initial.secure,
    username: initial.username,
    password: "",
    fromEmail: initial.fromEmail,
    fromName: initial.fromName,
    replyTo: initial.replyTo,
    contactEmail: initial.contactEmail,
  });
  const [useGmail, setUseGmail] = useState(
    isGmailPreset(initial.host, String(initial.port || 587), initial.secure),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyGmailPreset(checked: boolean) {
    setUseGmail(checked);
    if (!checked) return;
    setForm((prev) => ({
      ...prev,
      enabled: true,
      host: GMAIL_PRESET.host,
      port: GMAIL_PRESET.port,
      secure: GMAIL_PRESET.secure,
      fromName: prev.fromName.trim() || "첸나이한인회",
      username: prev.username || prev.fromEmail,
      fromEmail: prev.fromEmail || prev.username,
    }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        await updateMailSetting({
          enabled: form.enabled,
          host: form.host,
          port: Number(form.port) || 587,
          secure: form.secure,
          username: form.username,
          password: form.password,
          fromEmail: form.fromEmail,
          fromName: form.fromName,
          replyTo: form.replyTo,
          contactEmail: form.contactEmail,
        });
        setMessage("메일 설정을 저장했습니다.");
        setForm((prev) => ({ ...prev, password: "" }));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  function handleTest() {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        await sendTestMail(testTo);
        setMessage(`테스트 메일을 ${testTo} 로 발송했습니다.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "테스트 발송에 실패했습니다.");
      }
    });
  }

  if (!mounted) {
    return (
      <>
        <AdminPageHeader
          title="메일 설정"
          subtitle="문의하기 메일 발송용 SMTP와 공개 문의 메일을 관리합니다"
        />
        <div className="max-w-3xl space-y-3 border border-border bg-white p-5" aria-hidden>
          <div className="h-11 animate-pulse bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-11 animate-pulse bg-muted" />
            <div className="h-11 animate-pulse bg-muted" />
            <div className="h-11 animate-pulse bg-muted" />
            <div className="h-11 animate-pulse bg-muted" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="메일 설정"
        subtitle="문의하기 메일 발송용 SMTP와 공개 문의 메일을 관리합니다"
      />

      <form onSubmit={handleSave} className="max-w-3xl space-y-4 border border-border bg-white p-5">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => updateField("enabled", e.target.checked)}
              suppressHydrationWarning
            />
            메일 발송 사용
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useGmail}
              onChange={(e) => applyGmailPreset(e.target.checked)}
              suppressHydrationWarning
            />
            Gmail 자동 설정
          </label>
        </div>
        {useGmail ? (
          <p className="text-xs text-muted-foreground">
            Gmail은 일반 비밀번호 대신 Google 계정{" "}
            <span className="font-medium text-foreground">앱 비밀번호</span>를 사용하세요.
            호스트·포트·SSL은 자동으로 맞춰집니다.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">SMTP 호스트</label>
            <input
              value={form.host}
              onChange={(e) => {
                updateField("host", e.target.value);
                setUseGmail(false);
              }}
              className={fieldClass}
              placeholder="smtp.gmail.com"
              disabled={useGmail}
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">포트</label>
            <input
              type="number"
              value={form.port}
              onChange={(e) => {
                updateField("port", e.target.value);
                setUseGmail(false);
              }}
              className={fieldClass}
              disabled={useGmail}
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">사용자명</label>
            <input
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              className={fieldClass}
              autoComplete="off"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              비밀번호 {initial.hasPassword ? "(저장된 값 유지, 변경 시에만 입력)" : ""}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={fieldClass}
              autoComplete="new-password"
              placeholder={initial.hasPassword ? "••••••••" : ""}
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">발신 메일</label>
            <input
              type="email"
              value={form.fromEmail}
              onChange={(e) => updateField("fromEmail", e.target.value)}
              className={fieldClass}
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">발신 이름</label>
            <input
              value={form.fromName}
              onChange={(e) => updateField("fromName", e.target.value)}
              className={fieldClass}
              placeholder="첸나이한인회"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Reply-To</label>
            <input
              type="email"
              value={form.replyTo}
              onChange={(e) => updateField("replyTo", e.target.value)}
              className={fieldClass}
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">공개 문의 메일</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              className={fieldClass}
              suppressHydrationWarning
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.secure}
            disabled={useGmail}
            onChange={(e) => {
              updateField("secure", e.target.checked);
              setUseGmail(false);
            }}
            suppressHydrationWarning
          />
          SSL/TLS 사용 (보통 465 포트)
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : "설정 저장"}
          </Button>
        </div>
      </form>

      <div className="mt-6 max-w-3xl space-y-3 border border-border bg-white p-5">
        <h2 className="text-sm font-semibold">테스트 발송</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            className={fieldClass}
            placeholder="수신 테스트 메일"
            suppressHydrationWarning
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleTest}
            className="shrink-0 whitespace-nowrap"
          >
            테스트 메일 보내기
          </Button>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        접수된 문의는{" "}
        <Link href="/admin/inquiries" className="text-foreground underline hover:text-brand">
          문의 내역
        </Link>
        에서 확인할 수 있습니다.
      </p>
    </>
  );
}
