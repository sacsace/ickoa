"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { isAdminSession } from "@/lib/session-kind";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "대시보드",
    items: [
      { href: "/admin", label: "개요" },
      { href: "/admin/analytics", label: "유입 분석" },
    ],
  },
  {
    title: "메인 화면",
    items: [
      { href: "/admin/hero", label: "히어로 슬라이드" },
      { href: "/admin/banners", label: "배너" },
    ],
  },
  {
    title: "갤러리",
    items: [
      {
        href: "/admin/gallery",
        label: "앨범",
        children: [{ href: "/admin/gallery/categories", label: "카테고리" }],
      },
    ],
  },
  {
    title: "소식·행사",
    items: [
      { href: "/admin/news", label: "뉴스" },
      { href: "/admin/events", label: "이벤트" },
      { href: "/admin/magazine", label: "한인회보" },
    ],
  },
  {
    title: "생활 가이드",
    items: [
      {
        href: "/admin/guides",
        label: "가이드",
        children: [{ href: "/admin/guides/categories", label: "카테고리" }],
      },
    ],
  },
  {
    title: "한인회",
    items: [{ href: "/admin/about", label: "소개 관리" }],
  },
  {
    title: "한인 기업",
    items: [
      {
        href: "/admin/businesses",
        label: "디렉토리",
        children: [{ href: "/admin/businesses/categories", label: "업종" }],
      },
    ],
  },
  {
    title: "커뮤니티",
    items: [
      { href: "/admin/posts", label: "게시글" },
      { href: "/admin/boards", label: "게시판 카테고리" },
      { href: "/admin/clubs", label: "동호회" },
      { href: "/admin/club-requests", label: "동호회 등록 요청" },
    ],
  },
  {
    title: "회원",
    items: [
      { href: "/admin/users", label: "회원 관리" },
      { href: "/admin/reports", label: "신고" },
    ],
  },
  {
    title: "운영",
    items: [
      { href: "/admin/donations", label: "후원 내역" },
      { href: "/admin/checkin", label: "QR 체크인" },
    ],
  },
];

function flattenNavItems(list: NavSection[]) {
  return list.flatMap((section) =>
    section.items.flatMap((item) => [
      { href: item.href, label: item.label },
      ...(item.children ?? []),
    ]),
  );
}

const FLAT_NAV_ITEMS = flattenNavItems(sections);
const FLAT_NAV_HREFS = FLAT_NAV_ITEMS.map((item) => item.href);

function isPathActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Prefer the longest matching href so parents don't stay active on child routes. */
function resolveActiveHref(pathname: string, hrefs: string[]) {
  return hrefs
    .filter((href) => isPathActive(pathname, href))
    .sort((a, b) => b.length - a.length)[0];
}

function NavLink({
  href,
  label,
  active,
  nested = false,
}: {
  href: string;
  label: string;
  active: boolean;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative block rounded-sm py-2 text-[13px] transition-colors",
        nested ? "pl-5 pr-2" : "px-2.5",
        active
          ? "bg-brand font-semibold text-white shadow-sm"
          : "font-medium text-[#2a3544] hover:bg-white hover:text-[#111827]",
      )}
    >
      {nested ? (
        <span
          className={cn(
            "absolute left-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full",
            active ? "bg-white/80" : "bg-border",
          )}
        />
      ) : null}
      {label}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const adminSession = isAdminSession(session);
  const activeHref = resolveActiveHref(pathname, FLAT_NAV_HREFS);

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <header
        className="z-20 shrink-0 border-b border-[#152536]"
        style={{ backgroundColor: "#1b2f44", color: "#ffffff" }}
      >
        <div className="flex h-12 items-center justify-between px-4 md:px-6">
          <span className="text-sm font-semibold tracking-tight text-white">
            KAIC 관리자
          </span>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d7e2ec] transition-colors hover:text-white"
            >
              사이트 보기
            </Link>
            {adminSession && (
              <>
                <span className="hidden text-[#d7e2ec] md:inline">
                  {session!.user.name}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="text-[#d7e2ec] transition-colors hover:text-white"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-border/80 bg-muted/40 md:block">
          <nav className="space-y-4 p-3">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-sm border border-border/70 bg-white/70 p-2 shadow-sm"
              >
                <p className="mb-1.5 px-1.5 text-[10px] font-bold tracking-[0.08em] text-[#5b6573]">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <div key={item.href}>
                      <NavLink
                        href={item.href}
                        label={item.label}
                        active={activeHref === item.href}
                      />
                      {item.children?.map((child) => (
                        <NavLink
                          key={child.href}
                          href={child.href}
                          label={child.label}
                          active={activeHref === child.href}
                          nested
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-100">
          <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-border bg-white px-4 py-2.5 text-sm md:hidden">
            {FLAT_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors",
                  activeHref === item.href
                    ? "bg-brand text-white"
                    : "bg-slate-50 text-foreground/80 ring-1 ring-border hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="rounded-sm border border-border/80 bg-white p-4 shadow-sm md:p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
