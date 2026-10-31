"use client";

import { AdminTaxonomyList } from "@/components/admin/admin-taxonomy";
import { deleteBusinessCategory } from "@/actions/admin";

type Item = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  order: number;
  count: number;
};

export function AdminBusinessCategoriesList({ items }: { items: Item[] }) {
  return (
    <AdminTaxonomyList
      items={items}
      config={{
        title: "한인기업 업종",
        subtitle: `총 ${items.length}개`,
        backHref: "/admin/businesses",
        newHref: "/admin/businesses/categories/new",
        editHref: (id) => `/admin/businesses/categories/${id}`,
        writeLabel: "업종 등록",
        countLabel: "기업",
        onDelete: deleteBusinessCategory,
      }}
    />
  );
}
