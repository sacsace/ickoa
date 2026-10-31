import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { GuideBody } from "@/components/guide/guide-body";
import { GuideDeleteButton } from "@/components/guide/guide-delete-button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";
import { createMetadata, truncateDescription } from "@/lib/seo";
import { guideListPath, guideWriteLabel } from "@/data/guide";
import { isInterpreterCategory } from "@/lib/interpreter-guide";
import { plainTextFromHtml } from "@/lib/sanitize-html";

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
    description: truncateDescription(plainTextFromHtml(guide.content)),
    path: `/guide/${id}`,
  });
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [guide, session] = await Promise.all([
    prisma.guide.findUnique({ where: { id } }),
    auth(),
  ]);
  if (!guide) notFound();

  const categoryMeta = await prisma.guideCategory.findUnique({
    where: { name: guide.category },
    select: { slug: true },
  });
  const backHref = guideListPath(guide.category, categoryMeta?.slug);
  const siteUser = getSiteUser(session);
  const canManage = canManageSiteResource(siteUser, guide.createdById);
  const interpreter = isInterpreterCategory(guide.category);

  return (
    <>
      <PageHeader title={guide.title} backHref={backHref} />
      <article
        className={`mx-auto px-4 py-12 md:px-6 lg:px-8 ${
          interpreter ? "max-w-3xl" : "max-w-7xl"
        }`}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <span className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
              {guideWriteLabel(guide.category)}
            </span>
            <span className="self-center text-xs text-muted-foreground">
              {interpreter ? `통역 가능 지역 · ${guide.region}` : guide.region}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canManage ? (
              <>
                <Link href={`/guide/${guide.id}/edit`}>
                  <Button type="button" variant="outline" size="sm">
                    수정
                  </Button>
                </Link>
                <GuideDeleteButton
                  guideId={guide.id}
                  title={guide.title}
                  category={guide.category}
                  categorySlug={categoryMeta?.slug}
                />
              </>
            ) : null}
            <Link href={backHref}>
              <Button type="button" variant="outline" size="sm">
                목록
              </Button>
            </Link>
          </div>
        </div>
        <GuideBody content={guide.content} />
      </article>
    </>
  );
}
