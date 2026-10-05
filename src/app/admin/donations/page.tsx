import { AdminDonationsList } from "@/components/admin/admin-donations-list";
import { getDonationsAdmin } from "@/actions/donate";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  const donations = await getDonationsAdmin();
  return <AdminDonationsList donations={donations} />;
}
