import { createMetadata, DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_TAGLINE_EN } from "@/lib/seo";
import { PortalHome } from "@/components/sections/portal-home";
import { getFeaturedMagazineIssue } from "@/lib/magazine-data";
import { getActiveHeroSlides } from "@/lib/hero-data";
import { getGalleryAlbums } from "@/lib/gallery-data";
import {
  getNews,
  getBoards,
  getEvents,
  getClubs,
  getGuides,
} from "@/lib/data";

export const dynamic = "force-dynamic";

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
  const [news, boards, events, clubs, guides, featuredMagazine, heroSlides, galleryAlbums] =
    await Promise.all([
      getNews(6),
      getBoards(),
      getEvents(),
      getClubs(),
      getGuides(),
      getFeaturedMagazineIssue(),
      getActiveHeroSlides(),
      getGalleryAlbums(),
    ]);

  return (
    <PortalHome
      news={news}
      boards={boards}
      events={events}
      clubs={clubs}
      guides={guides}
      magazine={featuredMagazine}
      heroSlides={heroSlides}
      galleryAlbums={galleryAlbums}
    />
  );
}
