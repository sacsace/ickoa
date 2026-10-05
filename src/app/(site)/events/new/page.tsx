import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EventForm } from "@/components/events/event-form";
import { auth } from "@/lib/auth";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "행사 등록",
  description: "한인회 행사 및 커뮤니티 이벤트 등록",
  path: "/events/new",
});

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/events/new")}`);
  }

  return (
    <>
      <PageHeader title="행사 등록" backHref="/events" />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <EventForm />
      </div>
    </>
  );
}
