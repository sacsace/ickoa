import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getClubs } from "@/lib/data";
import { JoinClubButton } from "@/components/clubs/join-club-button";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "동호회",
  description: "첸나이 한인 골프, 축구, 배드민턴 등 동호회 모임",
  path: "/clubs",
});

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <>
      <PageHeader title="동호회" subtitle="관심사가 같은 교민들과 함께하세요" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <Link href={`/clubs/${club.slug}`}>
                <h2 className="text-lg font-bold hover:opacity-70">{club.name}</h2>
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {club._count.members}명
              </p>
              {club.description && (
                <p className="mt-2 text-xs text-muted-foreground">{club.description}</p>
              )}
              <JoinClubButton clubId={club.id} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
