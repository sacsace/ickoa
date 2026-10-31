import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getBusinesses, getBusinessCategoryNames } from "@/lib/data";
import { BusinessSearch } from "@/components/business/business-search";
import { BusinessDirectoryTable } from "@/components/business/business-directory-table";
import { createMetadata } from "@/lib/seo";
import { auth } from "@/lib/auth";

export const metadata = createMetadata({
  title: "한인 기업 디렉토리",
  description: "남인도 한인 기업 검색, 업종·지역별 디렉토리",
  path: "/business",
});

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; mine?: string }>;
}) {
  const params = await searchParams;
  const [allBusinesses, categories, session] = await Promise.all([
    getBusinesses({
      q: params.q,
      category: params.category,
    }),
    getBusinessCategoryNames(),
    auth(),
  ]);
  const loggedIn = !!session?.user;
  const currentUserId = session?.user?.id ?? null;
  const mineOnly = params.mine === "1";
  if (mineOnly && !currentUserId) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/business?mine=1")}`);
  }
  const businesses =
    mineOnly && currentUserId
      ? allBusinesses.filter((b) => b.ownerId === currentUserId)
      : allBusinesses;

  return (
    <>
      <PageHeader
        title={mineOnly ? "내 등록 기업" : "한인 기업 디렉토리"}
        subtitle={
          mineOnly
            ? "본인이 등록한 기업만 표시됩니다. 상세에서 수정·삭제할 수 있습니다."
            : "남인도 한인 기업 검색 및 네트워킹 · 본인이 등록한 기업은 상세에서 수정·삭제할 수 있습니다"
        }
      />
      <div className="mx-auto max-w-[1356px] px-4 py-12 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Suspense fallback={<div className="h-12 w-full max-w-xl animate-pulse rounded-xl bg-muted" />}>
            <BusinessSearch categories={categories} />
          </Suspense>
          <div className="flex shrink-0 flex-wrap gap-2">
            {loggedIn ? (
              <>
                <Link
                  href={mineOnly ? "/business" : "/business?mine=1"}
                  className="inline-flex h-11 items-center justify-center border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {mineOnly ? "전체 목록" : "내 등록 기업"}
                </Link>
                <Link
                  href="/business/new"
                  className="inline-flex h-11 items-center justify-center gap-1.5 border border-border bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  기업 등록
                </Link>
              </>
            ) : (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent("/business/new")}`}
                className="inline-flex h-11 items-center justify-center border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                로그인 후 기업 등록
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 w-full border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-xs text-muted-foreground md:px-5">
            총 {businesses.length}곳
            {mineOnly ? " · 내 등록" : ""}
          </div>

          {businesses.length === 0 ? (
            <div className="px-4 py-16 text-center md:px-5">
              <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
              {loggedIn ? (
                <Link href="/business/new" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
                  이 기업을 직접 등록하기
                </Link>
              ) : (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent("/business/new")}`}
                  className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
                >
                  로그인 후 등록하기
                </Link>
              )}
            </div>
          ) : (
            <BusinessDirectoryTable
              businesses={businesses}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </div>
    </>
  );
}
