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
    items: [{ href: "/admin/businesses", label: "디렉토리" }],
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
        "block rounded-md py-1.5 text-sm transition-colors",
        nested ? "px-2 pl-4 text-[13px]" : "px-2",
        active
          ? "bg-brand/10 font-medium text-brand"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const adminSession = isAdminSession(session);
  const allHrefs = flattenNavItems(sections).map((item) => item.href);
  const activeHref = resolveActiveHref(pathname, allHrefs);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="flex h-12 items-center justify-between px-4 md:px-6">
          <span className="text-sm font-medium">KAIC 관리자</span>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              사이트 보기
            </Link>
            {adminSession && (
              <>
                <span className="hidden text-muted-foreground md:inline">
                  {session!.user.name}
                </span>
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
        <aside className="hidden w-52 shrink-0 border-r border-border md:block">
          <nav className="divide-y divide-border p-3">
            {sections.map((section) => (
              <div key={section.title} className="py-4 first:pt-1 last:pb-1">
                <p className="mb-2 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground/80">
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

        <div className="min-w-0 flex-1">
          <nav className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 text-sm md:hidden">
            {flattenNavItems(sections).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-3 py-1 transition-colors",
                  activeHref === item.href
                    ? "bg-brand/10 font-medium text-brand"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
