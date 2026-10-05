import { notFound } from "next/navigation";
import { MapPin, Phone, Globe } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { createMetadata, truncateDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) {
    return createMetadata({ title: "기업 정보", path: "/business" });
  }
  return createMetadata({
    title: business.name,
    description: truncateDescription(
      business.description ?? `${business.name} — ${business.category}, ${business.region}`,
    ),
    path: `/business/${id}`,
  });
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) notFound();

  return (
    <>
      <PageHeader title={business.name} backHref="/business" />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <span className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
          {business.category}
        </span>
        <p className="mt-2 text-sm text-muted-foreground">{business.region}</p>

        <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {business.address}
          </div>
          {business.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {business.phone}
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href={`https://${business.website}`} target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:opacity-70">
                {business.website}
              </a>
            </div>
          )}
        </div>

        {business.description && (
          <p className="mt-6 leading-relaxed text-muted-foreground">
            {business.description}
          </p>
        )}
      </div>
    </>
  );
}
