import { notFound } from "next/navigation";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { RichHtmlBody } from "@/components/ui/rich-html-body";
import { ShareBar } from "@/components/ui/share-bar";
import { prisma } from "@/lib/prisma";
import { firstImageSrcFromHtml, plainTextFromHtml } from "@/lib/sanitize-html";
import { createMetadata, truncateDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) {
    return createMetadata({ title: "뉴스", path: "/news" });
  }
  return createMetadata({
    title: news.title,
    description: truncateDescription(plainTextFromHtml(news.content)),
    path: `/news/${id}`,
    image: news.image,
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) notFound();

  const downloadSrc = firstImageSrcFromHtml(news.content) || news.image;

  return (
    <>
      <PageHeader title={news.title} backHref="/news" />
      <article className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <span className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
              {news.category}
            </span>
            <span className="text-xs text-muted-foreground">{news.region}</span>
          </div>
          <ShareBar title={news.title} path={`/news/${news.id}`} imageSrc={downloadSrc} />
        </div>
        {news.image && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={news.image} alt={news.title} fill className="object-cover" />
          </div>
        )}
        <RichHtmlBody
          content={news.content}
          className="prose prose-neutral max-w-none dark:prose-invert [&_img]:h-auto [&_img]:w-full"
        />
      </article>
    </>
  );
}
