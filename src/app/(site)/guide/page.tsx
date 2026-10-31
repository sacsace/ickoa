import { PageHeader } from "@/components/ui/page-header";
import { GuideCategoryGrid } from "@/components/guide/guide-category-grid";
import { GuideTopicNav } from "@/components/guide/guide-topic-nav";
import { getGuideCategories } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "첸나이 생활 가이드",
  description: "첸나이 정착, 비자, 생활 정보 가이드",
  path: "/guide",
});

export const revalidate = 60;

export default async function GuidePage() {
  const categories = await getGuideCategories();

  return (
    <>
      <PageHeader
        title="첸나이 생활 가이드"
        subtitle="카테고리를 선택하면 세부 안내를 확인할 수 있습니다"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <GuideTopicNav categories={categories} />
        <GuideCategoryGrid categories={categories} />
      </div>
    </>
  );
}
