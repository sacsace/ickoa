import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminClubForm } from "@/components/admin/admin-club-form";

export const dynamic = "force-dynamic";

export default async function AdminClubEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) notFound();
  return <AdminClubForm mode="edit" club={club} />;
}
