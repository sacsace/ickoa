import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBusinessForm } from "@/components/admin/admin-business-form";
import { getBusinessCategoryNames } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminBusinessEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [business, categories] = await Promise.all([
    prisma.business.findUnique({ where: { id } }),
    getBusinessCategoryNames(),
  ]);
  if (!business) notFound();

  return (
    <AdminBusinessForm
      categories={categories}
      initial={{
        id: business.id,
        name: business.name,
        nameEn: business.nameEn,
        category: business.category,
        products: business.products,
        region: business.region,
        address: business.address,
        phone: business.phone,
        website: business.website,
        parentCompany: business.parentCompany,
        ceoName: business.ceoName,
        ceoTitle: business.ceoTitle,
        contactName: business.contactName,
        contactTitle: business.contactTitle,
        contactPhone: business.contactPhone,
        contactEmail: business.contactEmail,
        mapsUrl: business.mapsUrl,
        lat: business.lat,
        lng: business.lng,
        description: business.description,
      }}
    />
  );
}
