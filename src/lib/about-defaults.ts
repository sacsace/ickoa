import { prisma } from "@/lib/prisma";
import { inferLeadershipLevel } from "@/lib/leadership";

const DEFAULT_BYLAW = {
  kind: "bylaws",
  title: "제1장 총칙",
  content:
    "제1조 (명칭) 본 회는 재인도 첸나이 한인회(Korean Association in Chennai)라 칭한다.\n제2조 (목적) 본 회는 남인도 지역 한인 교민의 상호 협력과 복리 증진을 도모한다.",
  order: 1,
  published: true,
};

const DEFAULT_HISTORY = [
  { year: "1985", title: "재인도 첸나이 한인회 창립", order: 1 },
  { year: "1995", title: "한인회관 건립", order: 2 },
  {
    year: "2005",
    title: "현대차 스리페룸부두르 공장 진출과 함께 회원 급증",
    order: 3,
  },
  { year: "2015", title: "남인도 한인 기업 네트워크 출범", order: 4 },
  { year: "2026", title: "차세대 디지털 커뮤니티 플랫폼 런칭", order: 5 },
];

const DEFAULT_REPORT = {
  year: 2025,
  title: "2025년 활동 보고서",
  content:
    "- 정기 모임 12회\n- 신규 주재원 오리엔테이션 4회\n- 기업 네트워킹 데이 2회\n- 문화 행사 6회",
  order: 1,
  published: true,
};

const DEFAULT_LEADERSHIP = [
  { name: "김○○", role: "회장", level: 1, order: 1, published: true },
  { name: "이○○", role: "부회장", level: 2, order: 1, published: true },
  { name: "박○○", role: "부회장", level: 2, order: 2, published: true },
  { name: "최○○", role: "사무총장", level: 3, order: 1, published: true },
  { name: "정○○", role: "재무", level: 3, order: 2, published: true },
  { name: "한○○", role: "문화", level: 3, order: 3, published: true },
];

async function backfillLeadershipLevels() {
  try {
    const members = await prisma.leadershipMember.findMany({
      select: { id: true, role: true, order: true },
    });
    if (members.length === 0) return;

    const roles = members.map((m) => m.role);
    const hasHierarchy =
      roles.some((r) => r.includes("회장") && !r.includes("부")) &&
      roles.some((r) => r.includes("부회장") || r.includes("사무"));
    if (!hasHierarchy) return;

    await prisma.$transaction(
      members.map((m) =>
        prisma.leadershipMember.update({
          where: { id: m.id },
          data: { level: inferLeadershipLevel(m.role) },
        }),
      ),
    );
  } catch {
    // Schema/client may not have `level` yet (local generate or db push pending).
  }
}

/** 초기 데이터가 없으면 기본값을 한 번 채워 넣습니다. */
export async function ensureAboutDefaults() {
  const [bylawCount, historyCount, reportCount, leadershipCount] =
    await Promise.all([
      prisma.aboutDocument.count({ where: { kind: "bylaws" } }),
      prisma.historyEntry.count(),
      prisma.activityReport.count(),
      prisma.leadershipMember.count(),
    ]);

  if (bylawCount === 0) {
    await prisma.aboutDocument.create({ data: DEFAULT_BYLAW });
  }
  if (historyCount === 0) {
    await prisma.historyEntry.createMany({ data: DEFAULT_HISTORY });
  }
  if (reportCount === 0) {
    await prisma.activityReport.create({ data: DEFAULT_REPORT });
  }
  if (leadershipCount === 0) {
    await prisma.leadershipMember.createMany({ data: DEFAULT_LEADERSHIP });
  } else {
    await backfillLeadershipLevels();
  }
}
