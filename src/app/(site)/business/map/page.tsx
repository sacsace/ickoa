import { getBusinesses, getBusinessCategoryNames } from "@/lib/data";
import { BusinessMapClient } from "@/components/business/business-map-client";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import { resolveBusinessCoords, resolveMapsUrlCoords } from "@/lib/google-maps-url";

export const metadata = createMetadata({
  title: "한인 기업 지도",
  description: "남인도 한인 기업 인터랙티브 지도",
  path: "/business/map",
});

export const dynamic = "force-dynamic";

export default async function BusinessMapPage() {
  const [rawBusinesses, categories] = await Promise.all([
    getBusinesses(),
    getBusinessCategoryNames(),
  ]);

  const businesses = await Promise.all(
    rawBusinesses
      .filter((b) => !b.hideMapsUrl)
      .map(async (b) => {
        let coords = resolveBusinessCoords(b);
        if (!coords && b.mapsUrl) {
          coords = await resolveMapsUrlCoords(b.mapsUrl);
        }
        return {
          id: b.id,
          name: b.name,
          category: b.category,
          region: b.region,
          address: b.hideAddress ? "비공개" : b.address,
          phone: b.hideContactPhone ? null : b.contactPhone || b.phone,
          website: b.hideWebsite ? null : b.website,
          mapsUrl: b.mapsUrl,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        };
      }),
  );

  return (
    <>
      <PageHeader
        title="South India Korean Business Map"
        subtitle="등록된 구글맵 위치로 한인 기업을 지도에서 확인합니다"
        backHref="/business"
      />
      <div className="mx-auto max-w-[1356px] px-4 py-12 md:px-6">
        <BusinessMapClient businesses={businesses} categories={categories} />
      </div>
    </>
  );
}
