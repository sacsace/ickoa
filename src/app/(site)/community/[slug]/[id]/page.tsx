import { notFound } from "next/navigation";
import { getPost } from "@/lib/data";
import { auth } from "@/lib/auth";
import { PostDetailClient } from "@/components/community/post-detail";
import { createMetadata, truncateDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const post = await getPost(id);
  if (!post) {
    return createMetadata({ title: "게시글", path: `/community/${slug}` });
  }
  return createMetadata({
    title: post.title,
    description: truncateDescription(post.content),
    path: `/community/${slug}/${id}`,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const [post, session] = await Promise.all([getPost(id), auth()]);
  if (!post || post.board.slug !== slug) notFound();

  return (
    <PostDetailClient post={post} currentUserId={session?.user?.id} />
  );
}
