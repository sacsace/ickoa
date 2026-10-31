import Link from "next/link";
import {
  guideCategoryPathBySlug,
  guideDisplayName,
} from "@/data/guide";
import { cn } from "@/lib/utils";

type CategoryNavItem = {
  id: string;
  slug: string;
  name: string;
};

export function GuideTopicNav({
  categories,
  activeSlug,
}: {
  categories: CategoryNavItem[];
  activeSlug?: string | null;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Link
        href="/guide"
        className={cn(
          "rounded-lg px-3 py-2 text-xs font-medium transition-all",
          !activeSlug
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground hover:text-foreground",
        )}
      >
        전체
      </Link>
      {categories.map((item) => (
        <Link
          key={item.id}
          href={guideCategoryPathBySlug(item.slug)}
          className={cn(
            "rounded-lg px-3 py-2 text-xs font-medium transition-all",
            activeSlug === item.slug
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          {guideDisplayName(item.name)}
        </Link>
      ))}
    </div>
  );
}
