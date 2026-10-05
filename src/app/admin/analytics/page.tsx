import { AdminAnalyticsClient } from "@/components/admin/admin-analytics";
import { getAnalyticsSummary } from "@/lib/analytics-data";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsSummary();
  return <AdminAnalyticsClient data={data} />;
}
