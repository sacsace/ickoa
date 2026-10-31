"use client";

import { AdminTaxonomyList } from "@/components/admin/admin-taxonomy";
import { deleteClub } from "@/actions/admin";

type Item = {
  id: string;
  name: string;
  slug: string;
  order: number;
  count: number;
  extra?: string | null;
};

export function AdminClubsList({ items }: { items: Item[] }) {
  return (
    <AdminTaxonomyList
      items={items.map((i) => ({ ...i, nameEn: null }))}
      config={{
        title: "동호회 카테고리",
        subtitle: `동호회 ${items.length}개`,
        backHref: "/admin",
        newHref: "/admin/clubs/new",
        editHref: (id) => `/admin/clubs/${id}`,
        writeLabel: "동호회 등록",
        countLabel: "회원",
        onDelete: deleteClub,
      }}
    />
  );
}
