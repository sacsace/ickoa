"use client";

import { AdminTaxonomyForm } from "@/components/admin/admin-taxonomy";
import { createBoard, updateBoard } from "@/actions/admin";

export function AdminBoardForm({
  mode,
  board,
}: {
  mode: "create" | "edit";
  board?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    order?: number;
  };
}) {
  return (
    <AdminTaxonomyForm
      mode={mode}
      title={mode === "edit" ? "게시판 수정" : "게시판 등록"}
      backHref="/admin/boards"
      listHref="/admin/boards"
      showNameEn={false}
      showIcon
      initial={
        board
          ? {
              name: board.name,
              slug: board.slug,
              order: board.order ?? 0,
              icon: board.icon,
            }
          : undefined
      }
      onSubmit={async (data) => {
        if (mode === "edit" && board) {
          await updateBoard(board.id, data);
        } else {
          await createBoard(data);
        }
      }}
    />
  );
}
