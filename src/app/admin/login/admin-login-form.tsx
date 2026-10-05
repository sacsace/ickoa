"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      loginId,
      password,
      portal: "admin",
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    const redirectTo =
      callbackUrl.startsWith("/admin") ? callbackUrl : "/admin";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="border border-border bg-card p-6">
      <h1 className="text-lg font-semibold">관리자 로그인</h1>
      <p className="mt-1 text-sm text-muted-foreground">ICKOA 사이트 관리</p>

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm">아이디</label>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
            placeholder="root"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="h-10 w-full bg-foreground text-sm text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          홈페이지로
        </Link>
      </p>
    </div>
  );
}
