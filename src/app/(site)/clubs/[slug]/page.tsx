import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ClubOwnerActions } from "@/components/clubs/club-owner-actions";
import { auth } from "@/lib/auth";
import { getClubBySlug } from "@/lib/clubs";
import { RichHtmlBody } from "@/components/ui/rich-html-body";
import { plainTextFromHtml } from "@/lib/sanitize-html";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";
import { createMetadata, truncateDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

function decodedSlug(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) {
    return createMetadata({ title: "동호회", path: "/clubs" });
  }
  return createMetadata({
    title: club.name,
    description: truncateDescription(
      plainTextFromHtml(club.description ?? "") || `${club.name} 동호회`,
    ),
    path: `/clubs/${club.slug}`,
  });
}

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  if (club.slug !== slug && club.slug !== decodedSlug(slug)) {
    redirect(`/clubs/${club.slug}`);
  }

  const siteUser = getSiteUser(session);
  const canManage = canManageSiteResource(siteUser, club.leaderId);
  const hasDescription = !!plainTextFromHtml(club.description ?? "");

  return (
    <>
      <PageHeader title={club.name} backHref="/clubs" />
      <div className="mx-auto max-w-[1356px] px-4 py-12 md:px-6 lg:px-8">
        <article className="w-full">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            동호회 소개
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">{club.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            그룹장 {club.leader?.name ?? "미지정"}
          </p>
          {hasDescription ? (
            <div className="mt-6">
              <RichHtmlBody
                content={club.description ?? ""}
                className="prose prose-sm max-w-none text-base text-foreground/90 [&_img]:my-4"
              />
            </div>
          ) : (
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              아직 등록된 소개 글이 없습니다. 곧 소개를 업데이트할 예정입니다.
            </p>
          )}
          {canManage ? (
            <ClubOwnerActions clubId={club.id} clubSlug={club.slug} />
          ) : null}
        </article>
      </div>
    </>
  );
}
