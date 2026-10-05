"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader, SectionShell } from "@/components/ui/motion";
import { aboutLinks } from "@/data/mock";
import { heroBanners } from "@/data/gallery";

export function AboutSection() {
  const { t } = useLocale();

  return (
    <SectionShell id="about">
      <SectionHeader title={t.about.title} subtitle={t.about.subtitle} label={t.nav.about} />

      <div className="grid gap-8 lg:grid-cols-12">
        <FadeIn className="lg:col-span-7">
          <div className="overflow-hidden border border-border bg-card">
            <div className="relative aspect-[16/9]">
              <Image
                src={heroBanners[0]!.image}
                alt="KAIC community"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 58vw"
              />
            </div>
            <div className="p-6 md:p-8">
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                2000년부터 첸나이에 모인 한인 가족들. 한인회는 문화 행사, 동호회,
                신규 주재원 환영까지 — 낯선 땅에서 서로의 이웃이 되어 왔습니다.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
                <div>
                  <dt className="text-muted-foreground">역사</dt>
                  <dd className="mt-1 font-display text-xl font-semibold">25+년</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">교민</dt>
                  <dd className="mt-1 font-display text-xl font-semibold">5000+</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">동호회</dt>
                  <dd className="mt-1 font-display text-xl font-semibold">12</dd>
                </div>
              </dl>
            </div>
          </div>
        </FadeIn>

        <div className="border-t border-border lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-8">
          {aboutLinks.map((link, index) => {
            const label = t.about[link.id as keyof typeof t.about];
            return (
              <FadeIn key={link.id} delay={index * 0.04}>
                <Link
                  href={`/about/${link.id}`}
                  className="group flex items-center justify-between gap-3 border-b border-border py-4"
                >
                  <span className="font-display text-base font-semibold tracking-tight group-hover:text-brand md:text-lg">
                    {label}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand" />
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
