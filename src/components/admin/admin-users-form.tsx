"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Role } from "@prisma/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createAdminUser } from "@/actions/admin";

const ADMIN_ROLES: Role[] = ["CONTENT_ADMIN", "COMMUNITY_ADMIN", "EVENT_ADMIN"];
const ROLE_LABELS: Record<Role, string> = {
  MEMBER: "회원",
  SUPER_ADMIN: "Root 관리자",
  CONTENT_ADMIN: "콘텐츠 관리자",
  COMMUNITY_ADMIN: "커뮤니티 관리자",
  EVENT_ADMIN: "이벤트 관리자",
};

export function AdminUsersForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    loginId: "",
    name: "",
    password: "",
    role: "CONTENT_ADMIN" as Role,
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    startTransition(async () => {
      try {
        await createAdminUser(form);
        router.push("/admin/users");
        router.refresh();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "관리자 추가에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader title="관리자 등록" />
      <AdminBackLink href="/admin/users" />
      <form onSubmit={handleCreate} className="space-y-4 border border-border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">아이디</label>
            <input type="text" value={form.loginId} onChange={(e) => setForm({ ...form, loginId: e.target.value })} className="h-11 w-full border border-border bg-background px-4 text-sm" placeholder="admin01" required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">이름</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full border border-border bg-background px-4 text-sm" required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">비밀번호</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11 w-full border border-border bg-background px-4 text-sm" minLength={6} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">역할</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="h-11 w-full border border-border bg-background px-3 text-sm">
              {ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>{isPending ? "등록 중..." : "등록"}</Button>
          <Link href="/admin/users"><Button type="button" size="sm" variant="outline">취소</Button></Link>
        </div>
      </form>
    </>
  );
}
