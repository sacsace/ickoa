import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GuideDeleteButton } from "@/components/guide/guide-delete-button";
import { guideWriteLabel } from "@/data/guide";

type GuideItem = {
  id: string;
  category: string;
  region: string;
  title: string;
  createdById?: string | null;
};

export function GuideGrid({
  guides,
  currentUserId,
}: {
  guides: GuideItem[];
  currentUserId?: string | null;
}) {
  if (guides.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
        등록된 가이드가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => {
        const canManage =
          !!currentUserId &&
          !!guide.createdById &&
          guide.createdById === currentUserId;

        return (
          <div
            key={guide.id}
            className="hover-lift flex flex-col rounded-2xl border border-border bg-card p-6 md:rounded-3xl"
          >
            <Link href={`/guide/${guide.id}`} className="min-w-0 flex-1">
              <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {guideWriteLabel(guide.category)}
              </span>
              <h2 className="mt-2 font-bold text-foreground">{guide.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{guide.region}</p>
            </Link>
            {canManage ? (
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                <Link href={`/guide/${guide.id}/edit`} className="flex-1">
                  <Button type="button" variant="outline" size="sm" className="w-full">
                    수정
                  </Button>
                </Link>
                <GuideDeleteButton
                  guideId={guide.id}
                  title={guide.title}
                  category={guide.category}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
