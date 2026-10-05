import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ensureAboutDefaults } from "@/lib/about-defaults";

export const dynamic = "force-dynamic";

const links = [
  {
    href: "/admin/about/leadership",
    title: "회장단",
    description: "회장·임원을 등록·수정·삭제합니다.",
  },
  {
    href: "/admin/about/bylaws",
    title: "정관",
    description: "정관 조항을 등록·수정·삭제합니다.",
  },
  {
    href: "/admin/about/history",
    title: "연혁",
    description: "연도별 연혁을 등록·수정·삭제합니다.",
  },
  {
    href: "/admin/about/reports",
    title: "활동 보고서",
    description: "활동 보고서를 등록·수정·삭제합니다.",
  },
];

export default async function AdminAboutPage() {
  await ensureAboutDefaults();

  return (
    <>
      <AdminPageHeader
        title="한인회 소개 관리"
        subtitle="회장단 · 정관 · 연혁 · 활동 보고서"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border border-border p-4 transition-colors hover:border-brand hover:bg-muted/30"
          >
            <h2 className="text-sm font-bold">{link.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
