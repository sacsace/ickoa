"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminFileUploadProps = {
  name: string;
  accept: string;
  disabled?: boolean;
  hint?: string;
  onFileChange?: (file: File | null) => void;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminFileUpload({
  name,
  accept,
  disabled,
  hint,
  onFileChange,
}: AdminFileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(next: File | null) {
    setFile(next);
    onFileChange?.(next);
    if (inputRef.current) {
      const dt = new DataTransfer();
      if (next) dt.items.add(next);
      inputRef.current.files = dt.files;
    }
  }

  function handleFiles(files: FileList | null) {
    const next = files?.[0] ?? null;
    pickFile(next);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!file ? (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (disabled) return;
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors",
            dragOver && "border-brand bg-brand/5",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            클릭하거나 파일을 끌어다 놓으세요
          </span>
          {hint && <span className="max-w-md text-xs leading-relaxed text-muted-foreground">{hint}</span>}
        </label>
      ) : (
        <div className="border border-border bg-muted/20 p-3">
          <div className="flex items-start gap-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-20 w-32 shrink-0 object-cover" />
            ) : (
              <div className="flex h-20 w-32 shrink-0 items-center justify-center bg-muted text-xs text-muted-foreground">
                미리보기 없음
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => pickFile(null)}
                className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                파일 제거
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
