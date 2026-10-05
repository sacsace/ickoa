export const GUIDE_REGION = "Chennai" as const;

export const guideTopicLinks = [
  { id: "gu-all", href: "/guide", labelKo: "전체 가이드", labelEn: "All Guides" },
  {
    id: "gu-guesthouse",
    href: "/guide/c/%EA%B2%8C%EC%8A%A4%ED%8A%B8%ED%95%98%EC%9A%B0%EC%8A%A4",
    labelKo: "게스트하우스 소개",
    labelEn: "Guest Houses",
    category: "게스트하우스",
  },
  {
    id: "gu-restaurants",
    href: "/guide/c/%EC%9D%8C%EC%8B%9D%EC%A0%90",
    labelKo: "음식점 소개",
    labelEn: "Restaurants",
    category: "음식점",
  },
] as const;

export function guideCategoryPath(category: string) {
  return `/guide/c/${encodeURIComponent(category)}`;
}

export function guideCategoryNewPath(category: string) {
  return `${guideCategoryPath(category)}/new`;
}
