import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { galleryAlbums } from "../src/data/gallery";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  const legacyAdmin = await prisma.user.findUnique({
    where: { email: "admin@ickoa.org" },
  });
  if (legacyAdmin && legacyAdmin.loginId !== "root") {
    await prisma.user.delete({ where: { id: legacyAdmin.id } });
  }

  const admin = await prisma.user.upsert({
    where: { loginId: "root" },
    update: {
      name: "ICKOA Root Admin",
      password: adminPassword,
      role: Role.SUPER_ADMIN,
    },
    create: {
      loginId: "root",
      name: "ICKOA Root Admin",
      password: adminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  const memberPassword = await bcrypt.hash("member1234", 10);
  await prisma.user.upsert({
    where: { email: "member@ickoa.org" },
    update: {},
    create: {
      email: "member@ickoa.org",
      name: "Test Member",
      password: memberPassword,
      role: Role.MEMBER,
    },
  });

  const boards = [
    { slug: "free", name: "자유게시판", icon: "message" },
    { slug: "market", name: "중고장터", icon: "shopping" },
    { slug: "jobs", name: "구인구직", icon: "briefcase" },
    { slug: "housing", name: "주거정보", icon: "home" },
    { slug: "cars", name: "차량매매", icon: "car" },
    { slug: "promo", name: "비즈니스 홍보", icon: "megaphone" },
    { slug: "events", name: "행사 안내", icon: "calendar" },
    { slug: "qa", name: "질문답변", icon: "help" },
  ];

  for (const board of boards) {
    await prisma.board.upsert({
      where: { slug: board.slug },
      update: {},
      create: board,
    });
  }

  const guideCategories = [
    { name: "비자", nameEn: "Visa", slug: "visa", order: 1 },
    { name: "FRRO", nameEn: "FRRO", slug: "frro", order: 2 },
    { name: "운전면허", nameEn: "Driver License", slug: "license", order: 3 },
    { name: "은행 계좌", nameEn: "Bank", slug: "bank", order: 4 },
    { name: "병원", nameEn: "Hospital", slug: "hospital", order: 5 },
    { name: "국제학교", nameEn: "School", slug: "school", order: 6 },
    { name: "아파트", nameEn: "Apartment", slug: "apartment", order: 7 },
    { name: "통신사", nameEn: "Telecom", slug: "telecom", order: 8 },
    { name: "게스트하우스", nameEn: "Guesthouse", slug: "guesthouse", order: 9 },
    { name: "음식점", nameEn: "Restaurant", slug: "restaurant", order: 10 },
  ];
  for (const cat of guideCategories) {
    await prisma.guideCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameEn: cat.nameEn, order: cat.order },
      create: cat,
    });
  }

  const galleryCategories = [
    { name: "ICKOA", nameEn: "ICKOA", slug: "ickoa", order: 1 },
    { name: "첸나이 라이프", nameEn: "Chennai Life", slug: "life", order: 2 },
    { name: "동호회", nameEn: "Clubs", slug: "clubs", order: 3 },
    { name: "한국", nameEn: "Korea", slug: "korea", order: 4 },
  ];
  for (const cat of galleryCategories) {
    await prisma.galleryCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameEn: cat.nameEn, order: cat.order },
      create: cat,
    });
  }

  const newsData = [
    {
      title: "현대차 스리페룸부두르 공장 3라인 가동 확대",
      content: "현대자동차 인도 스리페룸부두르 공장이 3번째 생산 라인 가동을 확대하며 남인도 자동차 산업 생태계에 새로운 활력을 불어넣고 있습니다.",
      category: "자동차",
      region: "Sri City",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    },
    {
      title: "타밀나두 주, 외국인 투자 인센티브 패키지 발표",
      content: "타밀나두 주정부가 외국인 직접투자(FDI) 유치를 위한 새로운 인센티브 패키지를 발표했습니다.",
      category: "정부 정책",
      region: "Tamil Nadu",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    },
    {
      title: "벵갈루루 IT 단지 한국 스타트업 입주 확대",
      content: "벵갈루루 IT 코ridor에 한국 스타트업들의 입주가 확대되고 있습니다.",
      category: "산업",
      region: "Bangalore",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    },
    {
      title: "인도 e-Visa 연장 절차 간소화 안내",
      content: "인도 이민국(FRRO)이 e-Visa 연장 절차를 간소화했습니다.",
      category: "비자",
      region: "Chennai",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    },
    {
      title: "하이데라바드 반도체 클러스터 투자 확대",
      content: "하이데라바드 반도체 클러스터에 대규모 투자가 이어지고 있습니다.",
      category: "반도체",
      region: "Hyderabad",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    },
  ];

  const existingNews = await prisma.news.count();
  if (existingNews === 0) {
    await prisma.news.createMany({ data: newsData });
  }

  const businesses = [
    { name: "Hyundai Motor India", category: "제조업", region: "Sri City", address: "Sriperumbudur, Tamil Nadu", phone: "+91-44-4710-0000", website: "hyundai.com/in", lat: 12.9675, lng: 79.9514 },
    { name: "Samsung SDS India", category: "IT", region: "Bangalore", address: "Whitefield, Bangalore", phone: "+91-80-6720-0000", website: "samsungsds.com", lat: 12.9698, lng: 77.75 },
    { name: "Korean Hospital Chennai", category: "병원", region: "Chennai", address: "Anna Nagar, Chennai", phone: "+91-44-2620-0000", website: "koreanhospital.in", lat: 13.0878, lng: 80.2107 },
    { name: "Hanwoo Restaurant", category: "식당", region: "Chennai", address: "T. Nagar, Chennai", phone: "+91-44-2815-0000", website: "hanwoo.in", lat: 13.0418, lng: 80.2341 },
    { name: "Korea International School", category: "학교", region: "Chennai", address: "OMR, Chennai", phone: "+91-44-2450-0000", website: "kis-chennai.org", lat: 12.8996, lng: 80.2209 },
    { name: "LG Electronics India", category: "전자", region: "Sri City", address: "Sriperumbudur, Tamil Nadu", phone: "+91-44-4740-0000", website: "lg.com/in", lat: 12.975, lng: 79.94 },
  ];

  const existingBiz = await prisma.business.count();
  if (existingBiz === 0) {
    await prisma.business.createMany({ data: businesses });
  }

  const events = [
    {
      title: "2026 여름 바베큐 파티",
      description: "ECR 해변 리조트에서 열리는 한인회 여름 바베큐 파티입니다.",
      date: new Date("2026-07-12T17:00:00"),
      location: "ECR Beach Resort",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
      maxAttendees: 120,
    },
    {
      title: "신규 주재원 오리엔테이션",
      description: "인도 체류를 시작하는 신규 주재원을 위한 필수 오리엔테이션.",
      date: new Date("2026-06-28T10:00:00"),
      location: "한인회관",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
      maxAttendees: 50,
    },
    {
      title: "한인 기업 네트워킹 데이",
      description: "남인도 한인 기업 간 네트워킹 및 비즈니스 매칭 행사.",
      date: new Date("2026-08-05T14:00:00"),
      location: "ITC Grand Chola",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
      maxAttendees: 100,
    },
  ];

  const existingEvents = await prisma.event.count();
  if (existingEvents === 0) {
    await prisma.event.createMany({ data: events });
  }

  const clubs = [
    { slug: "golf", name: "골프", description: "주말 라운딩과 친선 대회", icon: "flag" },
    { slug: "soccer", name: "축구", description: "매주 토요일 친선 경기", icon: "football" },
    { slug: "basketball", name: "농구", description: "실내 코트 정기 모임", icon: "basketball" },
    { slug: "badminton", name: "배드민턴", description: "수요일/금요일 정기 모임", icon: "shuttle" },
    { slug: "hiking", name: "등산", description: "남인도 트레킹 및 등산", icon: "mountain" },
    { slug: "band", name: "밴드", description: "음악 애호가 모임", icon: "music" },
    { slug: "fishing", name: "낚시", description: "주말 낚시 출조", icon: "fish" },
  ];

  for (const club of clubs) {
    await prisma.club.upsert({
      where: { slug: club.slug },
      update: {},
      create: club,
    });
  }

  const guides = [
    { category: "비자", region: "Chennai", title: "인도 비자 종류 및 신청 절차", content: "Business Visa, Employment Visa, e-Visa 등 인도 비자 종류와 FRRO 등록 절차를 안내합니다.", order: 1 },
    { category: "FRRO", region: "Chennai", title: "FRRO 등록 및 연장", content: "Foreigners Regional Registration Office 등록 절차, 필요 서류, 온라인 예약 방법.", order: 2 },
    { category: "운전면허", region: "Chennai", title: "인도 운전면허 취득", content: "국제운전면허증 사용 기간, 현지 면허 전환 절차.", order: 3 },
    { category: "은행 계좌", region: "Chennai", title: "인도 은행 계좌 개설", content: "HDFC, ICICI, SBI 등 주요 은행 계좌 개설에 필요한 서류.", order: 4 },
    { category: "병원", region: "Chennai", title: "첸나이 주요 병원", content: "Apollo, Fortis, Korean Hospital 등 추천 병원 목록.", order: 5 },
    { category: "국제학교", region: "Chennai", title: "국제학교 안내", content: "Korea International School, AISC, HLC 등 학교 정보.", order: 6 },
    { category: "아파트", region: "Chennai", title: "주거 지역 가이드", content: "OMR, Anna Nagar, Adyar 등 주재원 선호 지역.", order: 7 },
    { category: "통신사", region: "Chennai", title: "인도 통신사 비교", content: "Jio, Airtel, Vi 등 선불/후불 요금제 비교.", order: 8 },
    {
      category: "게스트하우스",
      region: "Chennai",
      title: "첸나이 한인 게스트하우스 안내",
      content:
        "첸나이 방문·단기 체류 시 이용할 수 있는 한인 게스트하우스와 숙소 정보입니다. 위치, 예약 방법, 이용 요금 등을 한인회를 통해 안내받을 수 있습니다.",
      order: 9,
    },
    {
      category: "음식점",
      region: "Chennai",
      title: "첸나이 한인 음식점 안내",
      content:
        "첸나이에서 운영 중인 한식당·한인 음식점 목록입니다. 한인회 행사, 동호회 모임, 일상 식사에 활용할 수 있는 맛집 정보를 모았습니다.",
      order: 10,
    },
  ];

  const existingGuides = await prisma.guide.count();
  if (existingGuides === 0) {
    await prisma.guide.createMany({ data: guides });
  } else {
    for (const guide of guides.slice(8)) {
      const exists = await prisma.guide.findFirst({ where: { title: guide.title } });
      if (!exists) await prisma.guide.create({ data: guide });
    }
  }

  const dashboardItems = [
    { type: "exchange", value: "₩16.42", label: "1 INR", change: "+0.3%" },
    { type: "weather", value: "34°C", label: "Chennai · 맑음", change: "습도 72%" },
    { type: "flights", value: "ICN→MAA", label: "KE657 · 18:30", change: "정시" },
    { type: "holidays", value: "Aug 15", label: "인도 독립기념일", change: "D-64" },
    { type: "indiaGov", value: "GST 개정", label: "세금 정책 업데이트", change: "NEW" },
    { type: "embassy", value: "여권 갱신", label: "대사관 공지", change: "2일 전" },
    { type: "consulate", value: "비자 상담", label: "총영사관 안내", change: "오늘" },
  ];

  for (const item of dashboardItems) {
    await prisma.dashboardItem.upsert({
      where: { type: item.type },
      update: item,
      create: item,
    });
  }

  const freeBoard = await prisma.board.findUnique({ where: { slug: "free" } });
  if (freeBoard) {
    const postCount = await prisma.post.count();
    if (postCount === 0) {
      await prisma.post.create({
        data: {
          boardId: freeBoard.id,
          authorId: admin.id,
          title: "ICKOA 커뮤니티 플랫폼 오픈!",
          content: "재인도 첸나이 한인회 새 웹사이트가 오픈했습니다. 많은 이용 부탁드립니다.",
        },
      });
    }
  }

  await prisma.magazineIssue.upsert({
    where: { slug: "vol-16" },
    update: {},
    create: {
      slug: "vol-16",
      volume: 16,
      title: "다이나믹 코리안",
      subtitle: "재인도 첸나이 한인회보",
      publishedAt: "2023-12",
      coverImage: "/magazine/dynamic-korean-cover-vol17.png",
      pdfUrl: "/magazine/dynamic-korean-vol16.pdf",
      editorNote:
        "코로나의 아픔을 뒤로하고, 제16호 한인회보 발행을 시작으로 해가 가기 전에 기지개를 펴고 전열을 가다듬고자 합니다.",
      published: true,
    },
  });

  const heroCount = await prisma.heroSlide.count();
  if (heroCount === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          mediaType: "IMAGE",
          mediaUrl: "/image/hero-community.jpg",
          caption: "2022 첸나이 한인 골프대회 & 송년의 밤",
          captionEn: "2022 Chennai Korean Golf Tournament & Year-end Night",
          order: 0,
          active: true,
        },
        {
          mediaType: "IMAGE",
          mediaUrl: "/image/golf-officials.jpg",
          caption: "골프대회 운영진",
          captionEn: "Golf Tournament Organizers",
          order: 1,
          active: true,
        },
      ],
    });
  }

  const galleryCount = await prisma.galleryAlbum.count();
  if (galleryCount === 0) {
    for (let i = 0; i < galleryAlbums.length; i++) {
      const album = galleryAlbums[i];
      await prisma.galleryAlbum.create({
        data: {
          slug: album.id,
          title: album.title,
          titleEn: album.titleEn,
          description: album.description,
          descriptionEn: album.descriptionEn,
          cover: album.cover,
          category: album.category,
          order: i,
          photos: {
            create: album.photos.map((photo, pi) => ({
              src: photo.src,
              caption: photo.caption,
              date: photo.date ?? null,
              order: pi,
            })),
          },
        },
      });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
