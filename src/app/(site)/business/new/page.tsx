import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessRegisterForm } from "@/components/business/business-register-form";
import { auth } from "@/lib/auth";
import { getBusinessCategoryNames } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "한인 기업 등록",
  description: "첸나이·남인도 한인 기업을 디렉토리에 등록합니다",
  path: "/business/new",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function BusinessNewPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/business/new")}`);
  }

  const categories = await getBusinessCategoryNames();

  return (
    <>
      <PageHeader
        title="한인 기업 등록"
        subtitle="등록 정보는 디렉토리에 공개됩니다. 엑셀 리스트와 동일한 항목을 입력해 주세요."
        backHref="/business"
      />
      <div className="mx-auto w-[80%] max-w-[1356px] px-4 py-12 md:px-6">
        <BusinessRegisterForm categories={categories} />
      </div>
    </>
  );
}
