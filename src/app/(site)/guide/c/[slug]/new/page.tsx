import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { GuideForm } from "@/components/guide/guide-form";
import { auth } from "@/lib/auth";
import { getGuideCategoryBySlug } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import {
  guideCategoryPathBySlug,
  guidePublicSlug,
  guideWriteLabel,
} from "@/data/guide";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getGuideCategoryBySlug(slug);
  const label = category ? guideWriteLabel(category.name) : "가이드";
  return createMetadata({
    title: `${label} 등록`,
    description: `${label} 세부 항목 등록`,
    path: `/guide/c/${slug}/new`,
    noIndex: true,
  });
}

export default async function NewGuideItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const newPath = `/guide/c/${slug}/new`;
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(newPath)}`);
  }

  const category = await getGuideCategoryBySlug(slug);
  if (!category) notFound();

  const writeLabel = guideWriteLabel(category.name);

  return (
    <>
      <PageHeader
        title={`${writeLabel} 등록`}
        backHref={guideCategoryPathBySlug(guidePublicSlug(category))}
      />
      <div
        className={`mx-auto px-4 py-8 md:px-6 lg:px-8 ${
          category.slug === "interpreter" ? "max-w-3xl" : "max-w-7xl"
        }`}
      >
        <GuideForm category={category.name} categorySlug={guidePublicSlug(category)} />
      </div>
    </>
  );
}
