import { PageHeader } from "@/components/ui/page-header";
import { GuideGrid } from "@/components/guide/guide-grid";
import { GuideTopicNav } from "@/components/guide/guide-topic-nav";
import { getGuides } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "첸나이 생활 가이드",
  description: "첸나이 정착, 비자, 생활 정보 가이드",
  path: "/guide",
});

export const dynamic = "force-dynamic";

export default async function GuidePage() {
  const guides = await getGuides();

  return (
    <>
      <PageHeader title="첸나이 생활 가이드" subtitle="신규 주재원을 위한 필수 정착 정보" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <GuideTopicNav activeHref="/guide" />
        <GuideGrid guides={guides} />
      </div>
    </>
  );
}
