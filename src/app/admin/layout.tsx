import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { adminMetadata } from "@/lib/seo";

export const metadata = adminMetadata;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
