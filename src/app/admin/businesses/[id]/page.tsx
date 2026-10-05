import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBusinessForm } from "@/components/admin/admin-business-form";

export const dynamic = "force-dynamic";

export default async function AdminBusinessEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) notFound();

  return (
    <AdminBusinessForm
      initial={{
        id: business.id,
        name: business.name,
        category: business.category,
        region: business.region,
        address: business.address,
        phone: business.phone,
        website: business.website,
        lat: business.lat,
        lng: business.lng,
        description: business.description,
      }}
    />
  );
}
