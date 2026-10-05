import { AdminHeroClient } from "@/components/admin/admin-hero";
import { getAllHeroSlidesAdmin } from "@/lib/hero-data";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const slides = await getAllHeroSlidesAdmin();
  return <AdminHeroClient slides={slides} />;
}
