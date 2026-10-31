"use client";

export function FieldPrivacyLabel({
  label,
  required,
  hide,
  onHideChange,
}: {
  label: string;
  required?: boolean;
  hide?: boolean;
  onHideChange?: (hide: boolean) => void;
}) {
  return (
    <div className="mb-1 flex items-center justify-between gap-2">
      <label className="block text-xs text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      {onHideChange ? (
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-[11px] text-muted-foreground">
          <input
            type="checkbox"
            checked={!!hide}
            onChange={(e) => onHideChange(e.target.checked)}
            className="h-3.5 w-3.5"
            suppressHydrationWarning
          />
          비공개
        </label>
      ) : null}
    </div>
  );
}
