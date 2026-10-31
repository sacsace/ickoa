import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { adminMetadata } from "@/lib/seo";

export const metadata = adminMetadata;
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
