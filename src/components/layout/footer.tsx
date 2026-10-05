"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { LogoWithText } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="border-b border-border bg-accent">
        <div className="mx-auto flex max-w-[1356px] flex-col items-start justify-between gap-4 px-4 py-6 md:flex-row md:items-center">
          <div>
            <p className="text-base font-bold tracking-tight">{t.footer.ctaTitle}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{t.footer.ctaSubtitle}</p>
          </div>
          <Link href="/register">
            <Button size="md">{t.nav.join}</Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1356px] px-4 py-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <LogoWithText />
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              {t.footer.description}
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="mb-3 text-[13px] font-bold">{t.footer.quickLinks}</p>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li>
                <Link href="/magazine" className="hover:text-brand">
                  다이나믹 코리안
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-brand">
                  갤러리
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-brand">
                  커뮤니티
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-brand">
                  이벤트
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-brand">
                  생활가이드
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-brand">
                  {t.nav.donate}
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="mb-3 text-[13px] font-bold">{t.footer.contact}</p>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li>Chennai, Tamil Nadu, India</li>
              <li>edit@ickoa.org</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-border pt-6 text-[12px] text-muted-foreground md:flex-row md:items-center">
          <div className="space-y-1">
            <p>{t.footer.rights}</p>
            <p>
              Developed by{" "}
              <a
                href="https://www.msventures.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-brand"
              >
                Minsub Ventures Private Limited
              </a>
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
