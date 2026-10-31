import { RichHtmlBody } from "@/components/ui/rich-html-body";

export function GuideBody({ content }: { content: string }) {
  return <RichHtmlBody content={content} />;
}
