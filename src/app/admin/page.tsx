import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTodayVisitorCount } from "@/lib/analytics-data";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const [news, events, posts, magazines, heroSlides, donations, galleryAlbums, reports, visitorsToday] =
    await Promise.all([
      prisma.news.count(),
      prisma.event.count(),
      prisma.post.count(),
      prisma.magazineIssue.count(),
      prisma.heroSlide.count({ where: { active: true } }),
      prisma.donation.count({ where: { status: "paid" } }),
      prisma.galleryAlbum.count(),
      prisma.report.count({ where: { resolved: false } }),
      getTodayVisitorCount(),
    ]);

  const stats = [
    { label: "뉴스", value: news, href: "/admin/news" },
    { label: "이벤트", value: events, href: "/admin/events" },
    { label: "갤러리", value: galleryAlbums, href: "/admin/gallery" },
    { label: "한인회보", value: magazines, href: "/admin/magazine" },
    { label: "히어로 슬라이드", value: heroSlides, href: "/admin/hero" },
    { label: "게시글", value: posts, href: "/admin/posts" },
    { label: "후원", value: donations, href: "/admin/donations" },
  ];

  return (
    <div>
      <AdminPageHeader
        title="개요"
        subtitle={`${session?.user?.name ?? "관리자"} · 사이트 콘텐츠 관리`}
      />

      {reports > 0 && (
        <p className="mb-4 text-sm">
          <Link href="/admin/reports" className="text-red-600 underline">
            미처리 신고 {reports}건
          </Link>
        </p>
      )}

      <div className="mb-6 flex items-center justify-between border border-border px-4 py-3 text-sm">
        <div>
          <p className="font-medium">오늘 방문자</p>
          <p className="text-2xl font-semibold">{visitorsToday.toLocaleString()}명</p>
        </div>
        <Link href="/admin/analytics" className="text-brand hover:underline">
          유입 분석 보기
        </Link>
      </div>

      <ul className="divide-y divide-border border border-border">
        {stats.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
            >
              <span>{s.label}</span>
              <span className="text-muted-foreground">{s.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
