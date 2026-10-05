/** 메인 히어로 — 첸나이 한인 커뮤니티 대표 사진 (5760×3840) */
export const HERO_COMMUNITY_IMAGE = "/image/hero-community.jpg";

export const HERO_COMMUNITY_CAPTION = {
  ko: "2022 첸나이 한인 골프대회 & 송년의 밤",
  en: "2022 Chennai Korean Golf Tournament & Year-end Night",
};

export type HeroSlideData = {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  caption: string | null;
  captionEn: string | null;
  link: string | null;
};
