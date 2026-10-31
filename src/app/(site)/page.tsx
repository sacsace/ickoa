import { createMetadata, DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_TAGLINE_EN } from "@/lib/seo";
import { PortalHome } from "@/components/sections/portal-home";
import { getFeaturedMagazineIssue } from "@/lib/magazine-data";
import { getActiveHeroSlides } from "@/lib/hero-data";
import { getGalleryAlbumPreviews } from "@/lib/gallery-data";
import {
  getNews,
  getBoards,
  getEvents,
  getClubs,
  getGuideCategories,
} from "@/lib/data";

/** 공개 홈 — 요청마다 DB 전체 재조회하지 않음 */
export const revalidate = 60;

export const metadata = {
  ...createMetadata({
    title: "\ud648",
    description: DEFAULT_DESCRIPTION,
    path: "/",
  }),
  title: {
    absolute: `${SITE_NAME} | ${SITE_TAGLINE} - ${SITE_TAGLINE_EN}`,
  },
};

export default async function Home() {
  const [
    news,
    boards,
    events,
    clubs,
    guideCategories,
    featuredMagazine,
    heroSlides,
    galleryAlbums,
  ] = await Promise.all([
    getNews(6),
    getBoards(8),
    getEvents(6),
    getClubs(8),
    getGuideCategories(),
    getFeaturedMagazineIssue(),
    getActiveHeroSlides(),
    getGalleryAlbumPreviews(5),
  ]);

  return (
    <PortalHome
      news={news}
      boards={boards}
      events={events}
      clubs={clubs}
      guideCategories={guideCategories}
      magazine={featuredMagazine}
      heroSlides={heroSlides}
      galleryAlbums={galleryAlbums}
    />
  );
}
