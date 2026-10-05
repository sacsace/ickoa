import { PageHeader } from "@/components/ui/page-header";
import { DonateForm } from "@/components/donate/donate-form";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "후원하기",
  description: "재인도 첸나이 한인회(ICKOA) 후원 — 커뮤니티 운영을 함께 지원해 주세요",
  path: "/donate",
});

export default function DonatePage() {
  return (
    <>
      <PageHeader
        title="후원하기"
        subtitle="Support the Korean Association in Chennai"
        backHref="/"
      />
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        <div className="mb-10 rounded-2xl border border-border bg-accent/40 p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            ICKOA는 1980년대부터 첸나이 교민을 위해 문화 행사, 한인회보, 커뮤니티
            프로그램을 운영해 왔습니다. 여러분의 후원은 교민 행사, 신규 주재원 지원,
            한인회보 발행 등에 사용됩니다.
          </p>
        </div>
        <DonateForm razorpayConfigured={isRazorpayConfigured()} />
      </div>
    </>
  );
}
