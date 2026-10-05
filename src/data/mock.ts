export const newsCategories = [
  "경제",
  "산업",
  "자동차",
  "전자",
  "반도체",
  "정부 정책",
  "비자",
  "세금",
] as const;

export const newsRegions = [
  "Chennai",
  "Bangalore",
  "Hyderabad",
  "Sri City",
  "Tamil Nadu",
  "Karnataka",
  "Andhra Pradesh",
] as const;

export const newsItems = [
  {
    id: 1,
    title: "현대차 스리페룸부두르 공장 3라인 가동 확대",
    category: "자동차",
    region: "Sri City",
    date: "2026-06-10",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  },
  {
    id: 2,
    title: "타밀나두 주, 외국인 투자 인센티브 패키지 발표",
    category: "정부 정책",
    region: "Tamil Nadu",
    date: "2026-06-09",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
  },
  {
    id: 3,
    title: "벵갈루루 IT 단지 한국 스타트업 입주 확대",
    category: "산업",
    region: "Bangalore",
    date: "2026-06-08",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
  {
    id: 4,
    title: "인도 e-Visa 연장 절차 간소화 안내",
    category: "비자",
    region: "Chennai",
    date: "2026-06-07",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
  },
  {
    id: 5,
    title: "하이데라바드 반도체 클러스터 투자 확대",
    category: "반도체",
    region: "Hyderabad",
    date: "2026-06-06",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  },
];

export const dashboardCards = [
  {
    id: "exchange",
    value: "₩16.42",
    label: "1 INR",
    change: "+0.3%",
    icon: "trending",
  },
  {
    id: "weather",
    value: "34°C",
    label: "Chennai · 맑음",
    change: "습도 72%",
    icon: "sun",
  },
  {
    id: "flights",
    value: "ICN→MAA",
    label: "KE657 · 18:30",
    change: "정시",
    icon: "plane",
  },
  {
    id: "holidays",
    value: "Aug 15",
    label: "인도 독립기념일",
    change: "D-64",
    icon: "calendar",
  },
  {
    id: "indiaGov",
    value: "GST 개정",
    label: "세금 정책 업데이트",
    change: "NEW",
    icon: "file",
  },
  {
    id: "embassy",
    value: "여권 갱신",
    label: "대사관 공지",
    change: "2일 전",
    icon: "building",
  },
  {
    id: "consulate",
    value: "비자 상담",
    label: "총영사관 안내",
    change: "오늘",
    icon: "landmark",
  },
];

export const businessCategories = [
  "제조업",
  "물류",
  "IT",
  "건설",
  "회계법인",
  "병원",
  "식당",
  "학교",
] as const;

export const businesses = [
  {
    id: 1,
    name: "Hyundai Motor India",
    category: "제조업",
    region: "Sri City",
    address: "Sriperumbudur, Tamil Nadu",
    phone: "+91-44-XXXX-XXXX",
    website: "hyundai.com/in",
  },
  {
    id: 2,
    name: "Samsung SDS India",
    category: "IT",
    region: "Bangalore",
    address: "Whitefield, Bangalore",
    phone: "+91-80-XXXX-XXXX",
    website: "samsungsds.com",
  },
  {
    id: 3,
    name: "Korean Hospital Chennai",
    category: "병원",
    region: "Chennai",
    address: "Anna Nagar, Chennai",
    phone: "+91-44-XXXX-XXXX",
    website: "koreanhospital.in",
  },
  {
    id: 4,
    name: "Hanwoo Restaurant",
    category: "식당",
    region: "Chennai",
    address: "T. Nagar, Chennai",
    phone: "+91-44-XXXX-XXXX",
    website: "hanwoo.in",
  },
  {
    id: 5,
    name: "Korea International School",
    category: "학교",
    region: "Chennai",
    address: "OMR, Chennai",
    phone: "+91-44-XXXX-XXXX",
    website: "kis-chennai.org",
  },
  {
    id: 6,
    name: "LG Electronics India",
    category: "전자",
    region: "Sri City",
    address: "Sriperumbudur, Tamil Nadu",
    phone: "+91-44-XXXX-XXXX",
    website: "lg.com/in",
  },
];

export const communityBoards = [
  { id: "free", name: "자유게시판", posts: 1240, icon: "message" },
  { id: "market", name: "중고장터", posts: 856, icon: "shopping" },
  { id: "jobs", name: "구인구직", posts: 342, icon: "briefcase" },
  { id: "housing", name: "주거정보", posts: 567, icon: "home" },
  { id: "cars", name: "차량매매", posts: 234, icon: "car" },
  { id: "promo", name: "비즈니스 홍보", posts: 189, icon: "megaphone" },
  { id: "events", name: "행사 안내", posts: 98, icon: "calendar" },
  { id: "qa", name: "질문답변", posts: 1456, icon: "help" },
];

export const guideCategories = [
  { id: "visa", name: "비자", icon: "passport" },
  { id: "frro", name: "FRRO", icon: "shield" },
  { id: "license", name: "운전면허", icon: "car" },
  { id: "bank", name: "은행 계좌", icon: "bank" },
  { id: "hospital", name: "병원", icon: "heart" },
  { id: "school", name: "국제학교", icon: "graduation" },
  { id: "apartment", name: "아파트", icon: "building" },
  { id: "telecom", name: "통신사", icon: "phone" },
];

export const guideRegions = ["Chennai"] as const;

export const events = [
  {
    id: 1,
    title: "2026 여름 바베큐 파티",
    date: "2026-07-12",
    location: "ECR Beach Resort",
    attendees: 85,
    maxAttendees: 120,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
  },
  {
    id: 2,
    title: "신규 주재원 오리엔테이션",
    date: "2026-06-28",
    location: "한인회관",
    attendees: 32,
    maxAttendees: 50,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
  },
  {
    id: 3,
    title: "한인 기업 네트워킹 데이",
    date: "2026-08-05",
    location: "ITC Grand Chola",
    attendees: 67,
    maxAttendees: 100,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
  },
];

export const clubs = [
  { id: "golf", name: "골프", members: 48, icon: "flag" },
  { id: "soccer", name: "축구", members: 62, icon: "football" },
  { id: "basketball", name: "농구", members: 35, icon: "basketball" },
  { id: "badminton", name: "배드민턴", members: 41, icon: "shuttle" },
  { id: "hiking", name: "등산", members: 55, icon: "mountain" },
  { id: "band", name: "밴드", members: 18, icon: "music" },
  { id: "fishing", name: "낚시", members: 29, icon: "fish" },
];

export const aboutLinks = [
  { id: "history", href: "/about/history" },
  { id: "leadership", href: "/about/leadership" },
  { id: "bylaws", href: "/about/bylaws" },
  { id: "reports", href: "/about/reports" },
  { id: "finance", href: "/about/finance" },
  { id: "sponsors", href: "/about/sponsors" },
];
