import type { Metadata } from "next";

export const SITE_NAME = "ICKOA";
export const SITE_TAGLINE = "재인도 첸나이 한인회";
export const SITE_TAGLINE_EN = "Korean Association in Chennai";

export const DEFAULT_DESCRIPTION =
  "남인도 첸나이 한인회(ICKOA) 공식 커뮤니티. 행사, 한인회보, 갤러리, 뉴스, 생활 가이드, 동호회, 기업 정보를 한곳에서.";

export const DEFAULT_KEYWORDS = [
  "Chennai Korean Association",
  "Korean Community Chennai",
  "South India Korean Community",
  "ICKOA",
  "재인도 첸나이 한인회",
  "첸나이 한인회",
  "인도 한인회",
  "남인도 한인회",
];

export function getSiteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function truncateDescription(text: string, max = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

type CreateMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  keywords?: string[];
};

export function createMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = "/logo.png",
  noIndex = false,
  keywords,
}: CreateMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl("/logo.png");
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: `${SITE_TAGLINE} ${SITE_NAME}`,
      locale: "ko_KR",
      alternateLocale: "en_US",
      type: "website",
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE} - ${SITE_TAGLINE_EN}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    siteName: `${SITE_TAGLINE} ${SITE_NAME}`,
    locale: "ko_KR",
    alternateLocale: "en_US",
    type: "website",
    images: [{ url: "/logo.png", alt: SITE_TAGLINE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

export const adminMetadata: Metadata = createMetadata({
  title: "관리자",
  description: "ICKOA 관리자 페이지",
  path: "/admin",
  noIndex: true,
});
