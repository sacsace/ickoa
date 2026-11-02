"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminDialog,
  type AdminDialogVariant,
} from "@/components/admin/admin-dialog";

type AdminAlertDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: AdminDialogVariant;
  onClose: () => void;
};

export function AdminAlertDialog({
  open,
  title = "알림",
  message,
  confirmLabel = "확인",
  variant = "default",
  onClose,
}: AdminAlertDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title={title}
      description={message}
      variant={variant}
      initialFocusRef={confirmRef}
      footer={
        <Button
          ref={confirmRef}
          type="button"
          size="sm"
          className="min-w-20"
          onClick={onClose}
        >
          {confirmLabel}
        </Button>
      }
    />
  );
}
