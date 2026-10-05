import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { BoardPostList } from "@/components/community/board-post-list";
import { BoardTabs } from "@/components/community/board-tabs";
import { getBoards, getPostsByBoard } from "@/lib/data";
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
  if (!board) {
    return createMetadata({ title: "커뮤니티", path: "/community" });
  }
  return createMetadata({
    title: board.name,
    description: `${board.name} — KAIC 커뮤니티 게시판`,
    path: `/community/${slug}`,
  });
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [board, boards, session] = await Promise.all([
    getPostsByBoard(slug),
    getBoards(),
    auth(),
  ]);
  if (!board) notFound();

  return (
    <>
      <PageHeader title={board.name} backHref="/community" />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <BoardTabs boards={boards} activeSlug={slug} />
        <BoardPostList
          boardSlug={slug}
          posts={board.posts}
          currentUserId={session?.user?.id}
        />
      </div>
    </>
  );
}
