import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getBusinesses } from "@/lib/data";
import { BusinessSearch } from "@/components/business/business-search";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "한인 기업 디렉토리",
  description: "남인도 한인 기업 검색, 업종·지역별 디렉토리",
  path: "/business",
});

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const businesses = await getBusinesses({
    q: params.q,
    category: params.category,
  });

  return (
    <>
      <PageHeader title="한인 기업 디렉토리" subtitle="남인도 한인 기업 검색 및 네트워킹" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-muted" />}>
          <BusinessSearch />
        </Suspense>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((biz) => (
            <Link
              key={biz.id}
              href={`/business/${biz.id}`}
              className="hover-lift rounded-2xl border border-border bg-card p-6 md:rounded-3xl"
            >
              <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {biz.category}
              </span>
              <h2 className="mt-2 font-bold text-foreground">{biz.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{biz.address}</p>
              <p className="text-xs text-muted-foreground">{biz.region}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
