import { AdminBusinessForm } from "@/components/admin/admin-business-form";
import { getBusinessCategoryNames } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminBusinessNewPage() {
  const categories = await getBusinessCategoryNames();
  return <AdminBusinessForm categories={categories} />;
}
