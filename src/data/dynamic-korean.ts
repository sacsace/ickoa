export type MagazineCategory =
  | "association"
  | "community"
  | "life"
  | "business"
  | "culture";

export type MagazineArticle = {
  id: string;
  title: string;
  titleEn?: string;
  category: MagazineCategory;
  excerpt: string;
  excerptEn?: string;
  date?: string;
  page?: number;
  image?: string;
};

export type MagazineIssue = {
  id: string;
  volume: number;
  title: string;
  subtitle: string;
  publishedAt: string;
  coverImage: string;
  pdfUrl?: string;
  editorNote?: string;
  editorNoteEn?: string;
  sections: {
    id: string;
    label: string;
    labelEn: string;
    articles: MagazineArticle[];
  }[];
};

export const magazineMeta = {
  name: "DYNAMIC KOREAN",
  nameKo: "다이나믹 코리안",
  publisher: "재인도 첸나이 한인회",
  publisherEn: "Korean Association in Chennai",
  website: "www.ickoa.org",
  email: "edit@ickoa.org",
  adminEmail: "admin@ickoa.org",
  address:
    "No.159/160&161, Dhanalakshmi co-op nagar, Phase-1, Vellanthangal Village, Thandalam Panchayat, Sriperumbudur Taluk 602 105",
};

