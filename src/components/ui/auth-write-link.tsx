"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { isSiteSession } from "@/lib/session-kind";
import { cn } from "@/lib/utils";

type AuthWriteLinkProps = {
  href: string;
  label: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost";
};

/** 가입(사이트 로그인) 상태에서만 등록/글쓰기 페이지로 이동 */
export function AuthWriteLink({
  href,
  label,
  className,
  size = "sm",
  variant = "primary",
}: AuthWriteLinkProps) {
  const { data: session, status } = useSession();
  const allowed = isSiteSession(session);
  const target = allowed
    ? href
    : `/login?callbackUrl=${encodeURIComponent(href)}`;

  return (
    <Link href={target} className={cn(className)}>
      <Button type="button" size={size} variant={variant} disabled={status === "loading"}>
        {label}
      </Button>
    </Link>
  );
}
