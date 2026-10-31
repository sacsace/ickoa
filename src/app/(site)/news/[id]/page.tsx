import { notFound } from "next/navigation";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { RichHtmlBody } from "@/components/ui/rich-html-body";
import { prisma } from "@/lib/prisma";
import { plainTextFromHtml } from "@/lib/sanitize-html";
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

  return (
    <>
      <PageHeader title={news.title} backHref="/news" />
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="mb-4 flex gap-2">
          <span className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
            {news.category}
          </span>
          <span className="text-xs text-muted-foreground">{news.region}</span>
        </div>
        {news.image && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image src={news.image} alt={news.title} fill className="object-cover" />
          </div>
        )}
        <RichHtmlBody
          content={news.content}
          className="prose prose-neutral max-w-none dark:prose-invert"
        />
      </article>
    </>
  );
}