/** Vol.16 (December 2023) — extracted from official PDF */
export const dynamicKoreanVol16: MagazineIssue = {
  id: "vol-16",
  volume: 16,
  title: "다이나믹 코리안",
  subtitle: "재인도 첸나이 한인회보",
  publishedAt: "2023-12",
  coverImage: "/magazine/dynamic-korean-cover-vol17.png",
  pdfUrl: "/magazine/dynamic-korean-vol16.pdf",
  editorNote:
    "코로나의 아픔을 뒤로하고, 제16호 한인회보 발행을 시작으로 해가 가기 전에 기지개를 펴고 전열을 가다듬고자 합니다. 없는 것보다 있는 것이 나은 한인회 — 막막할 때 미약하나마 힘이 되는 공동체를 꿈꿉니다.",
  editorNoteEn:
    "After the pain of the pandemic, we begin Vol.16 as a fresh start. Our dream is a modest but present community association — one that connects and supports when it matters.",
  sections: [
    {
      id: "about",
      label: "About Korean Association",
      labelEn: "About Korean Association",
      articles: [
        {
          id: "president-closing",
          title: "마무리와 시작",
          titleEn: "Closing & Beginning",
          category: "association",
          page: 6,
          date: "2023-11-20",
          excerpt:
            "제11대 첸나이 한인회장 조상현 — 코로나 이후 늦어진 활동을 돌아보며, 교민 여러분께 감사를 전하고 새 출발을 다짐합니다.",
          excerptEn:
            "President Jo Sang-hyun reflects on post-pandemic delays and pledges a quiet, steady restart for the 11th KAIC leadership.",
        },
        {
          id: "consul-greeting",
          title: "김창년 총영사 인사말",
          titleEn: "Consul General Kim Chang-nyeon",
          category: "association",
          page: 9,
          excerpt:
            "첸나이 한인 동포사회는 이곳에서 가장 큰 외국인 공동체. 총영사관은 한인회와 함께 동포 사회 발전을 위해 노력하겠습니다.",
          excerptEn:
            "Chennai's Korean community is the largest foreign community here. The Consulate General will work with KAIC for its growth.",
        },
        {
          id: "ambassador-visit",
          title: "장재복 주인도 대사 첸나이 방문",
          titleEn: "Ambassador Jang Jae-bok Visits Chennai",
          category: "association",
          page: 11,
          date: "2023-02",
          excerpt:
            "2023년 2월, 주인도대사가 타밀나두 주총리 면담, 마드라스대학 방문, 첸나이 소재 기업·한인회 대표 간담회를 진행했습니다.",
          excerptEn:
            "In Feb 2023, the Ambassador met Tamil Nadu's CM, visited Madras University, and held a luncheon with Korean businesses and KAIC.",
        },
        {
          id: "kaco-donation",
          title: "KACO 기부금 전달식",
          titleEn: "KACO Donation Ceremony",
          category: "association",
          page: 18,
          excerpt: "한인회와 KACO가 함께하는 지역 사회 기부 활동.",
          excerptEn: "KAIC and KACO community donation initiative.",
        },
        {
          id: "federation",
          title: "인도 한인회 총 연합회",
          titleEn: "Federation of Korean Associations in India",
          category: "association",
          page: 20,
          excerpt: "인도 전역 한인회가 함께하는 연합 활동 소식.",
          excerptEn: "News from the federation of Korean associations across India.",
        },
      ],
    },
    {
      id: "community",
      label: "Life in Chennai",
      labelEn: "Life in Chennai",
      articles: [
        {
          id: "neighborhood-news",
          title: "우리동네 소식",
          titleEn: "Neighborhood News",
          category: "community",
          page: 23,
          excerpt: "첸나이 교민 동네의 소소하지만 따뜻한 이야기들.",
          excerptEn: "Warm stories from neighborhoods across Chennai.",
        },
        {
          id: "embassy-moments",
          title: "첸나이 공관 이모저모",
          titleEn: "Embassy & Consulate Moments",
          category: "community",
          page: 32,
          excerpt: "공관 소식, 한국어능력시험, 세종학당 등 첸나이 한국 공관 현장.",
          excerptEn: "Consulate news, TOPIK, Sejong Institute updates from Chennai.",
        },
        {
          id: "photo-community",
          title: "사진으로 보는 첸나이 한인 커뮤니티",
          titleEn: "Chennai Korean Community in Photos",
          category: "community",
          page: 49,
          image: "/image/hero-community.jpg",
          excerpt: "교민들의 모습을 사진으로 담은 커뮤니티 앨범.",
          excerptEn: "A photo album capturing the faces and moments of our community.",
        },
        {
          id: "golf-2022",
          title: "2022 첸나이 한인 골프대회 & 송년의 밤",
          titleEn: "2022 Chennai Korean Golf Tournament & Year-end Night",
          category: "community",
          page: 54,
          date: "2022-12-17",
          image: "/image/hero-community.jpg",
          excerpt:
            "Madras Gymkhana Club에서 200여 명이 참가한 골프대회 겸 송년의 밤. 40개 팀 신페리오 방식 경기 후 한식 뷔페 만찬으로 마무리.",
          excerptEn:
            "200+ attendees at Madras Gymkhana Club. 40 teams played Stableford format, followed by a Korean buffet year-end dinner.",
        },
        {
          id: "org-chart",
          title: "첸나이 한인회 조직도",
          titleEn: "KAIC Organization Chart",
          category: "association",
          page: 59,
          excerpt:
            "제11대 재인도 첸나이 한인회 — 조상현 회장, 부회장단, 각 국장 및 임원진. 서포터즈·학생회 모집 중.",
          excerptEn:
            "11th KAIC leadership under President Jo Sang-hyun. Supporters and student council recruitment open.",
        },
        {
          id: "interview",
          title: "이달의 인터뷰 — 이성광 대표 (위너지스 건설)",
          titleEn: "Interview: Lee Seong-gwang, Winnergis Construction",
          category: "business",
          page: 60,
          excerpt:
            "인도 생활, 현장 경영, 인도 직원 채용, 맛있었던 인도 음식, 첸나이 교민들께 전하는 새해 인사.",
          excerptEn:
            "On life in India, site management, hiring local staff, favorite Indian food, and New Year wishes for Chennai Koreans.",
        },
        {
          id: "hampi",
          title: "HAMPI — 유적이 역사를 말해 주는 장소",
          titleEn: "Hampi — Where Ruins Speak History",
          category: "culture",
          page: 65,
          excerpt:
            "뱅갈로르에서 8시간, 1,600여 기념물이 남아 있는 UNESCO 유적 도시 함피 여행기.",
          excerptEn:
            "A travel story to Hampi — 8 hours from Bangalore, 1,600+ monuments of Vijayanagara heritage.",
        },
        {
          id: "band-lazi",
          title: "라씨와 짜이 — 20~30대 직장인 밴드",
          titleEn: "Lazi & Jjai — Young Professionals Band",
          category: "culture",
          page: 26,
          date: "2021-12-25",
          excerpt:
            "첸나이 교민 밴드 '라씨와 짜이' 크리스마스 데뷔 공연. ECR Surf Turf에서 70여 명이 함께한 저녁.",
          excerptEn:
            "Chennai expat band Lazi & Jjai debuted at Surf Turf, ECR — 70+ guests enjoyed Christmas evening together.",
        },
      ],
    },
    {
      id: "life-guide",
      label: "New From Korean Association",
      labelEn: "New From Korean Association",
      articles: [
        {
          id: "golf-courses",
          title: "세계 9대 골프장",
          titleEn: "World's Top 9 Golf Courses",
          category: "life",
          page: 79,
          excerpt: "골프 동호회 회원을 위한 국내외 명문 코스 소개.",
          excerptEn: "Famous golf courses for club members.",
        },
        {
          id: "housing-checklist",
          title: "집구할 때 체크 포인트",
          titleEn: "Housing Checklist",
          category: "life",
          page: 82,
          excerpt: "첸나이에서 집을 구할 때 꼭 확인해야 할 사항.",
          excerptEn: "Essential checklist for finding a home in Chennai.",
        },
        {
          id: "alone",
          title: "내가 혼자라고 느낄 때",
          titleEn: "When You Feel Alone",
          category: "life",
          page: 84,
          excerpt: "낯선 땅에서 외로움을 이기는 교민들의 이야기와 조언.",
          excerptEn: "Stories and advice for overcoming loneliness abroad.",
        },
        {
          id: "india-stories",
          title: "내가 만난 인도 이야기",
          titleEn: "India Stories I've Met",
          category: "life",
          page: 91,
          excerpt: "인도 현장에서 마주한 사람들과 문화.",
          excerptEn: "People and culture encountered in India.",
        },
        {
          id: "business-tips",
          title: "인도에서 사업할 때 어려운 점",
          titleEn: "Business Challenges in India",
          category: "business",
          page: 104,
          excerpt: "현지 사업 경험에서 얻은 실전 노하우.",
          excerptEn: "Practical tips from doing business in India.",
        },
        {
          id: "hangul-contest",
          title: "힌두스탄세종학당 한글 디자인 공모전",
          titleEn: "Hangul Design Contest at Hindustan Sejong Institute",
          category: "culture",
          page: 106,
          excerpt: "첸나이 세종학당 한글 디자인 공모전 소식.",
          excerptEn: "Hangul design contest at Chennai Sejong Institute.",
        },
      ],
    },
  ],
};

export const magazineIssues: MagazineIssue[] = [dynamicKoreanVol16];

export function getMagazineIssue(id: string) {
  return magazineIssues.find((i) => i.id === id);
}

export function getAllArticles(issue: MagazineIssue) {
  return issue.sections.flatMap((s) => s.articles);
}
