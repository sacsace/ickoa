"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Heading2,
  Quote,
  Undo2,
  Redo2,
  RemoveFormatting,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizePostHtml } from "@/lib/sanitize-html";

type ContentEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  /** 입력 영역 최소 높이(px). Tailwind 미적용 이슈 대비 인라인으로 적용 */
  minHeight?: number;
};

type Tool = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command?: string;
  value?: string;
  action?: () => void;
};

const IMAGE_SIZE_PRESETS = [
  { label: "25%", width: "25%" },
  { label: "50%", width: "50%" },
  { label: "75%", width: "75%" },
  { label: "100%", width: "100%" },
] as const;

export function ContentEditor({
  value,
  onChange,
  placeholder = "내용",
  className,
  editorClassName,
  minHeight = 280,
}: ContentEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const synced = useRef(false);
  const selectedImgRef = useRef<HTMLImageElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgWidthLabel, setImgWidthLabel] = useState("100%");
  const [handlePos, setHandlePos] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    if (!ref.current || synced.current) return;
    ref.current.innerHTML = value || "";
    synced.current = true;
  }, [value]);

  useEffect(() => {
    selectedImgRef.current = selectedImg;
  }, [selectedImg]);

  function updateHandlePos(img: HTMLImageElement | null) {
    const editor = ref.current;
    if (!img || !editor) {
      setHandlePos(null);
      return;
    }
    const wrap = editor.parentElement;
    if (!wrap) {
      setHandlePos(null);
      return;
    }
    const imgRect = img.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    setHandlePos({
      top: imgRect.bottom - wrapRect.top + wrap.scrollTop - 8,
      left: imgRect.right - wrapRect.left + wrap.scrollLeft - 8,
    });
  }

  useEffect(() => {
    updateHandlePos(selectedImg);
    if (!selectedImg || !ref.current) return;
    const editor = ref.current;
    const onScrollOrResize = () => updateHandlePos(selectedImgRef.current);
    editor.addEventListener("scroll", onScrollOrResize);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      editor.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [selectedImg]);

  useEffect(() => {
    function clearIfOutside(e: MouseEvent) {
      const img = selectedImgRef.current;
      if (!img) return;
      const target = e.target as Node | null;
      if (target && (img === target || img.contains(target))) return;
      if (
        target instanceof Element &&
        target.closest("[data-image-resize-ui]")
      ) {
        return;
      }
      img.classList.remove("is-selected");
      setSelectedImg(null);
      setHandlePos(null);
    }
    document.addEventListener("mousedown", clearIfOutside);
    return () => document.removeEventListener("mousedown", clearIfOutside);
  }, []);

  function emitChange() {
    if (!ref.current) return;
    const clone = ref.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("img.is-selected").forEach((el) => {
      el.classList.remove("is-selected");
    });
    onChange(sanitizePostHtml(clone.innerHTML));
  }

  function run(command: string, commandValue?: string) {
    ref.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function insertLink() {
    const url = window.prompt("링크 URL을 입력하세요", "https://");
    if (!url) return;
    run("createLink", url);
  }

  function selectImage(img: HTMLImageElement) {
    ref.current
      ?.querySelectorAll("img.is-selected")
      .forEach((el) => el.classList.remove("is-selected"));
    img.classList.add("is-selected");
    setSelectedImg(img);
    const width = img.style.width || "100%";
    setImgWidthLabel(width);
  }

  function applyImageWidth(width: string) {
    const img = selectedImgRef.current;
    if (!img) return;
    img.style.width = width;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.removeAttribute("width");
    img.removeAttribute("height");
    setImgWidthLabel(width);
    emitChange();
    requestAnimationFrame(() => updateHandlePos(img));
  }

  function startImageResize(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const img = selectedImgRef.current;
    const editor = ref.current;
    if (!img || !editor) return;

    const startX = e.clientX;
    const startWidth = img.getBoundingClientRect().width;
    const editorWidth = editor.clientWidth || 1;

    function onMove(ev: MouseEvent) {
      const delta = ev.clientX - startX;
      const nextPx = Math.max(80, startWidth + delta);
      const pct = Math.min(
        100,
        Math.max(10, Math.round((nextPx / editorWidth) * 100)),
      );
      img.style.width = `${pct}%`;
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      setImgWidthLabel(`${pct}%`);
      updateHandlePos(img);
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      emitChange();
      updateHandlePos(img);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function insertImageHtml(url: string, alt = "이미지") {
    ref.current?.focus();
    const safeAlt = alt.replace(/"/g, "");
    document.execCommand(
      "insertHTML",
      false,
      `<p><img src="${url}" alt="${safeAlt}" style="width: 100%; max-width: 100%; height: auto;" /></p><p><br></p>`,
    );
    emitChange();
    requestAnimationFrame(() => {
      const imgs = ref.current?.querySelectorAll("img");
      const last = imgs?.[imgs.length - 1] as HTMLImageElement | undefined;
      if (last) selectImage(last);
    });
  }

  async function uploadImageFile(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/content-image", {
        method: "POST",
        body,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "이미지 업로드에 실패했습니다.");
      }
      insertImageHtml(data.url, file.name);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function pickImage() {
    fileRef.current?.click();
  }

  async function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;
    e.preventDefault();
    await uploadImageFile(file);
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith("image/"),
    );
    if (!file) return;
    e.preventDefault();
    await uploadImageFile(file);
  }

  function onEditorClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target;
    if (target instanceof HTMLImageElement) {
      e.preventDefault();
      selectImage(target);
    }
  }

  const tools: (Tool | "sep")[] = [
    { label: "굵게", icon: Bold, command: "bold" },
    { label: "기울임", icon: Italic, command: "italic" },
    { label: "밑줄", icon: Underline, command: "underline" },
    { label: "취소선", icon: Strikethrough, command: "strikeThrough" },
    "sep",
    { label: "제목", icon: Heading2, command: "formatBlock", value: "h2" },
    { label: "인용", icon: Quote, command: "formatBlock", value: "blockquote" },
    "sep",
    { label: "글머리", icon: List, command: "insertUnorderedList" },
    { label: "번호", icon: ListOrdered, command: "insertOrderedList" },
    { label: "링크", icon: Link2, action: insertLink },
    { label: "이미지", icon: ImageIcon, action: pickImage },
    "sep",
    { label: "실행취소", icon: Undo2, command: "undo" },
    { label: "다시실행", icon: Redo2, command: "redo" },
    { label: "서식제거", icon: RemoveFormatting, command: "removeFormat" },
  ];

  const editorChrome =
    "[&_a]:text-brand [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_img]:relative [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:cursor-pointer [&_img]:rounded-lg [&_img.is-selected]:outline [&_img.is-selected]:outline-2 [&_img.is-selected]:outline-brand [&_img.is-selected]:outline-offset-2 [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5";

  return (
    <div className={cn("border border-border bg-white", className)}>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadImageFile(file);
        }}
      />
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-1.5 py-1">
        {tools.map((tool, i) => {
          if (tool === "sep") {
            return (
              <span
                key={`sep-${i}`}
                className="mx-1 h-5 w-px shrink-0 bg-border"
                aria-hidden
              />
            );
          }
          const Icon = tool.icon;
          const disabled = uploading && tool.label === "이미지";
          return (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              disabled={disabled}
              className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              onMouseDown={(e) => {
                e.preventDefault();
                if (disabled) return;
                if (tool.action) tool.action();
                else if (tool.command) run(tool.command, tool.value);
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        {uploading ? (
          <span className="ml-2 text-xs text-muted-foreground">업로드 중...</span>
        ) : null}
      </div>

      {selectedImg ? (
        <div
          data-image-resize-ui
          className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-3 py-2"
        >
          <span className="text-xs text-muted-foreground">이미지 크기</span>
          <div className="flex flex-wrap gap-1">
            {IMAGE_SIZE_PRESETS.map((preset) => (
              <button
                key={preset.width}
                type="button"
                className={cn(
                  "h-7 rounded border px-2 text-xs",
                  imgWidthLabel === preset.width
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-white text-foreground hover:bg-muted",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyImageWidth(preset.width);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            현재 {imgWidthLabel} · 모서리를 드래그해도 됩니다
          </span>
        </div>
      ) : null}

      <div className="relative w-full" style={{ minHeight }}>
        {!value || value === "<br>" || value === "<p><br></p>" ? (
          <span className="pointer-events-none absolute left-3 top-3 z-10 text-sm text-muted-foreground">
            {placeholder}
          </span>
        ) : null}
        <div
          ref={ref}
          role="textbox"
          aria-multiline
          aria-label={placeholder}
          contentEditable
          suppressContentEditableWarning
          style={{ minHeight }}
          className={cn(
            "block w-full overflow-y-auto px-3 py-3 text-sm leading-relaxed outline-none",
            editorChrome,
            editorClassName,
          )}
          onInput={emitChange}
          onBlur={emitChange}
          onPaste={onPaste}
          onClick={onEditorClick}
          onDragOver={(e) => {
            if (Array.from(e.dataTransfer.types).includes("Files")) {
              e.preventDefault();
            }
          }}
          onDrop={onDrop}
        />
        {selectedImg && handlePos ? (
          <button
            type="button"
            data-image-resize-ui
            aria-label="이미지 크기 조절"
            title="드래그하여 크기 조절"
            className="absolute z-20 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 border-white bg-brand shadow"
            style={{ top: handlePos.top, left: handlePos.left }}
            onMouseDown={startImageResize}
          />
        ) : null}
      </div>
    </div>
  );
}
