import { PageHeader } from "@/components/ui/page-header";
import { GuideGrid } from "@/components/guide/guide-grid";
import { GuideTopicNav } from "@/components/guide/guide-topic-nav";
import { getGuides } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "게스트하우스 소개",
  description: "첸나이 한인 게스트하우스·숙소 안내",
  path: "/guide/guesthouse",
});

export const dynamic = "force-dynamic";

export default async function GuesthouseGuidePage() {
  const guides = await getGuides("게스트하우스");

  return (
    <>
      <PageHeader
        title="게스트하우스 소개"
        subtitle="첸나이 방문·정착 시 이용 가능한 게스트하우스 안내"
        backHref="/guide"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <GuideTopicNav activeHref="/guide/guesthouse" />
        <GuideGrid guides={guides} />
      </div>
    </>
  );
}
