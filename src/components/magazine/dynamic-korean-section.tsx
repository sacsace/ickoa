"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Download, BookOpen } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader, SectionShell } from "@/components/ui/motion";
import { magazineMeta, type MagazineIssue } from "@/data/dynamic-korean";

type Props = {
  issue: MagazineIssue;
};

export function DynamicKoreanSection({ issue }: Props) {
  const { locale } = useLocale();
  const isKo = locale === "ko";

  const featuredArticles = issue.sections
    .flatMap((s) => s.articles)
    .filter((a) => a.image || a.page)
    .slice(0, 3);

  return (
    <SectionShell alt className="overflow-hidden">
      <div className="mb-10 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-xs font-medium tracking-[0.25em] text-brand uppercase">
            {magazineMeta.name}
          </p>
          <h2 className="font-display mt-1 text-3xl font-bold tracking-tight md:text-4xl">
            {isKo ? magazineMeta.nameKo : magazineMeta.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {magazineMeta.website} · {magazineMeta.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
            VOL.{issue.volume} · {issue.publishedAt.toUpperCase()}
          </span>
          {issue.pdfUrl && (
            <>
              <Link
                href={`/magazine/${issue.id}/read`}
                className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:border-brand hover:text-brand"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {isKo ? "웹에서 보기" : "Read online"}
              </Link>
              <a
                href={issue.pdfUrl}
                download
                className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </a>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <FadeIn className="lg:col-span-5">
          <div className="community-card overflow-hidden">
            <div className="relative aspect-[3/4] max-h-[480px]">
              <Image
                src={issue.coverImage}
                alt={`${magazineMeta.name} Vol.${issue.volume}`}
                fill
                className="object-cover object-top"
                sizes="400px"
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-medium text-brand">
                {isKo ? "발행인 조상현 · 편집부" : "Publisher · KAIC Editorial"}
              </p>
              {issue.editorNote && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {isKo ? issue.editorNote : (issue.editorNoteEn ?? issue.editorNote)}
                </p>
              )}
            </div>
          </div>
        </FadeIn>

        <div className="lg:col-span-7">
          {featuredArticles.length > 0 ? (
            <>
              <SectionHeader
                title={isKo ? `${issue.volume}호 하이라이트` : `Vol.${issue.volume} Highlights`}
                subtitle={
                  isKo
                    ? "골프대회, 인터뷰, 여행 — 교민들이 만든 이야기"
                    : "Stories from our community"
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {featuredArticles.map((article, i) => (
                  <FadeIn
                    key={article.id}
                    delay={i * 0.08}
                    className={i === 0 ? "sm:col-span-2" : undefined}
                  >
                    <Link
                      href={
                        article.page
                          ? `/magazine/${issue.id}/read?page=${article.page}`
                          : `/magazine/${issue.id}#${article.id}`
                      }
                      className="group block h-full"
                    >
                      <article className="community-card h-full overflow-hidden">
                        {article.image && (
                          <div
                            className={`relative overflow-hidden ${i === 0 ? "aspect-[21/9]" : "aspect-[16/10]"}`}
                          >
                            <Image
                              src={article.image}
                              alt={article.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="400px"
                            />
                          </div>
                        )}
                        <div className="p-5">
                          {article.page && (
                            <span className="text-xs text-muted-foreground">p.{article.page}</span>
                          )}
                          <h3 className="font-display mt-1 font-semibold leading-snug group-hover:text-brand">
                            {isKo ? article.title : (article.titleEn ?? article.title)}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {isKo ? article.excerpt : (article.excerptEn ?? article.excerpt)}
                          </p>
                        </div>
                      </article>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </>
          ) : (
            <SectionHeader
              title={isKo ? "최신 한인회보" : "Latest Issue"}
              subtitle={
                isKo
                  ? "PDF 뷰어에서 전체 내용을 읽어보세요"
                  : "Read the full issue in our PDF viewer"
              }
            />
          )}

          <FadeIn className="mt-6">
            <Link
              href={`/magazine/${issue.id}`}
              className="group inline-flex items-center gap-2 font-medium text-brand"
            >
              {isKo ? `${issue.volume}호 전체 보기` : `View Vol.${issue.volume}`}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </SectionShell>
  );
}
