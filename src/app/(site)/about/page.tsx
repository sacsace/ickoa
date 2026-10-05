import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "한인회 소개",
  description: "재인도 첸나이 한인회 연혁, 회장단, 정관, 활동 보고서",
  path: "/about",
});

const aboutPages = [
  { href: "/about/history", title: "연혁", description: "한인회의 역사와 발전 과정" },
  { href: "/about/leadership", title: "회장단", description: "현재 회장단 및 임원 소개" },
  { href: "/about/bylaws", title: "정관", description: "한인회 정관 및 운영 규정" },
  { href: "/about/reports", title: "활동 보고서", description: "연간 활동 보고서" },
  { href: "/about/finance", title: "재무 공개", description: "재정 운영 투명성 공개" },
  { href: "/about/sponsors", title: "후원사", description: "한인회 후원 기업 및 단체" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="재인도 첸나이 한인회"
        subtitle="Korean Association in Chennai"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="mb-12 rounded-2xl border border-border bg-card p-8">
          <p className="leading-relaxed text-muted-foreground">
            재인도 첸나이 한인회(Korean Association in Chennai)는 2000년 설립 이래,
            첸나이 및 남인도 지역 한인 교민들의 모임터이자 상호 협력의 중심으로 활동해 왔습니다.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">25+</p>
              <p className="text-xs text-muted-foreground">Years</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">280+</p>
              <p className="text-xs text-muted-foreground">Companies</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aboutPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="hover-lift rounded-2xl border border-border bg-card p-6 md:rounded-3xl"
            >
              <h2 className="font-bold text-foreground">{page.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{page.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
