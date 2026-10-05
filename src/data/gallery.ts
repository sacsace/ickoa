export type GalleryPhoto = {
  id: string;
  src: string;
  caption: string;
  date?: string;
};

export type GalleryAlbum = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  cover: string;
  category: "life" | "korea" | "ickoa" | "clubs";
  photos: GalleryPhoto[];
};

/** KAIC 앨범 — 첸나이 한인 생활 & 한국 대표 행사 */
export const galleryAlbums: GalleryAlbum[] = [
  {
    id: "chennai-life",
    title: "첸나이, 우리가 사는 곳",
    titleEn: "Living in Chennai",
    description: "OMR 아파트, 국제학교, 주말 장보기 — 첸나이에서의 한인 가족 일상",
    descriptionEn: "Daily life of Korean families in Chennai — schools, markets, and neighborhoods",
    cover: "https://images.unsplash.com/photo-1583417319070-4a69db38a1e3?w=800&q=80",
    category: "life",
    photos: [
      { id: "1", src: "https://images.unsplash.com/photo-1583417319070-4a69db38a1e3?w=800&q=80", caption: "마arina Beach 일몰", date: "2026-05" },
      { id: "2", src: "https://images.unsplash.com/photo-1524492412937-b8c725fd4f67?w=800&q=80", caption: "Anna Nagar 주거 단지", date: "2026-04" },
      { id: "3", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", caption: "주재원 가족 주말", date: "2026-03" },
      { id: "4", src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", caption: "OMR IT 코ridor", date: "2026-02" },
      { id: "5", src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80", caption: "Chennai Airport 출국", date: "2026-01" },
      { id: "6", src: "https://images.unsplash.com/photo-1529156069898-ac995ed41d94?w=800&q=80", caption: "교민 모임", date: "2025-12" },
    ],
  },
  {
    id: "ickoa-events",
    title: "한인회와 함께한 순간",
    titleEn: "KAIC Moments",
    description: "2014년 등록 이래, 첸나이한인회가 만들어온 교민 공동체의 기록",
    descriptionEn: "Community milestones since KAIC's registration in Chennai, 2014",
    cover: "/image/hero-community.jpg",
    category: "ickoa",
    photos: [
      { id: "1", src: "/image/hero-community.jpg", caption: "2022 첸나이 한인 골프대회", date: "2022-12" },
      { id: "2", src: "/image/golf-officials.jpg", caption: "골프대회 운영진", date: "2022-12" },
      { id: "3", src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80", caption: "여름 BBQ 파티", date: "2025-07" },
      { id: "4", src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80", caption: "송년의 밤", date: "2025-12" },
      { id: "5", src: "https://images.unsplash.com/photo-1529156069898-ac995ed41d94?w=800&q=80", caption: "회원 가족 모임", date: "2025-11" },
      { id: "6", src: "https://images.unsplash.com/photo-1505373877841-8d25f39d4706?w=800&q=80", caption: "한인의 날", date: "2025-10" },
    ],
  },
  {
    id: "clubs-sports",
    title: "동호회, 함께 땀 흘리는 날",
    titleEn: "Clubs & Sports",
    description: "골프, 축구, 농구, 배드민턴 — 첸나이 교민 동호회 활동",
    descriptionEn: "Golf, soccer, basketball, badminton — KAIC club activities",
    cover: "https://images.unsplash.com/photo-1535131749006-b7f583c4db27?w=800&q=80",
    category: "clubs",
    photos: [
      { id: "1", src: "https://images.unsplash.com/photo-1535131749006-b7f583c4db27?w=800&q=80", caption: "골프 동호회", date: "2026-04" },
      { id: "2", src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80", caption: "주말 축구", date: "2026-03" },
      { id: "3", src: "https://images.unsplash.com/photo-1519861539783-7cc029814f9b?w=800&q=80", caption: "농구 친선전", date: "2026-02" },
      { id: "4", src: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80", caption: "배드민턴", date: "2026-01" },
      { id: "5", src: "https://images.unsplash.com/photo-1551632811-561732e55680?w=800&q=80", caption: "등산 — Nandi Hills", date: "2025-12" },
      { id: "6", src: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80", caption: "밴드 공연", date: "2025-11" },
    ],
  },
];

export const heroBanners = [
  {
    id: "1",
    image: "/image/hero-community.jpg",
    title: "2022 첸나이 한인 골프대회 & 송년의 밤",
    tag: "KAIC",
  },
  {
    id: "2",
    image: "/magazine/dynamic-korean-cover-vol17.png",
    title: "DYNAMIC KOREAN — 한인회보",
    tag: "Magazine",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
    title: "여름 BBQ 파티 @ ECR",
    tag: "Event",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a1e3?w=1200&q=80",
    title: "Chennai — Our Home",
    tag: "Life",
  },
];

/** Hero background video — community / city (fallback to poster) */
export const HERO_VIDEO =
  "https://videos.pexels.com/video-files/6774643/6774643-hd_1920_1080_25fps.mp4";
export const HERO_VIDEO_POSTER =
  "https://images.unsplash.com/photo-1583417319070-4a69db38a1e3?w=1920&q=80";

export function getAlbumById(id: string) {
  return galleryAlbums.find((a) => a.id === id);
}
