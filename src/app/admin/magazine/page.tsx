import { getAllMagazineIssuesAdmin } from "@/lib/magazine-data";
import { AdminMagazineList } from "@/components/admin/admin-magazine-list";

export const dynamic = "force-dynamic";

export default async function AdminMagazinePage() {
  const issues = await getAllMagazineIssuesAdmin();
  return <AdminMagazineList issues={issues} />;
}
