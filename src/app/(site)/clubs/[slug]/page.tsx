import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { JoinClubButton } from "@/components/clubs/join-club-button";
import { createMetadata, truncateDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await prisma.club.findUnique({ where: { slug } });
  if (!club) {
    return createMetadata({ title: "동호회", path: "/clubs" });
  }
  return createMetadata({
    title: club.name,
    description: truncateDescription(club.description ?? `${club.name} 동호회`),
    path: `/clubs/${slug}`,
  });
}

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true } },
      members: {
        include: { user: { select: { id: true, name: true } } },
        take: 20,
      },
    },
  });
  if (!club) notFound();

  return (
    <>
      <PageHeader title={club.name} backHref="/clubs" />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <p className="text-muted-foreground">{club.description}</p>
        <p className="mt-2 text-sm text-muted-foreground">{club._count.members}명 참여 중</p>
        <JoinClubButton clubId={club.id} />

        <h3 className="mt-8 font-bold">회원</h3>
        <ul className="mt-3 space-y-2">
          {club.members.map((m) => (
            <li key={m.id} className="text-sm text-muted-foreground">
              {m.user.name}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
