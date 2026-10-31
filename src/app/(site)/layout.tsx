import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnalyticsTracker } from "@/components/analytics/tracker";

/** Docker/Railway builds use a placeholder DATABASE_URL; skip static DB prerender. */
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsTracker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
