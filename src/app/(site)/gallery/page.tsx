import { PageHeader } from "@/components/ui/page-header";
import { GalleryPageClient } from "@/components/gallery/photo-album";
import { getGalleryAlbums } from "@/lib/gallery-data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "포토 갤러리",
  description: "첸나이 한인회 행사, 동호회, 교민 생활 사진 갤러리",
  path: "/gallery",
});

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();

  return (
    <>
      <PageHeader
        title="포토 갤러리"
        subtitle="첸나이 한인들의 모습, 한국을 대표하는 순간"
        backHref="/"
      />
      <GalleryPageClient albums={albums} />
    </>
  );
}
