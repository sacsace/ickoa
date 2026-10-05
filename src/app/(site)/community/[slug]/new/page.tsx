import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PostForm } from "@/components/community/post-form";
import { getPostsByBoard } from "@/lib/data";
import { auth } from "@/lib/auth";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getPostsByBoard(slug);
  return createMetadata({
    title: board ? `${board.name} 글쓰기` : "글쓰기",
    path: `/community/${slug}/new`,
  });
}

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/community/${slug}/new`)}`);
  }

  const board = await getPostsByBoard(slug);
  if (!board) notFound();

  return (
    <>
      <PageHeader title="글 등록" backHref={`/community/${slug}`} />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <PostForm boardSlug={slug} mode="create" />
      </div>
    </>
  );
}
