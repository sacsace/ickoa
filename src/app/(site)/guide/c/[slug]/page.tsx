import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { GuideItemsList } from "@/components/guide/guide-items-list";
import { GuideTopicNav } from "@/components/guide/guide-topic-nav";
import { auth } from "@/lib/auth";
import {
  getGuideCategories,
  getGuideCategoryBySlug,
  getGuides,
} from "@/lib/data";
import { getSiteUser } from "@/lib/session-kind";
import { isSiteSuperuser } from "@/lib/site-permissions";
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
  const siteUser = getSiteUser(session);

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${title} 관련 세부 안내`}
        backHref="/guide"
      />
      <div className="mx-auto w-full max-w-[1356px] px-4 py-12 md:px-6 lg:px-8">
        <GuideTopicNav categories={categories} activeSlug={category.slug} />
        <GuideItemsList
          guides={guides}
          currentUserId={siteUser?.id}
          manageAll={isSiteSuperuser(siteUser)}
          writeHref={guideCategoryNewPathBySlug(category.slug)}
          writeLabel={writeLabel}
          interpreterCategory={category.slug === "interpreter"}
        />
      </div>
    </>
  );
}
