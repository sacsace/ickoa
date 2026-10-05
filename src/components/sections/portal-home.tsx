"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Camera,
  Calendar,
  MessageSquare,
  Users,
  Compass,
  Newspaper,
  Building2,
  HeartHandshake,
  Info,
} from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { PortalBox } from "@/components/ui/portal-box";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/sections/hero-slider";
import type { HeroSlideData } from "@/data/hero";
import type { GalleryAlbum } from "@/data/gallery";
import type { MagazineIssue } from "@/data/dynamic-korean";

type NewsItem = {
  id: string;
  title: string;
  category: string;
  region: string;
  image: string | null;
  createdAt: Date;
};

type EventItem = {
  id: string;
  title: string;
  date: Date;
  location: string;
  image: string | null;
  maxAttendees: number;
  _count: { registrations: number };
};

type Board = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  _count: { posts: number };
};

type Club = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  _count: { members: number };
};

type Guide = {
  id: string;
  category: string;
  region: string;
  title: string;
};

const shortcuts = [
  { href: "/news", label: "뉴스", icon: Newspaper },
  { href: "/events", label: "이벤트", icon: Calendar },
  { href: "/community", label: "커뮤니티", icon: MessageSquare },
  { href: "/magazine", label: "한인회보", icon: BookOpen },
  { href: "/gallery", label: "갤러리", icon: Camera },
  { href: "/clubs", label: "동호회", icon: Users },
  { href: "/guide", label: "생활가이드", icon: Compass },
  { href: "/business", label: "기업", icon: Building2 },
  { href: "/about", label: "한인회소개", icon: Info },
  { href: "/donate", label: "후원하기", icon: HeartHandshake },
] as const;

