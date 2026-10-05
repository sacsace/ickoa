import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnalyticsTracker } from "@/components/analytics/tracker";

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
