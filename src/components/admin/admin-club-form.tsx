"use client";

import { AdminTaxonomyForm } from "@/components/admin/admin-taxonomy";
import { createClub, updateClub } from "@/actions/admin";

export function AdminClubForm({
  mode,
  club,
}: {
  mode: "create" | "edit";
  club?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    order?: number;
  };
}) {
  return (
    <AdminTaxonomyForm
      mode={mode}
      title={mode === "edit" ? "동호회 수정" : "동호회 등록"}
      backHref="/admin/clubs"
      listHref="/admin/clubs"
      showNameEn={false}
      showDescription
      showIcon
      initial={
        club
          ? {
              name: club.name,
              slug: club.slug,
              order: club.order ?? 0,
              description: club.description,
              icon: club.icon,
            }
          : undefined
      }
      onSubmit={async (data) => {
        if (mode === "edit" && club) {
          await updateClub(club.id, data);
        } else {
          await createClub(data);
        }
      }}
    />
  );
}
