import { PageHeader } from "@/components/ui/page-header";
import { ClubIntroForm } from "@/components/clubs/club-intro-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "동호회 소개 등록",
  description: "새로운 동호회 소개를 등록합니다",
  path: "/clubs/new",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default function ClubNewPage() {
  return (
    <>
      <PageHeader
        title="동호회 소개 등록"
        subtitle="관심사가 같은 교민들과 함께할 모임을 소개해 주세요"
        backHref="/clubs"
      />
      <div className="mx-auto max-w-[1356px] px-4 py-12 md:px-6 lg:px-8">
        <ClubIntroForm mode="create" />
      </div>
    </>
  );
}
