import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { GuideForm } from "@/components/guide/guide-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";
import { createMetadata } from "@/lib/seo";
import { guideListPath, guideWriteLabel } from "@/data/guide";
import { isInterpreterCategory } from "@/lib/interpreter-guide";

export const metadata = createMetadata({
  title: "가이드 수정",
  description: "본인이 등록한 생활가이드를 수정합니다",
  path: "/guide",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/guide/${id}/edit`)}`);
  }

  const guide = await prisma.guide.findUnique({ where: { id } });
  if (!guide) notFound();
  if (!canManageSiteResource(siteUser, guide.createdById)) {
    redirect(guideListPath(guide.category));
  }

  const categoryMeta = await prisma.guideCategory.findFirst({
    where: { name: guide.category },
    select: { slug: true },
  });

  return (
    <>
      <PageHeader
        title={`${guideWriteLabel(guide.category)} 수정`}
        backHref={`/guide/${guide.id}`}
      />
      <div
        className={`mx-auto px-4 py-8 md:px-6 lg:px-8 ${
          isInterpreterCategory(guide.category) ? "max-w-3xl" : "max-w-7xl"
        }`}
      >
        <GuideForm
          category={guide.category}
          categorySlug={categoryMeta?.slug}
          initial={{
            id: guide.id,
            title: guide.title,
            content: guide.content,
            region: guide.region,
          }}
        />
      </div>
    </>
  );
}
