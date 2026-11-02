"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { AdminDialog } from "@/components/admin/admin-dialog";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AdminDialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      variant={destructive ? "destructive" : "default"}
      initialFocusRef={cancelRef}
      footer={
        <>
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            size="sm"
            className="min-w-20"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            className={
              destructive
                ? "min-w-20 bg-red-600 hover:bg-red-700"
                : "min-w-20"
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "처리 중..." : confirmLabel}
          </Button>
        </>
      }
    />
  );
}
