"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { isSiteSession } from "@/lib/session-kind";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { data: session, status } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && isSiteSession(session)) {
      const next =
        callbackUrl?.startsWith("/") &&
        !callbackUrl.startsWith("/admin") &&
        callbackUrl !== "/login"
          ? callbackUrl
          : "/";
      router.replace(next);
    }
  }, [status, session, callbackUrl, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const value = identifier.trim();
    const isEmail = value.includes("@");

    const result = await signIn("credentials", {
      ...(isEmail ? { email: value } : { loginId: value }),
      password,
      portal: "site",
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("아이디/이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    const next =
      callbackUrl?.startsWith("/") &&
      !callbackUrl.startsWith("/admin") &&
      callbackUrl !== "/login"
        ? callbackUrl
        : "/";
    router.replace(next);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="로그인"
        subtitle="ICKOA 커뮤니티에 오신 것을 환영합니다"
      />
      <div className="mx-auto max-w-md px-4 py-12">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">아이디 또는 이메일</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-brand/50"
              placeholder="member@ickoa.org"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-brand/50"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-brand">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link href="/register" className="text-foreground underline hover:opacity-70">
            회원가입
          </Link>
        </p>
      </div>
    </>
  );
}
