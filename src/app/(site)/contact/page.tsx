import { PageHeader } from "@/components/ui/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { getContactEmail } from "@/lib/mail";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "문의하기",
  description: "첸나이한인회 문의 및 상담",
  path: "/contact",
});

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const contactEmail = await getContactEmail();

  return (
    <>
      <PageHeader
        title="문의하기"
        subtitle="한인회 운영, 행사, 생활 정보 관련 문의를 남겨 주세요"
        backHref="/about"
      />
      <div className="mx-auto w-full max-w-[1356px] px-4 py-12 md:px-6 lg:px-8">
        <div className="mb-6 text-sm text-muted-foreground">
          직접 메일이 필요하시면{" "}
          <a href={`mailto:${contactEmail}`} className="text-foreground underline">
            {contactEmail}
          </a>
          으로 연락해 주세요.
        </div>
        <ContactForm />
      </div>
    </>
  );
}
