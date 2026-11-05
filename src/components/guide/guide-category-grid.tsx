import Link from "next/link";
import { guideCategoryPath, guideDisplayName } from "@/data/guide";

type CategoryItem = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  itemCount: number;
};

export function GuideCategoryGrid({ categories }: { categories: CategoryItem[] }) {
  if (categories.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
        등록된 카테고리가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={guideCategoryPath(category)}
          className="hover-lift rounded-2xl border border-border bg-card p-6 md:rounded-3xl"
        >
          <p className="text-xs text-muted-foreground">카테고리</p>
          <h2 className="mt-2 font-bold text-foreground">
            {guideDisplayName(category.name)}
          </h2>
          {category.nameEn ? (
            <p className="mt-1 text-xs text-muted-foreground">{category.nameEn}</p>
          ) : null}
          <p className="mt-4 text-sm text-muted-foreground">
            세부 항목 {category.itemCount}개
          </p>
        </Link>
      ))}
    </div>
  );
}
