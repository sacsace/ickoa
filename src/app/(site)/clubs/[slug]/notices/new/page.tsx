import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClubNoticeNewRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/clubs/${encodeURIComponent(slug)}`);
}
