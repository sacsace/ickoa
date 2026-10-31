import { redirect } from "next/navigation";

export default async function ClubNoticeDetailRedirectPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug } = await params;
  redirect(`/clubs/${encodeURIComponent(slug)}`);
}
