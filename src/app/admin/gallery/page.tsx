import { AdminGalleryList } from "@/components/admin/admin-gallery-list";
import { getAllGalleryAlbumsAdmin } from "@/lib/gallery-data";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const albums = await getAllGalleryAlbumsAdmin();
  return <AdminGalleryList albums={albums} />;
}
