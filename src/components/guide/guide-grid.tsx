import Link from "next/link";

type GuideItem = {
  id: string;
  category: string;
  region: string;
  title: string;
};

export function GuideGrid({ guides }: { guides: GuideItem[] }) {
  if (guides.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
        등록된 가이드가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <Link
          key={guide.id}
          href={`/guide/${guide.id}`}
          className="hover-lift rounded-2xl border border-border bg-card p-6 md:rounded-3xl"
        >
          <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {guide.category}
          </span>
          <h2 className="mt-2 font-bold text-foreground">{guide.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{guide.region}</p>
        </Link>
      ))}
    </div>
  );
}
