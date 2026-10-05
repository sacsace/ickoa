import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Download, ArrowLeft, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getMagazineIssue } from "@/lib/magazine-data";
import { magazineMeta } from "@/data/dynamic-korean";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, { ko: string; en: string }> = {
  association: { ko: "한인회", en: "Association" },
  community: { ko: "커뮤니티", en: "Community" },
  life: { ko: "생활", en: "Life" },
  business: { ko: "기업", en: "Business" },
  culture: { ko: "문화", en: "Culture" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const issue = await getMagazineIssue(issueId);
  if (!issue) {
    return createMetadata({ title: "다이나믹 코리안", path: "/magazine" });
  }
  return createMetadata({
    title: `Vol.${issue.volume} ${issue.title}`,
    description: issue.subtitle || issue.editorNote || "DYNAMIC KOREAN 한인회보",
    path: `/magazine/${issueId}`,
    image: issue.coverImage,
  });
}

export default async function MagazineIssuePage({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const issue = await getMagazineIssue(issueId);
  if (!issue) notFound();

  return (
    <>
      <PageHeader
        title={`DYNAMIC KOREAN · Vol.${issue.volume}`}
        subtitle={`${issue.subtitle} · ${issue.publishedAt}`}
        backHref="/magazine"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-start">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-xs shrink-0 overflow-hidden rounded-2xl shadow-lg md:mx-0">
            <Image
              src={issue.coverImage}
              alt={`Vol.${issue.volume} cover`}
              fill
              className="object-cover object-top"
              sizes="320px"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="tag-pill tag-pill-saffron">VOL.{issue.volume}</span>
              <span className="tag-pill tag-pill-teal">{issue.publishedAt}</span>
            </div>
            {issue.editorNote && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {issue.editorNote}
              </p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">{magazineMeta.address}</p>
            {issue.pdfUrl && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/magazine/${issueId}/read`}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
                >
                  <BookOpen className="h-4 w-4" />
                  웹에서 보기
                </Link>
                <a
                  href={issue.pdfUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  PDF 다운로드
                </a>
              </div>
            )}
          </div>
        </div>

        {issue.sections.length > 0 &&
          issue.sections.map((section) => (
            <section key={section.id} className="mb-14">
              <h2 className="font-display mb-6 border-b border-border pb-3 text-2xl font-bold">
                {section.label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.articles.map((article) => (
                  <article
                    key={article.id}
                    id={article.id}
                    className="community-card scroll-mt-28 overflow-hidden"
                  >
                    {article.image && (
                      <div className="relative aspect-[16/10]">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover"
                          sizes="400px"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="tag-pill bg-muted text-xs">
                          {categoryLabels[article.category]?.ko ?? article.category}
                        </span>
                        {article.page && issue.pdfUrl && (
                          <Link
                            href={`/magazine/${issueId}/read?page=${article.page}`}
                            className="text-xs text-brand hover:underline"
                          >
                            p.{article.page} · PDF에서 보기
                          </Link>
                        )}
                      </div>
                      <h3 className="font-display font-semibold leading-snug">{article.title}</h3>
                      {article.titleEn && (
                        <p className="mt-1 text-xs text-muted-foreground">{article.titleEn}</p>
                      )}
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>
                      {article.date && (
                        <p className="mt-2 text-xs text-muted-foreground">{article.date}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

        <div className="border-t border-border pt-8">
          <Link
            href="/magazine"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            모든 호 보기
          </Link>
        </div>
      </div>
    </>
  );
}
