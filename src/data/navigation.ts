import { guideTopicLinks } from "@/data/guide";

export type NavChild = {
  id: string;
  href: string;
  labelKo: string;
  labelEn: string;
};

export type NavItem = {
  key: string;
  href: string;
  labelKo: string;
  labelEn: string;
  children: NavChild[];
};

export const mainNavigation: NavItem[] = [
  {
    key: "magazine",
    href: "/magazine",
    labelKo: "다이나믹 코리안",
    labelEn: "Dynamic Korean",
    children: [
      { id: "m-all", href: "/magazine", labelKo: "전체 호 보기", labelEn: "All Issues" },
      { id: "m-latest", href: "/magazine/vol-16", labelKo: "Vol.16 최신호", labelEn: "Latest Vol.16" },
      { id: "m-read", href: "/magazine/vol-16/read", labelKo: "웹 PDF 뷰어", labelEn: "PDF Reader" },
    ],
  },
  {
    key: "gallery",
    href: "/gallery",
    labelKo: "갤러리",
    labelEn: "Gallery",
    children: [
      { id: "g-all", href: "/gallery", labelKo: "전체 갤러리", labelEn: "All Albums" },
      { id: "g-life", href: "/gallery/chennai-life", labelKo: "첸나이 생활", labelEn: "Living in Chennai" },
      { id: "g-ickoa", href: "/gallery/ickoa-events", labelKo: "한인회 행사", labelEn: "KAIC Events" },
      { id: "g-clubs", href: "/gallery/clubs-sports", labelKo: "동호회 활동", labelEn: "Clubs & Sports" },
    ],
  },
  {
    key: "community",
    href: "/community",
    labelKo: "커뮤니티",
    labelEn: "Community",
    children: [
      { id: "c-all", href: "/community", labelKo: "게시판 목록", labelEn: "All Boards" },
      { id: "c-free", href: "/community/free", labelKo: "자유게시판", labelEn: "Free Board" },
      { id: "c-market", href: "/community/market", labelKo: "중고장터", labelEn: "Marketplace" },
      { id: "c-jobs", href: "/community/jobs", labelKo: "구인구직", labelEn: "Jobs" },
      { id: "c-housing", href: "/community/housing", labelKo: "주거정보", labelEn: "Housing" },
      { id: "c-qa", href: "/community/qa", labelKo: "질문답변", labelEn: "Q&A" },
    ],
  },
  {
    key: "events",
    href: "/events",
    labelKo: "이벤트",
    labelEn: "Events",
    children: [
      { id: "e-calendar", href: "/events", labelKo: "이벤트 캘린더", labelEn: "Event Calendar" },
      { id: "e-photos", href: "/gallery/ickoa-events", labelKo: "이벤트 사진", labelEn: "Event Photos" },
    ],
  },
  {
    key: "clubs",
    href: "/clubs",
    labelKo: "동호회",
    labelEn: "Clubs",
    children: [
      { id: "cl-all", href: "/clubs", labelKo: "동호회 목록", labelEn: "All Clubs" },
    ],
  },
  {
    key: "guide",
    href: "/guide",
    labelKo: "생활가이드",
    labelEn: "Living Guide",
    children: guideTopicLinks.map(({ id, href, labelKo, labelEn }) => ({
      id,
      href,
      labelKo,
      labelEn,
    })),
  },
  {
    key: "news",
    href: "/news",
    labelKo: "뉴스",
    labelEn: "News",
    children: [
      { id: "n-all", href: "/news", labelKo: "전체 뉴스", labelEn: "All News" },
    ],
  },
  {
    key: "about",
    href: "/about",
    labelKo: "한인회 소개",
    labelEn: "About",
    children: [
      { id: "a-main", href: "/about", labelKo: "한인회 소개", labelEn: "About KAIC" },
      { id: "a-history", href: "/about/history", labelKo: "연혁", labelEn: "History" },
      { id: "a-leadership", href: "/about/leadership", labelKo: "회장단", labelEn: "Leadership" },
      { id: "a-bylaws", href: "/about/bylaws", labelKo: "정관", labelEn: "Bylaws" },
      { id: "a-reports", href: "/about/reports", labelKo: "활동 보고서", labelEn: "Reports" },
      { id: "a-sponsors", href: "/about/sponsors", labelKo: "후원사", labelEn: "Sponsors" },
      { id: "a-ci", href: "/about/ci", labelKo: "CI", labelEn: "CI" },
      { id: "a-donate", href: "/donate", labelKo: "후원하기 (Razorpay)", labelEn: "Donate (Razorpay)" },
    ],
  },
];

export function getNavLabel(item: NavItem, locale: "ko" | "en") {
  return locale === "ko" ? item.labelKo : item.labelEn;
}

export function getNavChildLabel(child: NavChild, locale: "ko" | "en") {
  return locale === "ko" ? child.labelKo : child.labelEn;
}
