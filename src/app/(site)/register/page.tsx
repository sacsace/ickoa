"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <>
      <PageHeader
        title={"\ud68c\uc6d0\uac00\uc785"}
        subtitle={"\ud55c\uc778\ud68c \ucee4\ubba4\ub2c8\ud2f0 \ud68c\uc6d0 \ub4f1\ub85d"}
        backHref="/login"
      />
      <div className="mx-auto max-w-md px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{"\uc774\ub984"}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-brand/50"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-brand/50"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-brand/50"
              minLength={6}
              required
            />
          </div>
          {error && <p className="text-sm text-brand">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "\uac00\uc785 \uc911..." : "\uac00\uc785\ud558\uae30"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"\uc774\ubbf8 \uacc4\uc815\uc774 \uc788\uc73c\uc2e0\uac00\uc694? "}
          <Link href="/login" className="text-foreground underline hover:opacity-70">
            {"\ub85c\uadf8\uc778"}
          </Link>
        </p>
      </div>
    </>
  );
}
