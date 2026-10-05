import { prisma } from "@/lib/prisma";
import {
  HERO_COMMUNITY_CAPTION,
  HERO_COMMUNITY_IMAGE,
  type HeroSlideData,
} from "@/data/hero";

const DEFAULT_SLIDE: HeroSlideData = {
  id: "default",
  mediaType: "IMAGE",
  mediaUrl: HERO_COMMUNITY_IMAGE,
  caption: HERO_COMMUNITY_CAPTION.ko,
  captionEn: HERO_COMMUNITY_CAPTION.en,
  link: null,
};

function mapSlide(slide: {
  id: string;
  mediaType: string;
  mediaUrl: string;
  caption: string | null;
  captionEn: string | null;
  link: string | null;
}): HeroSlideData {
  return {
    id: slide.id,
    mediaType: slide.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
    mediaUrl: slide.mediaUrl,
    caption: slide.caption,
    captionEn: slide.captionEn,
    link: slide.link,
  };
}

export async function getActiveHeroSlides(): Promise<HeroSlideData[]> {
  try {
    if (!("heroSlide" in prisma)) return [DEFAULT_SLIDE];

    const slides = await prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    if (slides.length === 0) return [DEFAULT_SLIDE];
    return slides.map(mapSlide);
  } catch {
    return [DEFAULT_SLIDE];
  }
}

export async function getAllHeroSlidesAdmin() {
  if (!("heroSlide" in prisma)) return [];
  return prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
}
