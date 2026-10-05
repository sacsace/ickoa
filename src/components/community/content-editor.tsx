"use client";

import { useEffect, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizePostHtml } from "@/lib/sanitize-html";

type ContentEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

type Tool = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command?: string;
  value?: string;
  action?: () => void;
};

export function ContentEditor({
  value,
  onChange,
  placeholder = "내용",
  className,
}: ContentEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const synced = useRef(false);

  useEffect(() => {
    if (!ref.current || synced.current) return;
    ref.current.innerHTML = value || "";
    synced.current = true;
  }, [value]);

  function emitChange() {
    if (!ref.current) return;
    onChange(sanitizePostHtml(ref.current.innerHTML));
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
    "sep",
    { label: "실행취소", icon: Undo2, command: "undo" },
    { label: "다시실행", icon: Redo2, command: "redo" },
    { label: "서식제거", icon: RemoveFormatting, command: "removeFormat" },
  ];

  return (
    <div className={cn("border border-border bg-white", className)}>
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
          return (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                if (tool.action) tool.action();
                else if (tool.command) run(tool.command, tool.value);
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <div className="relative">
        {!value || value === "<br>" || value === "<p><br></p>" ? (
          <span className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">
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
          className="min-h-[280px] px-3 py-3 text-sm leading-relaxed outline-none [&_a]:text-brand [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>
    </div>
  );
}
