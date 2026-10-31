import { AdminBusinessBulkForm } from "@/components/admin/admin-business-bulk-form";
import { getBusinessCategoryNames } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminBusinessBulkPage() {
  const categories = await getBusinessCategoryNames();
  return <AdminBusinessBulkForm categories={categories} />;
}
