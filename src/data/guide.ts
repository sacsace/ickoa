export const GUIDE_REGION = "Chennai" as const;

/** DB 카테고리 전체 폴백 (경로·슬러그 해석용) */
export const GUIDE_CATEGORY_FALLBACK = [
  { name: "비자", nameEn: "Visa", slug: "visa" },
  { name: "FRRO", nameEn: "FRRO", slug: "frro" },
  { name: "운전면허", nameEn: "Driver License", slug: "license" },
  { name: "은행 계좌", nameEn: "Bank of Korea", slug: "bank" },
  { name: "병원", nameEn: "Hospital", slug: "hospital" },
  { name: "국제학교", nameEn: "School", slug: "school" },
  { name: "아파트", nameEn: "Apartment", slug: "apartment" },
  { name: "통신사", nameEn: "Telecom", slug: "telecom" },
  { name: "게스트하우스", nameEn: "Korean Hotels", slug: "guesthouse" },
  { name: "음식점", nameEn: "Korean Restaurants", slug: "restaurant" },
] as const;

/** 사이트 메뉴에 노출할 카테고리 슬러그 (순서 고정) */
export const GUIDE_MENU_SLUGS = ["bank", "guesthouse", "restaurant"] as const;

export type GuideMenuSlug = (typeof GUIDE_MENU_SLUGS)[number];

export function isGuideMenuSlug(slug: string): slug is GuideMenuSlug {
  return (GUIDE_MENU_SLUGS as readonly string[]).includes(slug);
}

export function guideDisplayName(name: string) {
  if (name === "은행 계좌" || name === "은행") return "한국은행";
  if (name === "게스트하우스") return "한인 호텔 안내";
  if (name === "음식점") return "한인 식당 안내";
  return name;
}

export function guideWriteLabel(name: string) {
  if (name === "은행 계좌" || name === "은행") return "한국은행";
  if (name === "게스트하우스") return "한인 호텔";
  if (name === "음식점") return "한인 식당";
  return name;
}

export function guideCategoryPathBySlug(slug: string) {
  return `/guide/c/${slug}`;
}

export function guideCategoryNewPathBySlug(slug: string) {
  return `${guideCategoryPathBySlug(slug)}/new`;
}

const SLUG_BY_NAME: Record<string, string> = Object.fromEntries(
  GUIDE_CATEGORY_FALLBACK.map((c) => [c.name, c.slug]),
);

/** 카테고리명으로 목록 경로 (슬러그 모를 때 폴백) */
export function guideListPath(category: string, slug?: string | null) {
  if (slug) return guideCategoryPathBySlug(slug);
  const known = SLUG_BY_NAME[category];
  if (known) return guideCategoryPathBySlug(known);
  return "/guide";
}

export function guideCategoryPath(category: string) {
  return guideListPath(category);
}

export function guideCategoryNewPath(category: string) {
  return `${guideListPath(category)}/new`;
}

const MENU_FALLBACK = GUIDE_CATEGORY_FALLBACK.filter((c) =>
  isGuideMenuSlug(c.slug),
);

/** 네비/탭용 — 전체 + 노출 카테고리만 */
export const guideTopicLinks = [
  { id: "gu-all", href: "/guide", labelKo: "전체", labelEn: "All" },
  ...GUIDE_MENU_SLUGS.map((slug) => {
    const c = MENU_FALLBACK.find((item) => item.slug === slug)!;
    return {
      id: `gu-${c.slug}`,
      href: guideCategoryPathBySlug(c.slug),
      labelKo: guideDisplayName(c.name),
      labelEn: c.nameEn,
      category: c.name,
      slug: c.slug,
    };
  }),
] as const;

export function filterGuideMenuCategories<T extends { slug: string }>(
  categories: T[],
): T[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  return GUIDE_MENU_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (c): c is T => Boolean(c),
  );
}

export function guideTopicLabel(category: string) {
  return guideDisplayName(category);
}

export function guideTopicWriteLabel(category: string) {
  return guideWriteLabel(category);
}

/** 호환용 — 모든 등록 카테고리 허용 */
export function isGuideTopicCategory(value: string) {
  return value.trim().length > 0;
}
