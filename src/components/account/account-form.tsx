"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { updateSiteProfile } from "@/actions/account";

type AccountFormProps = {
  initial: {
    name: string;
    nameEn: string;
    email: string;
    loginId: string | null;
    phone: string;
    address: string;
    company: string;
    jobTitle: string;
    image: string | null;
  };
};

export function AccountForm({ initial }: AccountFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const avatarInputId = useId();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.image);
  const [form, setForm] = useState({
    name: initial.name,
    nameEn: initial.nameEn,
    email: initial.email,
    phone: initial.phone,
    address: initial.address,
    company: initial.company,
    jobTitle: initial.jobTitle,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("nameEn", form.nameEn);
    fd.set("email", form.email);
    fd.set("phone", form.phone);
    fd.set("address", form.address);
    fd.set("company", form.company);
    fd.set("jobTitle", form.jobTitle);
    fd.set("currentPassword", form.currentPassword);
    fd.set("newPassword", form.newPassword);
    if (avatarFile) fd.set("avatar", avatarFile);

    startTransition(async () => {
      try {
        const result = await updateSiteProfile(fd);
        await update({
          name: result.name ?? form.name.trim(),
          email: result.email ?? undefined,
          image: result.image ?? undefined,
        });
        setAvatarFile(null);
        if (avatarInputRef.current) avatarInputRef.current.value = "";
        if (result.image) setAvatarPreview(result.image);
        setForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setSuccess("회원 정보가 저장되었습니다.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold">기본 정보</h2>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <label className="mb-2 block text-xs text-muted-foreground">프로필 사진</label>
          <div className="flex items-center gap-4">
            <label
              htmlFor={avatarInputId}
              className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-brand text-2xl font-bold text-white"
              title="사진 변경"
            >
              <UserAvatar
                src={avatarPreview}
                name={form.name}
                size="lg"
                className="h-full w-full"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/45 py-1">
                <Camera className="h-3.5 w-3.5 text-white" />
              </span>
            </label>
            <div className="min-w-0 flex-1">
              <input
                ref={avatarInputRef}
                id={avatarInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                JPEG/PNG/WebP/GIF · 최대 5MB
              </p>
            </div>
          </div>
        </div>

        {initial.loginId ? (
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">아이디</label>
            <input
              value={`@${initial.loginId}`}
              disabled
              className="h-11 w-full border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">이름</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">영문 이름</label>
            <input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="Hong Gildong"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            placeholder="member@ickoa.org"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">전화번호</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            placeholder="+91-44-0000-0000"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">주소</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            placeholder="Chennai, Tamil Nadu"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">회사</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="Hyundai Motor India"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">직업</label>
            <input
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
              placeholder="Engineer"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <h2 className="text-sm font-bold">비밀번호 변경</h2>
        <p className="mt-1 text-xs text-muted-foreground">변경하지 않으려면 비워 두세요.</p>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">현재 비밀번호</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
            autoComplete="current-password"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">새 비밀번호</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">새 비밀번호 확인</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-brand"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-brand">{success}</p> : null}

        <div className="flex justify-end pt-1">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </form>
  );
}
