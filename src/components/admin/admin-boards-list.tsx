"use client";

import { AdminTaxonomyList } from "@/components/admin/admin-taxonomy";
import { deleteBoard } from "@/actions/admin";

type Item = {
  id: string;
  name: string;
  slug: string;
  order: number;
  count: number;
  extra?: string | null;
};

export function AdminBoardsList({ items }: { items: Item[] }) {
  return (
    <AdminTaxonomyList
      items={items.map((i) => ({ ...i, nameEn: null }))}
      config={{
        title: "커뮤니티 카테고리",
        subtitle: `게시판 ${items.length}개`,
        backHref: "/admin/posts",
        newHref: "/admin/boards/new",
        editHref: (id) => `/admin/boards/${id}`,
        writeLabel: "게시판 등록",
        countLabel: "게시글",
        onDelete: deleteBoard,
      }}
    />
  );
}
