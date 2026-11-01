import { PageHeader } from "@/components/ui/page-header";
import { LeadershipOrgChart } from "@/components/about/leadership-org-chart";
import { CiLogoGallery } from "@/components/about/ci-logo-gallery";
import { RegistrationDocsGallery } from "@/components/about/registration-docs-gallery";
import { RichHtmlBody } from "@/components/ui/rich-html-body";
import { createMetadata } from "@/lib/seo";
import { ensureAboutDefaults } from "@/lib/about-defaults";
import { prisma } from "@/lib/prisma";

const REGISTRATION_DOCS = [
  {
    key: "certificate",
    title: "Certificate of Registration of Societies",
    description:
      "Tamil Nadu Societies Registration Act, 1975 — SL. NO. 69 of 2014 (2014.02.24, Chennai South)",
    src: "/about/registration/certificate-of-registration.jpg",
    fileName: "kaic-certificate-of-registration.jpg",
    width: 766,
    height: 1024,
  },
  {
    key: "pan",
    title: "Permanent Account Number (PAN)",
    description: "KOREAN ASSOCIATION IN CHENNAI — AACAK3519K (발급일 2014.02.24)",
    src: "/about/registration/pan-card.jpg",
    fileName: "kaic-pan-card.jpg",
    width: 1024,
    height: 659,
  },
] as const;

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
    registration: "한인회 등록 문서",
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

  if (slug === "registration") {
    return (
      <>
        <PageHeader
          title="한인회 등록 문서"
          subtitle="Official registration documents — Korean Association in Chennai"
          backHref="/about"
        />
        <div className="mx-auto w-full max-w-[1356px] space-y-6 px-4 py-8 md:px-6 md:py-10">
          <section className="border border-border bg-card p-6 md:p-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              재인도 첸나이 한인회(Korean Association in Chennai)의 공식 등록·인가 문서입니다.
              이미지를 클릭하면 크게 볼 수 있습니다.
            </p>
            <div className="mt-6">
              <RegistrationDocsGallery docs={[...REGISTRATION_DOCS]} />
            </div>
          </section>
        </div>
      </>
    );
  }

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
                    <RichHtmlBody
                      content={doc.content}
                      className="text-[15px] leading-[1.85] md:text-base"
                    />
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
                          <div className="mt-2">
                            <RichHtmlBody
                              content={entry.description}
                              className="text-sm leading-relaxed text-muted-foreground [&_p]:mb-1"
                            />
                          </div>
                        ) : null}
                        {entry.image ? (
                          <div className="mt-4 overflow-hidden border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.image}
                              alt={entry.title}
                              className="max-h-72 w-full object-cover"
                            />
                          </div>
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
    const logoVariants = [
      {
        key: "circle",
        title: "원형 로고",
        description: "심볼 + 국·영문 원형 시그니처. 대표 사용 형태입니다.",
        src: "/ci/logo-circle.png",
        fileName: "kaic-logo-circle.png",
        width: 1000,
        height: 1162,
      },
      {
        key: "circle-clear",
        title: "원형 로고 (클리어)",
        description: "여백이 정리된 원형 로고. 작은 크기·아이콘 영역에 적합합니다.",
        src: "/ci/logo-circle-clear.png",
        fileName: "kaic-logo-circle-clear.png",
        width: 733,
        height: 728,
      },
      {
        key: "horizontal",
        title: "가로형 로고",
        description: "심볼과 워드마크를 가로로 배치한 조합형입니다.",
        src: "/ci/logo-horizontal.png",
        fileName: "kaic-logo-horizontal.png",
        width: 2400,
        height: 680,
        wide: true as const,
      },
    ] as const;

    const sloganVariants = [
      {
        key: "slogan",
        title: "표어 서체",
        description: "첸나이 한인들의 열린공간 — 공식 캘리그래피 표어입니다.",
        src: "/ci/slogan.png",
        fileName: "kaic-slogan.png",
        width: 984,
        height: 131,
        wide: true as const,
      },
    ] as const;

    return (
      <>
        <PageHeader
          title="CI"
          subtitle="Corporate Identity — 첸나이한인회 브랜드 가이드"
          backHref="/about"
        />
        <div className="mx-auto w-full max-w-[1356px] space-y-8 px-4 py-8 md:px-6 md:py-10">
          <section className="border border-border bg-card p-6 md:p-8">
            <h2 className="text-base font-bold">로고 3형태</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              재인도 첸나이 한인회(KAIC)의 공식 로고입니다. 행사 자료, 인쇄물, 디지털
              콘텐츠에 사용할 수 있으며, 아래에서 배경이 투명한 PNG 파일을 내려받을 수
              있습니다.
            </p>
            <CiLogoGallery logos={[...logoVariants]} />
          </section>

          <section className="border border-border bg-card p-6 md:p-8">
            <h2 className="text-base font-bold">표어</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              공식 표어 서체입니다. 클릭하면 크게 볼 수 있고, 투명 PNG로 내려받을 수
              있습니다.
            </p>
            <CiLogoGallery logos={[...sloganVariants]} />
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
                <dd className="mt-1 font-semibold">첸나이 한인들의 열린공간</dd>
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
              <li>공식 문서·행사 현수막·명함에는 원형 로고 사용을 권장합니다.</li>
              <li>웹·명함 가로 배너 등에는 가로형 로고를 사용할 수 있습니다.</li>
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
