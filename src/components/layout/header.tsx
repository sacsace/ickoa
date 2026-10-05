"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Globe, ChevronDown, Search } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "@/components/providers/locale-provider";
import { LogoWithText } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isSiteSession } from "@/lib/session-kind";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  mainNavigation,
  getNavLabel,
  getNavChildLabel,
} from "@/data/navigation";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { locale, setLocale, t } = useLocale();
  const { data: session } = useSession();
  const siteSession = isSiteSession(session);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  return (
    <header
      className="site-header-bar sticky top-0 z-50"
      onMouseLeave={() => setMegaOpen(false)}
    >
      {/* Utility bar */}
      <div className="hidden border-b border-border bg-[#fafafa] md:block">
        <div className="mx-auto flex h-8 max-w-[1356px] items-center justify-end gap-3 px-4 text-[12px] text-muted-foreground">
          <button
            onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
            className="inline-flex items-center gap-1 hover:text-brand"
          >
            <Globe className="h-3 w-3" />
            {locale === "ko" ? "EN" : "KO"}
          </button>
          {!siteSession ? (
            <>
              <Link href="/login" className="hover:text-brand">
                {t.nav.login}
              </Link>
              <Link href="/register" className="hover:text-brand">
                {t.nav.join}
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hover:text-brand"
            >
              {t.nav.logout}
            </button>
          )}
          <Link href="/donate" className="hover:text-brand">
            {t.nav.donate}
          </Link>
          <Link href="/admin/login" className="hover:text-brand">
            {t.nav.adminPage}
          </Link>
        </div>
      </div>

      {/* Brand + search */}
      <div className="mx-auto flex h-[72px] max-w-[1356px] items-center gap-3 px-4">
        <div className="shrink-0">
          <LogoWithText />
        </div>

        <div className="flex-1" />

        <form
          action="/news"
          className="hidden w-full max-w-[360px] shrink-0 md:flex"
          role="search"
        >
          <div className="flex w-full overflow-hidden rounded-[3px] border border-border bg-white focus-within:border-brand">
            <input
              name="q"
              type="search"
              placeholder="뉴스, 행사, 생활정보 검색"
              className="h-11 w-full bg-transparent px-3 text-sm outline-none"
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="flex h-11 w-12 items-center justify-center bg-brand text-white hover:bg-brand-dark"
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
            className="flex h-9 w-9 items-center justify-center text-muted-foreground"
            aria-label="Toggle language"
          >
            <Globe className="h-3 w-3" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center text-foreground"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* GNB */}
      <div className="hidden border-t border-border lg:block">
        <nav className="mx-auto flex h-11 max-w-[1356px] items-center gap-0.5 px-2">
          {mainNavigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn("site-nav-link", active && "is-active")}
                onMouseEnter={() => setMegaOpen(true)}
              >
                {getNavLabel(item, locale)}
              </Link>
            );
          })}

          {siteSession ? (
            <div
              className="ml-auto flex shrink-0 items-center gap-2 pr-2"
              onMouseEnter={() => setMegaOpen(false)}
            >
              <Link
                href="/account"
                className="flex items-center gap-2 text-[12px] font-medium text-foreground hover:text-brand"
                title="내 정보 수정"
              >
                <span className="max-w-[140px] truncate">
                  {session!.user.name ?? "회원"}
                </span>
                <UserAvatar src={session!.user.image} name={session!.user.name} />
              </Link>
            </div>
          ) : null}
        </nav>
      </div>

      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="site-header-panel absolute inset-x-0 top-full hidden border-b lg:block"
            onMouseEnter={() => setMegaOpen(true)}
          >
            <div className="mx-auto grid max-w-[1356px] grid-cols-4 gap-6 px-4 py-6 xl:grid-cols-8">
              {mainNavigation.map((item) => (
                <div key={item.key}>
                  <Link
                    href={item.href}
                    className="text-sm font-bold hover:text-brand"
                    onClick={() => setMegaOpen(false)}
                  >
                    {getNavLabel(item, locale)}
                  </Link>
                  <ul className="mt-2 space-y-1.5">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          className="block text-[13px] text-muted-foreground hover:text-brand"
                          onClick={() => setMegaOpen(false)}
                        >
                          {getNavChildLabel(child, locale)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-white lg:hidden"
          >
            <nav className="max-h-[calc(100svh-8rem)] overflow-y-auto px-4 py-3">
              {mainNavigation.map((item) => {
                const expanded = mobileExpanded === item.key;
                return (
                  <div key={item.key} className="border-b border-border last:border-0">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 py-3 text-sm font-bold"
                      >
                        {getNavLabel(item, locale)}
                      </Link>
                      {item.children.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setMobileExpanded(expanded ? null : item.key)
                          }
                          className="flex h-10 w-10 items-center justify-center text-muted-foreground"
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expanded && "rotate-180",
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {expanded && (
                      <ul className="space-y-1 pb-3 pl-2">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="block px-2 py-2 text-[13px] text-muted-foreground"
                            >
                              {getNavChildLabel(child, locale)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
              <div className="mt-3 grid grid-cols-2 gap-2 pb-2">
                <Link href="/donate" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t.nav.donate}
                  </Button>
                </Link>
                {siteSession ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    {t.nav.logout}
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">{t.nav.login}</Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
