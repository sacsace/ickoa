import { redirect } from "next/navigation";

export default async function ClubNoticesRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/clubs/${encodeURIComponent(slug)}`);
}
