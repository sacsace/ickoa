import Link from "next/link";
import { guideTopicLinks } from "@/data/guide";
import { cn } from "@/lib/utils";

export function GuideTopicNav({ activeHref }: { activeHref: string }) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {guideTopicLinks.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "rounded-lg px-3 py-2 text-xs font-medium transition-all",
            activeHref === item.href
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          {item.labelKo}
        </Link>
      ))}
    </div>
  );
}
