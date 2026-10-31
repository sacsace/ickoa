"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AlertVariant = "default" | "success" | "error";

export type AlertOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: AlertVariant;
};

type AlertState = AlertOptions & {
  open: boolean;
};

type AlertFn = (options: AlertOptions | string) => Promise<void>;

const AlertContext = createContext<AlertFn | null>(null);

export function useAlert() {
  const alert = useContext(AlertContext);
  if (!alert) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return alert;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertState>({
    open: false,
    message: "",
  });
  const resolverRef = useRef<(() => void) | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    resolverRef.current?.();
    resolverRef.current = null;
  }, []);

  const showAlert = useCallback<AlertFn>((options) => {
    const next: AlertOptions =
      typeof options === "string" ? { message: options } : options;
    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
      setState({
        open: true,
        title: next.title ?? "알림",
        message: next.message,
        confirmLabel: next.confirmLabel ?? "확인",
        variant: next.variant ?? "default",
      });
    });
  }, []);

  useEffect(() => {
    if (!state.open) return;
    confirmRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") close();
    }

    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [state.open, close]);

  const value = useMemo(() => showAlert, [showAlert]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      {state.open ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          role="presentation"
          onClick={close}
        >
          <div className="absolute inset-0 bg-black/45" aria-hidden />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="site-alert-title"
            aria-describedby="site-alert-desc"
            className="relative w-full max-w-md border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "mb-4 h-1 w-12",
                state.variant === "success"
                  ? "bg-emerald-600"
                  : state.variant === "error"
                    ? "bg-red-600"
                    : "bg-foreground",
              )}
            />
            <h2
              id="site-alert-title"
              className="text-base font-semibold tracking-tight text-foreground"
            >
              {state.title}
            </h2>
            <p
              id="site-alert-desc"
              className="mt-2 text-sm leading-relaxed text-muted-foreground"
            >
              {state.message}
            </p>
            <div className="mt-6 flex justify-end">
              <Button
                ref={confirmRef}
                type="button"
                size="sm"
                className="min-w-20 whitespace-nowrap"
                onClick={close}
              >
                {state.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AlertContext.Provider>
  );
}
