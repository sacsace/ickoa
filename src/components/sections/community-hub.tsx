"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader } from "@/components/ui/motion";
import { HERO_COMMUNITY_IMAGE } from "@/data/hero";
import { galleryAlbums } from "@/data/gallery";

type CommunityHubProps = {
  magazineCover?: string;
  magazineHref?: string;
  magazineLabel?: string;
};

export function CommunityHub({
  magazineCover = "/magazine/dynamic-korean-cover-vol17.png",
  magazineHref = "/magazine",
  magazineLabel,
}: CommunityHubProps) {
  const { t, locale } = useLocale();
  const isKo = locale === "ko";

  const destinations = [
    {
      href: magazineHref,
      title: magazineLabel ?? t.nav.magazine,
      desc: isKo ? "첸나이 교민이 만드는 한인회보" : "Our community magazine",
      image: magazineCover,
    },
    {
      href: "/gallery",
      title: t.nav.gallery,
      desc: isKo ? "행사와 일상의 기록" : "Moments from community life",
      image: HERO_COMMUNITY_IMAGE,
    },
    {
      href: "/events",
      title: t.nav.events,
      desc: isKo ? "다가오는 모임과 행사" : "Upcoming gatherings",
      image: galleryAlbums[1]?.cover ?? HERO_COMMUNITY_IMAGE,
    },
    {
      href: "/community",
      title: t.nav.community,
      desc: isKo ? "질문·정보·서로의 이야기" : "Talk with neighbors",
      image: galleryAlbums[0]?.cover ?? HERO_COMMUNITY_IMAGE,
    },
    {
      href: "/clubs",
      title: t.nav.clubs,
      desc: isKo ? "취미로 이어지는 사람들" : "Meet through hobbies",
      image: galleryAlbums[2]?.cover ?? HERO_COMMUNITY_IMAGE,
    },
    {
      href: "/guide",
      title: t.nav.guide,
      desc: isKo ? "정착과 생활에 필요한 정보" : "Settling-in essentials",
      image: galleryAlbums[0]?.cover ?? HERO_COMMUNITY_IMAGE,
    },
  ];

  const [featured, ...rest] = destinations;

  return (
    <section className="relative z-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <SectionHeader
          label={isKo ? "커뮤니티" : "Community"}
          title={t.hub.title}
          subtitle={t.hub.subtitle}
        />

        {featured && (
          <FadeIn>
            <Link
              href={featured.href}
              className="group grid overflow-hidden border border-border bg-card md:grid-cols-12"
            >
              <div className="relative aspect-[16/10] md:col-span-7 md:aspect-auto md:min-h-[340px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width:768px) 100vw, 58vw"
                />
              </div>
              <div className="flex flex-col justify-end p-6 md:col-span-5 md:p-10">
                <p className="text-xs font-medium tracking-[0.14em] text-brand uppercase">
                  Featured
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-snug md:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {featured.desc}
                </p>
                <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                  {isKo ? "열어보기" : "Open"}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </FadeIn>
        )}

        <div className="mt-2 border-t border-border">
          {rest.map((item, i) => (
            <FadeIn key={item.href} delay={0.04 * i}>
              <Link
                href={item.href}
                className="group grid grid-cols-[88px_1fr_auto] items-center gap-4 border-b border-border py-4 md:grid-cols-[112px_1fr_auto] md:gap-6 md:py-5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="112px"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold tracking-tight group-hover:text-brand md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
