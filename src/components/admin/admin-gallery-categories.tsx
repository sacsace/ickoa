"use client";

import { AdminTaxonomyList } from "@/components/admin/admin-taxonomy";
import { deleteGalleryCategory } from "@/actions/admin";

type Item = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  order: number;
  count: number;
};

export function AdminGalleryCategoriesList({ items }: { items: Item[] }) {
  return (
    <AdminTaxonomyList
      items={items}
      config={{
        title: "갤러리 카테고리",
        subtitle: `총 ${items.length}개`,
        backHref: "/admin/gallery",
        newHref: "/admin/gallery/categories/new",
        editHref: (id) => `/admin/gallery/categories/${id}`,
        writeLabel: "카테고리 등록",
        countLabel: "앨범",
        onDelete: deleteGalleryCategory,
      }}
    />
  );
}
