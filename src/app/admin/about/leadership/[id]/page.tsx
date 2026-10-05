import { notFound } from "next/navigation";
import { AdminLeadershipForm } from "@/components/admin/admin-leadership-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLeadershipEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await prisma.leadershipMember.findUnique({ where: { id } });
  if (!member) notFound();
  return <AdminLeadershipForm initial={member} />;
}
