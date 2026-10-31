"use client";

import { AdminTaxonomyForm } from "@/components/admin/admin-taxonomy";
import { createBusinessCategory, updateBusinessCategory } from "@/actions/admin";

export function AdminBusinessCategoryForm({
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
      title={mode === "edit" ? "업종 수정" : "업종 등록"}
      backHref="/admin/businesses/categories"
      listHref="/admin/businesses/categories"
      initial={category}
      onSubmit={async (data) => {
        if (mode === "edit" && category) {
          await updateBusinessCategory(category.id, data);
        } else {
          await createBusinessCategory(data);
        }
      }}
    />
  );
}
