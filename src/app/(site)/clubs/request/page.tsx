import { PageHeader } from "@/components/ui/page-header";
import { ClubRequestForm } from "@/components/clubs/club-request-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "동호회 등록 요청",
  description: "새로운 동호회 개설을 관리자에게 요청합니다",
  path: "/clubs/request",
  noIndex: true,
});

export default function ClubRequestPage() {
  return (
    <>
      <PageHeader
        title="동호회 등록 요청"
        subtitle="관심사가 같은 교민들과 함께할 동호회를 관리자에게 제안해 주세요"
        backHref="/clubs"
      />
      <div className="mx-auto max-w-xl px-4 py-12 md:px-6">
        <ClubRequestForm />
      </div>
    </>
  );
}
