import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { GuideGrid } from "@/components/guide/guide-grid";
import { GuideTopicNav } from "@/components/guide/guide-topic-nav";
import { AuthWriteLink } from "@/components/ui/auth-write-link";
import { auth } from "@/lib/auth";
import {
  getGuideCategories,
  getGuideCategoryBySlug,
  getGuides,
} from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import {
  guideCategoryNewPathBySlug,
  guideDisplayName,
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
  if (!category) {
    return createMetadata({ title: "생활 가이드", path: "/guide" });
  }
  const title = guideDisplayName(category.name);
  return createMetadata({
    title,
    description: `첸나이 ${title} 세부 안내`,
    path: `/guide/c/${slug}`,
  });
}

export default async function GuideCategoryItemsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categories, session] = await Promise.all([
    getGuideCategoryBySlug(slug),
    getGuideCategories(),
    auth(),
  ]);
  if (!category) notFound();

  const guides = await getGuides(category.name);
  const title = guideDisplayName(category.name);
  const writeLabel = guideWriteLabel(category.name);

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${title} 관련 세부 안내`}
        backHref="/guide"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <GuideTopicNav categories={categories} activeSlug={category.slug} />
        <div className="mb-4 flex justify-end">
          <AuthWriteLink
            href={guideCategoryNewPathBySlug(category.slug)}
            label={`${writeLabel} 등록`}
          />
        </div>
        <GuideGrid guides={guides} currentUserId={session?.user?.id} />
      </div>
    </>
  );
}
