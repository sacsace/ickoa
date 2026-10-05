import { PageHeader } from "@/components/ui/page-header";
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
  };
  if (titles[slug]) {
    return createMetadata({
      title: titles[slug],
      description: `${titles[slug]} — 재인도 첸나이 한인회(ICKOA)`,
      path: `/about/${slug}`,
    });
  }
  const page = STATIC[slug];
  if (!page) {
    return createMetadata({ title: "한인회 소개", path: "/about" });
  }
  return createMetadata({
    title: page.title,
    description: `${page.title} — 재인도 첸나이 한인회(ICKOA)`,
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
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return (
      <>
        <PageHeader title="회장단" backHref="/about" />
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
          {members.length === 0 ? (
            <p className="text-muted-foreground">등록된 회장단이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-border border border-border">
              {members.map((m) => (
                <li key={m.id} className="flex items-start gap-4 px-4 py-4">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                      {m.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-brand">{m.role}</p>
                    <p className="mt-0.5 font-bold">
                      {m.name}
                      {m.nameEn ? (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {m.nameEn}
                        </span>
                      ) : null}
                    </p>
                    {m.bio ? (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {m.bio}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
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