export function PortalHome({
  news,
  events,
  boards,
  clubs,
  guides,
  magazine,
  heroSlides,
  galleryAlbums,
}: {
  news: NewsItem[];
  events: EventItem[];
  boards: Board[];
  clubs: Club[];
  guides: Guide[];
  magazine: MagazineIssue | null;
  heroSlides: HeroSlideData[];
  galleryAlbums: GalleryAlbum[];
}) {
  const { t, locale } = useLocale();
  const isKo = locale === "ko";
  const leadNews = news[0];
  const sideNews = news.slice(1, 6);
  const upcoming = events.slice(0, 5);
  const album = galleryAlbums[0];

  return (
    <div className="bg-background pb-10 pt-4 md:pt-5">
      <div className="mx-auto max-w-[1356px] space-y-4 px-4">
        {/* Top: banner + shortcuts — matched box height */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="portal-box overflow-hidden">
            <div className="relative h-[240px] w-full overflow-hidden sm:h-[288px] lg:h-[408px]">
              {heroSlides.length > 0 ? (
                <HeroSlider slides={heroSlides} variant="portal" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-dark" />
              )}

              {/* Compact caption strip — keeps most of the image visible */}
              <div className="absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-3 pt-12 md:px-5 md:pb-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0 max-w-xl">
                    <p className="text-[11px] font-semibold tracking-wide text-white/70">
                      ICKOA · Chennai
                    </p>
                    <h1 className="mt-1 truncate text-lg font-bold tracking-tight text-white md:text-xl">
                      {t.hero.title}
                    </h1>
                    <p className="mt-1 line-clamp-1 text-[12px] text-white/85 md:text-[13px]">
                      {t.hero.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href="/register">
                      <Button size="sm">
                        {t.hero.ctaJoin}
                      </Button>
                    </Link>
                    <Link href="/community" className="hidden sm:block">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      >
                        {t.hero.ctaCommunity}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <PortalBox
            title={isKo ? "바로가기" : "Shortcuts"}
            bodyClassName="overflow-hidden p-1.5"
            className="lg:h-[408px]"
          >
            <div className="grid h-full grid-cols-5 gap-0.5 lg:grid-cols-2 lg:grid-rows-5">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="portal-shortcut">
                    <span className="portal-shortcut-icon">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </PortalBox>
        </div>

        {/* News + Events */}
        <div className="grid gap-4 lg:grid-cols-2">
          <PortalBox title={t.news.title} href="/news">
            {leadNews && (
              <Link
                href={`/news/${leadNews.id}`}
                className="group flex gap-3 border-b border-border p-3 hover:bg-muted"
              >
                {leadNews.image && (
                  <div className="relative h-[84px] w-[120px] shrink-0 overflow-hidden bg-muted">
                    <Image
                      src={leadNews.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-brand">
                    {leadNews.category}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug group-hover:text-brand">
                    {leadNews.title}
                  </h3>
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    {leadNews.createdAt.toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </Link>
            )}
            <ul>
              {sideNews.map((item) => (
                <li key={item.id}>
                  <Link href={`/news/${item.id}`} className="portal-list-item">
                    <span className="line-clamp-1 flex-1 text-[13px] font-medium group-hover:text-brand">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {item.createdAt.toLocaleDateString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
              {news.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                  등록된 뉴스가 없습니다.
                </li>
              )}
            </ul>
          </PortalBox>

          <PortalBox title={t.events.title} href="/events">
            <ul>
              {upcoming.map((event) => (
                <li key={event.id}>
                  <Link href={`/events/${event.id}`} className="portal-list-item">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[3px] bg-accent text-brand">
                      <span className="text-[10px] font-semibold leading-none">
                        {event.date.toLocaleDateString("ko-KR", { month: "short" })}
                      </span>
                      <span className="text-base font-bold leading-none">
                        {event.date.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[13px] font-bold">{event.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {event._count.registrations}/{event.maxAttendees}
                    </span>
                  </Link>
                </li>
              ))}
              {upcoming.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                  예정된 행사가 없습니다.
                </li>
              )}
            </ul>
          </PortalBox>
        </div>

        {/* Magazine + Gallery */}
        <div className="grid gap-4 md:grid-cols-2">
          <PortalBox title={isKo ? "다이나믹 코리안" : "Dynamic Korean"} href="/magazine">
            {magazine ? (
              <Link
                href={`/magazine/${magazine.id}`}
                className="flex gap-4 p-4 hover:bg-muted"
              >
                <div className="relative h-[140px] w-[100px] shrink-0 overflow-hidden border border-border bg-muted">
                  <Image
                    src={magazine.coverImage}
                    alt={magazine.title}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
                <div className="min-w-0 py-1">
                  <p className="text-[11px] font-semibold text-brand">
                    VOL.{magazine.volume} · {magazine.publishedAt}
                  </p>
                  <h3 className="mt-2 text-[16px] font-bold leading-snug">
                    {magazine.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[13px] text-muted-foreground">
                    {magazine.subtitle}
                  </p>
                  <span className="mt-3 inline-block text-[12px] font-semibold text-brand">
                    {isKo ? "회보 보기" : "Read issue"}
                  </span>
                </div>
              </Link>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                등록된 회보가 없습니다.
              </p>
            )}
          </PortalBox>

          <PortalBox title={t.gallery.title} href="/gallery">
            {album ? (
              <Link href={`/gallery/${album.id}`} className="block p-3 hover:bg-muted">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <Image
                    src={album.cover}
                    alt={locale === "ko" ? album.title : album.titleEn}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 px-1">
                  <p className="truncate text-[14px] font-bold">
                    {locale === "ko" ? album.title : album.titleEn}
                  </p>
                  <span className="shrink-0 text-[12px] text-muted-foreground">
                    {album.photos.length}장
                  </span>
                </div>
              </Link>
            ) : (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                등록된 앨범이 없습니다.
              </p>
            )}
            {galleryAlbums.length > 1 && (
              <div className="grid grid-cols-4 gap-2 border-t border-border p-3">
                {galleryAlbums.slice(1, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/gallery/${item.id}`}
                    className="relative aspect-square overflow-hidden bg-muted"
                  >
                    <Image
                      src={item.cover}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>
                ))}
              </div>
            )}
          </PortalBox>
        </div>

        {/* Community + Clubs + Guide */}
        <div className="grid gap-4 lg:grid-cols-3">
          <PortalBox title={t.community.title} href="/community">
            <ul>
              {boards.map((board) => (
                <li key={board.id}>
                  <Link href={`/community/${board.slug}`} className="portal-list-item">
                    <span className="flex-1 text-[13px] font-medium">{board.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {board._count.posts}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </PortalBox>

          <PortalBox title={t.clubs.title} href="/clubs">
            <ul>
              {clubs.slice(0, 8).map((club) => (
                <li key={club.id}>
                  <Link href={`/clubs/${club.slug}`} className="portal-list-item">
                    <span className="flex-1 text-[13px] font-medium">{club.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {club._count.members}명
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </PortalBox>

          <PortalBox title={t.guide.title} href="/guide">
            <ul>
              {guides.slice(0, 8).map((guide) => (
                <li key={guide.id}>
                  <Link href={`/guide/${guide.id}`} className="portal-list-item">
                    <span className="line-clamp-1 flex-1 text-[13px] font-medium">
                      {guide.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {guide.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </PortalBox>
        </div>

        {/* About strip */}
        <PortalBox title={t.about.title} href="/about">
          <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
            <div className="border-b border-border p-4 md:border-b-0 md:border-r">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                1980년대부터 첸나이에 모인 한인 가족들. 한인회는 문화 행사, 동호회,
                신규 주재원 환영까지 — 낯선 땅에서 서로의 이웃이 되어 왔습니다.
              </p>
              <div className="mt-4 flex gap-6 text-[13px]">
                <div>
                  <p className="text-muted-foreground">역사</p>
                  <p className="font-bold text-brand">40+년</p>
                </div>
                <div>
                  <p className="text-muted-foreground">교민</p>
                  <p className="font-bold text-brand">2,500+</p>
                </div>
                <div>
                  <p className="text-muted-foreground">동호회</p>
                  <p className="font-bold text-brand">12</p>
                </div>
              </div>
            </div>
            <ul>
              {[
                { href: "/about/history", label: t.about.history },
                { href: "/about/leadership", label: t.about.leadership },
                { href: "/about/bylaws", label: t.about.bylaws },
                { href: "/about/reports", label: t.about.reports },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="portal-list-item">
                    <span className="flex-1 text-[13px] font-medium">{item.label}</span>
                    <span className="text-[12px] text-muted-foreground">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </PortalBox>
      </div>
    </div>
  );
}
