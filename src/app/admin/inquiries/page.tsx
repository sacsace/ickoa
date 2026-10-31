import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminInquiriesList } from "@/components/admin/admin-inquiries-list";
import { adminHasRole } from "@/lib/session-kind";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const session = await auth();
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminInquiriesList
      inquiries={inquiries.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }))}
      canDelete={adminHasRole(session, ["SUPER_ADMIN"])}
    />
  );
}
