import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AdminDonationsDetail } from "@/components/admin/admin-donations-detail";

export const dynamic = "force-dynamic";

export default async function AdminDonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(session.user.role)) {
    notFound();
  }

  const { id } = await params;
  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) notFound();

  return <AdminDonationsDetail donation={donation} />;
}
