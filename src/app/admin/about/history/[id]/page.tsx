import { notFound } from "next/navigation";
import { AdminHistoryForm } from "@/components/admin/admin-history-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHistoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await prisma.historyEntry.findUnique({ where: { id } });
  if (!entry) notFound();
  return <AdminHistoryForm initial={entry} />;
}
