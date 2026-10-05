import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { getAnalyticsSummary } from "@/lib/analytics-data";

type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsSummary>>;

function StatCard({ label, views, visitors }: { label: string; views: number; visitors: number }) {
  return (
    <div className="border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{visitors.toLocaleString()}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        방문자 · 조회 {views.toLocaleString()}회
      </p>
    </div>
  );
}

export function AdminAnalyticsClient({ data }: { data: AnalyticsData }) {
  const maxViews = Math.max(...data.daily.map((d) => d.views), 1);

  return (
    <div>
      <AdminPageHeader title="유입 분석" subtitle="사이트 방문자 및 페이지 조회" />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="오늘" views={data.views.today} visitors={data.visitors.today} />
        <StatCard label="최근 7일" views={data.views.week} visitors={data.visitors.week} />
        <StatCard label="최근 30일" views={data.views.month} visitors={data.visitors.month} />
        <StatCard label="전체" views={data.views.all} visitors={data.visitors.all} />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-medium">최근 14일 추이</h2>
        <div className="space-y-2 border border-border p-4">
          {data.daily.map((day) => (
            <div key={day.date} className="grid grid-cols-[5.5rem_1fr_4rem_4rem] items-center gap-3 text-sm">
              <span className="text-muted-foreground">{day.date.slice(5)}</span>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-brand"
                  style={{ width: `${Math.max((day.views / maxViews) * 100, day.views > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="text-right text-muted-foreground">{day.visitors}명</span>
              <span className="text-right">{day.views}회</span>
            </div>
          ))}
          {data.daily.every((d) => d.views === 0) && (
            <p className="py-6 text-center text-sm text-muted-foreground">아직 수집된 방문 데이터가 없습니다.</p>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">막대: 조회수 · 오른쪽: 방문자 수 / 조회 수</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-medium">인기 페이지 (30일)</h2>
          <ul className="divide-y divide-border border border-border">
            {data.topPages.map((row) => (
              <li key={row.path} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="truncate pr-4">{row.path}</span>
                <span className="shrink-0 text-muted-foreground">{row.count}</span>
              </li>
            ))}
            {data.topPages.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">데이터 없음</li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium">유입 경로 (30일)</h2>
          <ul className="divide-y divide-border border border-border">
            {data.topReferrers.map((row) => (
              <li key={row.referrer} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="truncate">{row.referrer}</span>
                <span className="shrink-0 text-muted-foreground">{row.count}</span>
              </li>
            ))}
            {data.topReferrers.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">데이터 없음</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
