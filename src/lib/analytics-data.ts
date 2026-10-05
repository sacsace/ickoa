import { prisma } from "@/lib/prisma";

const emptySummary = {
  views: { today: 0, week: 0, month: 0, all: 0 },
  visitors: { today: 0, week: 0, month: 0, all: 0 },
  daily: [] as { date: string; views: number; visitors: number }[],
  topPages: [] as { path: string; count: number }[],
  topReferrers: [] as { referrer: string; count: number }[],
};

function pageViewClient() {
  if (!("pageView" in prisma)) return null;
  return prisma.pageView;
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getAnalyticsSummary() {
  const pageView = pageViewClient();
  if (!pageView) return emptySummary;

  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = daysAgo(6);
  const monthAgo = daysAgo(29);
  const chartStart = daysAgo(13);

  const [
    viewsToday,
    viewsWeek,
    viewsMonth,
    viewsAll,
    visitorsTodayRows,
    visitorsWeekRows,
    visitorsMonthRows,
    visitorsAllRows,
    recentViews,
    topPagesRaw,
    topReferrersRaw,
  ] = await Promise.all([
    pageView.count({ where: { createdAt: { gte: today } } }),
    pageView.count({ where: { createdAt: { gte: weekAgo } } }),
    pageView.count({ where: { createdAt: { gte: monthAgo } } }),
    pageView.count(),
    pageView.findMany({
      where: { createdAt: { gte: today } },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    pageView.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    pageView.findMany({
      where: { createdAt: { gte: monthAgo } },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    pageView.findMany({
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    pageView.findMany({
      where: { createdAt: { gte: chartStart } },
      select: { visitorId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: monthAgo } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    pageView.groupBy({
      by: ["referrer"],
      where: { createdAt: { gte: monthAgo } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
  ]);

  const dailyMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (let i = 13; i >= 0; i--) {
    const key = formatDateKey(daysAgo(i));
    dailyMap.set(key, { views: 0, visitors: new Set() });
  }

  for (const row of recentViews) {
    const key = formatDateKey(row.createdAt);
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    bucket.views += 1;
    bucket.visitors.add(row.visitorId);
  }

  const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    views: data.views,
    visitors: data.visitors.size,
  }));

  return {
    views: {
      today: viewsToday,
      week: viewsWeek,
      month: viewsMonth,
      all: viewsAll,
    },
    visitors: {
      today: visitorsTodayRows.length,
      week: visitorsWeekRows.length,
      month: visitorsMonthRows.length,
      all: visitorsAllRows.length,
    },
    daily,
    topPages: topPagesRaw.map((row) => ({
      path: row.path,
      count: row._count.path,
    })),
    topReferrers: topReferrersRaw.map((row) => ({
      referrer: row.referrer?.trim() || "(직접 유입)",
      count: row._count.referrer,
    })),
  };
}

export async function getTodayVisitorCount() {
  const pageView = pageViewClient();
  if (!pageView) return 0;

  const today = startOfDay();
  const rows = await pageView.findMany({
    where: { createdAt: { gte: today } },
    select: { visitorId: true },
    distinct: ["visitorId"],
  });
  return rows.length;
}
