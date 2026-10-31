import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { BusinessRegisterForm } from "@/components/business/business-register-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusinessCategoryNames } from "@/lib/data";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "한인 기업 수정",
  description: "본인이 등록한 한인 기업 정보를 수정합니다",
  path: "/business",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function BusinessEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/business/${id}/edit`)}`);
  }

  const [business, categories] = await Promise.all([
    prisma.business.findUnique({ where: { id } }),
    getBusinessCategoryNames(),
  ]);
  if (!business) notFound();
  if (!canManageSiteResource(siteUser, business.ownerId)) {
    redirect("/business");
  }

  return (
    <>
      <PageHeader
        title="한인 기업 수정"
        subtitle="본인이 등록한 기업 정보만 수정할 수 있습니다"
        backHref="/business"
      />
      <div className="mx-auto w-[80%] max-w-[1356px] px-4 py-12 md:px-6">
        <BusinessRegisterForm
          categories={categories}
          initial={{
            id: business.id,
            name: business.name,
            nameEn: business.nameEn,
            category: business.category,
            products: business.products,
            region: business.region,
            address: business.address,
            parentCompany: business.parentCompany,
            ceoName: business.ceoName,
            ceoTitle: business.ceoTitle,
            contactName: business.contactName,
            contactTitle: business.contactTitle,
            contactPhone: business.contactPhone,
            contactEmail: business.contactEmail,
            website: business.website,
            mapsUrl: business.mapsUrl,
            hideParentCompany: business.hideParentCompany,
            hideCeo: business.hideCeo,
            hideContactPerson: business.hideContactPerson,
            hideContactPhone: business.hideContactPhone,
            hideContactEmail: business.hideContactEmail,
            hideWebsite: business.hideWebsite,
            hideAddress: business.hideAddress,
            hideMapsUrl: business.hideMapsUrl,
          }}
        />
      </div>
    </>
  );
}
