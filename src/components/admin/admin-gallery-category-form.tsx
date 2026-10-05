"use client";

import { AdminTaxonomyForm } from "@/components/admin/admin-taxonomy";
import { createGalleryCategory, updateGalleryCategory } from "@/actions/admin";

export function AdminGalleryCategoryForm({
  mode,
  category,
}: {
  mode: "create" | "edit";
  category?: {
    id: string;
    name: string;
    nameEn: string | null;
    slug: string;
    order: number;
  };
}) {
  return (
    <AdminTaxonomyForm
      mode={mode}
      title={mode === "edit" ? "갤러리 카테고리 수정" : "갤러리 카테고리 등록"}
      backHref="/admin/gallery/categories"
      listHref="/admin/gallery/categories"
      initial={category}
      onSubmit={async (data) => {
        if (mode === "edit" && category) {
          await updateGalleryCategory(category.id, data);
        } else {
          await createGalleryCategory(data);
        }
      }}
    />
  );
}
