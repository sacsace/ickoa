import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { GuideForm } from "@/components/guide/guide-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import { guideListPath, guideWriteLabel } from "@/data/guide";

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
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/guide/${id}/edit`)}`);
  }

  const guide = await prisma.guide.findUnique({ where: { id } });
  if (!guide) notFound();
  if (guide.createdById !== session.user.id) {
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
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
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
