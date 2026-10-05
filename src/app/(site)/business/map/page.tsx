import { getBusinesses } from "@/lib/data";
import { BusinessMapClient } from "@/components/business/business-map-client";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "한인 기업 지도",
  description: "남인도 한인 기업 인터랙티브 지도",
  path: "/business/map",
});

export const dynamic = "force-dynamic";

export default async function BusinessMapPage() {
  const businesses = await getBusinesses();

  return (
    <>
      <PageHeader
        title="South India Korean Business Map"
        subtitle="남인도 한인기업 인터랙티브 지도"
        backHref="/business"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <BusinessMapClient businesses={businesses} />
      </div>
    </>
  );
}
