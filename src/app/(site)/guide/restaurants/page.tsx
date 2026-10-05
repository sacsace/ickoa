import { PageHeader } from "@/components/ui/page-header";
import { GuideGrid } from "@/components/guide/guide-grid";
import { GuideTopicNav } from "@/components/guide/guide-topic-nav";
import { getGuides } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "음식점 소개",
  description: "첸나이 한인 음식점·한식당 안내",
  path: "/guide/restaurants",
});

export const dynamic = "force-dynamic";

export default async function RestaurantsGuidePage() {
  const guides = await getGuides("음식점");

  return (
    <>
      <PageHeader
        title="음식점 소개"
        subtitle="첸나이에서 만나는 한식·한인 음식점 안내"
        backHref="/guide"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <GuideTopicNav activeHref="/guide/restaurants" />
        <GuideGrid guides={guides} />
      </div>
    </>
  );
}
