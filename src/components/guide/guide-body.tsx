import { isHtmlContent, sanitizePostHtml } from "@/lib/sanitize-html";

const bodyClassName =
  "text-sm leading-relaxed text-foreground [&_a]:text-brand [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5";

export function GuideBody({ content }: { content: string }) {
  if (isHtmlContent(content)) {
    return (
      <div
        className={bodyClassName}
        dangerouslySetInnerHTML={{ __html: sanitizePostHtml(content) }}
      />
    );
  }

  return (
    <p className="whitespace-pre-wrap leading-relaxed text-foreground">{content}</p>
  );
}
