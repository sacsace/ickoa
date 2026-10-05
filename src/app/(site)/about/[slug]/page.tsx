import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { LeadershipOrgChart } from "@/components/about/leadership-org-chart";
import { createMetadata } from "@/lib/seo";
import { ensureAboutDefaults } from "@/lib/about-defaults";
import { prisma } from "@/lib/prisma";

const STATIC: Record<string, { title: string; body: string }> = {
  finance: {
    title: "재무 공개",
    body: "2025년도 재정 현황\n수입: 회비, 후원금, 행사 수입\n지출: 행사비, 운영비, 복지 지원\n상세 재무제표는 사무국 문의",
  },
  sponsors: {
    title: "후원사",
    body: "Hyundai Motor India\nLG Electronics India\nSamsung SDS India\nKorean Hospital Chennai\nKorea International School",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const titles: Record<string, string> = {
    bylaws: "정관",
    history: "연혁",
    leadership: "회장단",
    ci: "CI",
  };
  if (titles[slug]) {
    return createMetadata({
      title: titles[slug],
      description: `${titles[slug]} — 재인도 첸나이 한인회(KAIC)`,
      path: `/about/${slug}`,
    });
  }
  const page = STATIC[slug];
  if (!page) {
    return createMetadata({ title: "한인회 소개", path: "/about" });
  }
  return createMetadata({
    title: page.title,
    description: `${page.title} — 재인도 첸나이 한인회(KAIC)`,
    path: `/about/${slug}`,
  });
}

export default async function AboutSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await ensureAboutDefaults();

  if (slug === "bylaws") {
    const docs = await prisma.aboutDocument.findMany({
      where: { kind: "bylaws", published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return (
      <>
        <PageHeader title="정관" backHref="/about" />
        <div className="mx-auto w-full max-w-[1356px] px-4 py-8 md:px-6 md:py-10">
          {docs.length === 0 ? (
            <p className="text-muted-foreground">등록된 정관이 없습니다.</p>
          ) : (
            <div className="divide-y divide-border border border-border bg-card">
              {docs.map((doc) => (
                <details key={doc.id} className="group open:bg-muted/10" open={docs.length === 1}>
                  <summary className="cursor-pointer list-none px-5 py-4 text-base font-bold hover:bg-muted/30 md:px-8 [&::-webkit-details-marker]:hidden">
                    {doc.title}
                  </summary>
                  <div className="border-t border-border px-5 py-6 md:px-8 md:py-8">
                    <div className="whitespace-pre-wrap text-[15px] leading-[1.85] text-foreground md:text-base">
                      {doc.content}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  if (slug === "history") {
    const entries = await prisma.historyEntry.findMany({
      orderBy: [{ order: "asc" }, { year: "asc" }],
    });
    return (
      <>
        <PageHeader title="연혁" backHref="/about" />
        <div className="mx-auto w-full max-w-[1356px] px-4 py-8 md:px-6 md:py-10">
          {entries.length === 0 ? (
            <p className="text-muted-foreground">등록된 연혁이 없습니다.</p>
          ) : (
            <ol className="relative">
              {entries.map((entry, index) => {
                const isLast = index === entries.length - 1;
                return (
                  <li
                    key={entry.id}
                    className="relative grid gap-3 pb-8 last:pb-0 md:grid-cols-[minmax(280px,max-content)_minmax(0,1fr)] md:gap-8 md:pb-10"
                  >
                    <div className="md:pt-1 md:text-right">
                      <p className="whitespace-nowrap text-sm font-bold leading-snug text-brand md:text-[15px]">
                        {entry.year}
                      </p>
                    </div>

                    <div className="relative pl-7 md:pl-10">
                      <span
                        className="absolute left-0 top-2 z-10 h-3 w-3 rounded-full border-2 border-brand bg-background md:left-3"
                        aria-hidden
                      />
                      {!isLast ? (
                        <span
                          className="absolute left-[5px] top-5 bottom-[-32px] w-px bg-border md:left-[17px] md:bottom-[-40px]"
                          aria-hidden
                        />
                      ) : null}
                      <div className="border border-border bg-card px-5 py-5 md:px-7 md:py-6">
                        <p className="text-base font-semibold leading-snug">{entry.title}</p>
                        {entry.description ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {entry.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </>
    );
  }

  if (slug === "leadership") {
    const members = await prisma.leadershipMember.findMany({
      where: { published: true },
      orderBy: [{ level: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    return (
      <>
        <PageHeader title="회장단" backHref="/about" />
        <div className="mx-auto w-full max-w-[1356px] px-4 py-8 md:px-6 md:py-10">
          {members.length === 0 ? (
            <p className="text-muted-foreground">등록된 회장단이 없습니다.</p>
          ) : (
            <LeadershipOrgChart members={members} />
          )}
        </div>
      </>
    );
  }

  if (slug === "ci") {
    return (
      <>
        <PageHeader
          title="CI"
          subtitle="Corporate Identity — 첸나이한인회 브랜드 가이드"
          backHref="/about"
        />
        <div className="mx-auto w-full max-w-[1356px] space-y-8 px-4 py-8 md:px-6 md:py-10">
          <section className="border border-border bg-card p-6 md:p-8">
            <h2 className="text-base font-bold">로고</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              재인도 첸나이 한인회(KAIC)의 공식 로고입니다. 행사 자료, 인쇄물, 디지털
              콘텐츠에 사용할 수 있습니다.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center border border-border bg-white px-6 py-10">
                <Image src="/logo.png" alt="KAIC 로고" width={220} height={72} className="h-16 w-auto object-contain" />
                <p className="mt-4 text-xs text-muted-foreground">기본 로고 (밝은 배경)</p>
              </div>
              <div className="flex flex-col items-center justify-center border border-border bg-[#0b1f3a] px-6 py-10">
                <Image src="/logo-dark.png" alt="KAIC 다크 로고" width={220} height={72} className="h-16 w-auto object-contain" />
                <p className="mt-4 text-xs text-white/70">다크 로고 (어두운 배경)</p>
              </div>
            </div>
          </section>

          <section className="border border-border bg-card p-6 md:p-8">
            <h2 className="text-base font-bold">브랜드 명칭</h2>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div className="border border-border px-4 py-3">
                <dt className="text-xs text-muted-foreground">국문</dt>
                <dd className="mt-1 font-semibold">첸나이한인회 / 재인도 첸나이 한인회</dd>
              </div>
              <div className="border border-border px-4 py-3">
                <dt className="text-xs text-muted-foreground">영문</dt>
                <dd className="mt-1 font-semibold">Korean Association in Chennai (KAIC)</dd>
              </div>
              <div className="border border-border px-4 py-3">
                <dt className="text-xs text-muted-foreground">표어</dt>
                <dd className="mt-1 font-semibold">우리들의 열린 공간</dd>
              </div>
              <div className="border border-border px-4 py-3">
                <dt className="text-xs text-muted-foreground">영문 표어</dt>
                <dd className="mt-1 font-semibold">Our Open Space</dd>
              </div>
            </dl>
          </section>

          <section className="border border-border bg-card p-6 md:p-8">
            <h2 className="text-base font-bold">사용 안내</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>로고 비율을 임의로 늘리거나 줄이지 말아 주세요.</li>
              <li>로고 색상을 변경하거나 효과를 추가하지 말아 주세요.</li>
              <li>공식 문서·행사 현수막·명함에는 기본 로고 사용을 권장합니다.</li>
              <li>문의: edit@ickoa.org</li>
            </ul>
          </section>
        </div>
      </>
    );
  }

  const page = STATIC[slug];
  if (!page) {
    return (
      <>
        <PageHeader title="페이지를 찾을 수 없습니다" backHref="/about" />
      </>
    );
  }

  return (
    <>
      <PageHeader title={page.title} backHref="/about" />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <p className="whitespace-pre-wrap leading-relaxed text-foreground">{page.body}</p>
      </div>
    </>
  );
}
