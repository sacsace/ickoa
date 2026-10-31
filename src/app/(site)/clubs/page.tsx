import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ClubOwnerActions } from "@/components/clubs/club-owner-actions";
import { ClubSearch } from "@/components/clubs/club-search";
import { auth } from "@/lib/auth";
import { getClubs } from "@/lib/data";
import { plainTextFromHtml } from "@/lib/sanitize-html";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "동호회",
  description: "첸나이 한인 골프, 축구, 배드민턴 등 동호회 소개",
  path: "/clubs",
});

export const dynamic = "force-dynamic";

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const [clubs, session] = await Promise.all([getClubs(undefined, q), auth()]);
  const siteUser = getSiteUser(session);

  return (
    <>
      <PageHeader
        title="동호회"
        subtitle="관심사가 같은 교민들의 모임을 소개합니다"
      />
      <div className="mx-auto max-w-[1356px] px-4 py-12 md:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <Suspense
            fallback={
              <div className="h-12 w-full max-w-xl animate-pulse rounded-xl bg-muted" />
            }
          >
            <ClubSearch />
          </Suspense>
          <Link
            href="/clubs/new"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-[3px] bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            동호회 소개 등록
          </Link>
        </div>

        {q ? (
          <p className="mb-4 text-sm text-muted-foreground">
            “{q}” 검색 결과 {clubs.length}건
          </p>
        ) : null}

        {clubs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center text-sm text-muted-foreground">
            {q ? "검색 결과가 없습니다." : "등록된 동호회가 없습니다."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => {
              const canManage = canManageSiteResource(siteUser, club.leaderId);
              return (
                <div
                  key={club.id}
                  className="rounded-2xl border border-border bg-card p-6 md:rounded-3xl"
                >
                  <Link
                    href={`/clubs/${encodeURIComponent(club.slug)}`}
                    className="block hover:opacity-90"
                  >
                    <h2 className="text-lg font-bold text-foreground">
                      {club.name}
                    </h2>
                    {club.leader?.name ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        그룹장 {club.leader.name}
                      </p>
                    ) : null}
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {plainTextFromHtml(club.description ?? "").trim() ||
                        "동호회 소개가 준비 중입니다."}
                    </p>
                    <span className="mt-4 inline-block text-xs font-medium text-brand">
                      소개 보기
                    </span>
                  </Link>
                  {canManage ? (
                    <ClubOwnerActions
                      clubId={club.id}
                      clubSlug={club.slug}
                      compact
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
