import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { createMetadata, truncateDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await prisma.guide.findUnique({ where: { id } });
  if (!guide) {
    return createMetadata({ title: "생활 가이드", path: "/guide" });
  }
  return createMetadata({
    title: guide.title,
    description: truncateDescription(guide.content),
    path: `/guide/${id}`,
  });
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await prisma.guide.findUnique({ where: { id } });
  if (!guide) notFound();

  return (
    <>
      <PageHeader title={guide.title} backHref="/guide" />
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <div className="mb-4 flex gap-2">
          <span className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
            {guide.category}
          </span>
          <span className="text-xs text-muted-foreground">{guide.region}</span>
        </div>
        <p className="whitespace-pre-wrap leading-relaxed text-foreground">
          {guide.content}
        </p>
      </article>
    </>
  );
}
