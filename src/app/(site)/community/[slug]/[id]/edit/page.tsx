import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PostForm } from "@/components/community/post-form";
import { getPost } from "@/lib/data";
import { auth } from "@/lib/auth";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const post = await getPost(id);
  return createMetadata({
    title: post ? `${post.title} 수정` : "글 수정",
    path: `/community/${slug}/${id}/edit`,
  });
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/community/${slug}/${id}/edit`)}`,
    );
  }

  const post = await getPost(id);
  if (!post || post.board.slug !== slug) notFound();
  if (post.authorId !== session.user.id) {
    redirect(`/community/${slug}/${id}`);
  }

  return (
    <>
      <PageHeader title="글 수정" backHref={`/community/${slug}/${id}`} />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <PostForm
          boardSlug={slug}
          mode="edit"
          post={{ id: post.id, title: post.title, content: post.content }}
        />
      </div>
    </>
  );
}
