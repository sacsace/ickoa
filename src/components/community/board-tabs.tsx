import Link from "next/link";
import { cn } from "@/lib/utils";

type BoardTab = {
  slug: string;
  name: string;
  _count?: { posts: number };
};

export function BoardTabs({
  boards,
  activeSlug,
}: {
  boards: BoardTab[];
  activeSlug?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
      {boards.map((board) => {
        const active = board.slug === activeSlug;
        return (
          <Link
            key={board.slug}
            href={`/community/${board.slug}`}
            className={cn(
              "px-3 py-2 text-[13px] font-medium transition-colors",
              active
                ? "border-b-2 border-brand text-brand"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {board.name}
            {typeof board._count?.posts === "number" ? (
              <span className="ml-1 text-[11px] text-muted-foreground">
                ({board._count.posts})
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
