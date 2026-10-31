import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ClubIntroForm } from "@/components/clubs/club-intro-form";
import { auth } from "@/lib/auth";
import { getClubBySlug } from "@/lib/clubs";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  return createMetadata({
    title: club ? `${club.name} 소개 수정` : "동호회 소개 수정",
    path: `/clubs/${slug}/edit`,
    noIndex: true,
  });
}

export default async function ClubEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const siteUser = getSiteUser(session);
  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/clubs/${slug}/edit`)}`;
  if (!siteUser) {
    redirect(loginHref);
  }
  if (!canManageSiteResource(siteUser, club.leaderId)) {
    redirect(`/clubs/${encodeURIComponent(club.slug)}`);
  }

  return (
    <>
      <PageHeader
        title="동호회 소개 수정"
        subtitle={club.name}
        backHref={`/clubs/${encodeURIComponent(club.slug)}`}
      />
      <div className="mx-auto max-w-[1356px] px-4 py-12 md:px-6 lg:px-8">
        <ClubIntroForm
          mode="edit"
          club={{
            id: club.id,
            slug: club.slug,
            name: club.name,
            description: club.description,
          }}
        />
      </div>
    </>
  );
}
