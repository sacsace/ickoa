import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBoardForm } from "@/components/admin/admin-board-form";

export const dynamic = "force-dynamic";

export default async function AdminBoardEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const board = await prisma.board.findUnique({ where: { id } });
  if (!board) notFound();
  return <AdminBoardForm mode="edit" board={board} />;
}
