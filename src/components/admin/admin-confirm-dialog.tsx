"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-desc"
        className="relative w-full max-w-md border border-border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-confirm-title" className="text-base font-semibold text-foreground">
          {title}
        </h2>
        <p id="admin-confirm-desc" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={destructive ? "primary" : "primary"}
            className={destructive ? "bg-red-600 hover:bg-red-700" : undefined}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "처리 중..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
