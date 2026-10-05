import Link from "next/link";
import {
  MessageSquare,
  ShoppingBag,
  Briefcase,
  Home,
  Car,
  Megaphone,
  CalendarDays,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getBoards } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "커뮤니티",
  description: "첸나이 한인 교민 게시판 — 자유게시판, 중고장터, 구인구직, 주거정보",
  path: "/community",
});

export const dynamic = "force-dynamic";

const boardIcons: Record<string, LucideIcon> = {
  message: MessageSquare,
  shopping: ShoppingBag,
  briefcase: Briefcase,
  home: Home,
  car: Car,
  megaphone: Megaphone,
  calendar: CalendarDays,
  help: CircleHelp,
};

export default async function CommunityPage() {
  const boards = await getBoards();

  return (
    <>
      <PageHeader title="커뮤니티" subtitle="교민들과 소통하고 정보를 나누세요" />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        {boards.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            등록된 게시판이 없습니다.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {boards.map((board) => {
              const Icon = boardIcons[board.icon ?? ""] ?? MessageSquare;
              return (
                <Link
                  key={board.id}
                  href={`/community/${board.slug}`}
                  className="group flex items-start gap-3 border border-border bg-card p-4 transition-colors hover:border-brand hover:bg-accent"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-accent text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold tracking-tight text-foreground group-hover:text-brand">
                      {board.name}
                    </span>
                    <span className="mt-1 block text-[12px] text-muted-foreground">
                      게시글 {board._count.posts}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
