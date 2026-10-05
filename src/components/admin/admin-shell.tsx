"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { isAdminSession } from "@/lib/session-kind";

const sections = [
  {
    title: "대시보드",
    tone: "text-brand",
    items: [
      { href: "/admin", label: "개요" },
      { href: "/admin/analytics", label: "유입 분석" },
    ],
  },
  {
    title: "콘텐츠",
    tone: "text-chennai-teal",
    items: [
      { href: "/admin/hero", label: "히어로 슬라이드" },
      { href: "/admin/gallery", label: "갤러리" },
      { href: "/admin/gallery/categories", label: "갤러리 카테고리" },
      { href: "/admin/magazine", label: "한인회보" },
      { href: "/admin/news", label: "뉴스" },
      { href: "/admin/events", label: "이벤트" },
      { href: "/admin/guides", label: "생활 가이드" },
      { href: "/admin/guides/categories", label: "가이드 카테고리" },
      { href: "/admin/about", label: "한인회 소개" },
      { href: "/admin/banners", label: "배너" },
    ],
  },
  {
    title: "커뮤니티",
    tone: "text-brand-light",
    items: [
      { href: "/admin/boards", label: "커뮤니티 카테고리" },
      { href: "/admin/posts", label: "게시글" },
      { href: "/admin/clubs", label: "동호회 카테고리" },
      { href: "/admin/reports", label: "신고" },
      { href: "/admin/users", label: "회원" },
    ],
  },
  {
    title: "운영",
    tone: "text-brand-dark",
    items: [
      { href: "/admin/donations", label: "후원 내역" },
      { href: "/admin/checkin", label: "QR 체크인" },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const adminSession = isAdminSession(session);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="flex h-12 items-center justify-between px-4 md:px-6">
          <span className="text-sm font-medium">ICKOA 관리자</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              사이트 보기
            </Link>
            {adminSession && (
              <>
                <span className="hidden text-muted-foreground md:inline">{session!.user.name}</span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="text-muted-foreground hover:text-foreground"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <aside className="hidden w-44 shrink-0 border-r border-border md:block">
          <nav className="space-y-6 p-4">
            {sections.map((section) => (
              <div key={section.title}>
                <p
                  className={cn(
                    "mb-2 border-b border-border/60 pb-1.5 text-[11px] font-semibold uppercase tracking-wide",
                    section.tone,
                  )}
                >
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-brand/10 font-medium text-brand"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <nav className="flex gap-4 overflow-x-auto border-b border-border px-4 py-2 text-sm md:hidden">
            {sections.flatMap((s) => s.items).map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full px-3 py-1 transition-colors",
                    active
                      ? "bg-brand/10 font-medium text-brand"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
