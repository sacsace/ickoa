import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { GuideForm } from "@/components/guide/guide-form";
import { auth } from "@/lib/auth";
import { getGuideCategoryBySlug } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import {
  guideCategoryPathBySlug,
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
        backHref={guideCategoryPathBySlug(category.slug)}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <GuideForm category={category.name} categorySlug={category.slug} />
      </div>
    </>
  );
}
