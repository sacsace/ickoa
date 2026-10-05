const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h2",
  "h3",
  "a",
  "div",
  "span",
]);

const ALLOWED_ATTRS = new Set(["href", "target", "rel", "class"]);

/** 게시글 HTML 저장/표시용 간단 새니타이즈 */
export function sanitizePostHtml(html: string) {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<\/?(?:iframe|object|embed|form|input|button|style)[^>]*>/gi, "")
      .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
      .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, "");
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) {
          el.replaceWith(...Array.from(el.childNodes));
          continue;
        }
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          if (!ALLOWED_ATTRS.has(name)) {
            el.removeAttribute(attr.name);
            continue;
          }
          if (name === "href") {
            const href = attr.value.trim();
            if (/^javascript:/i.test(href)) {
              el.removeAttribute("href");
            } else {
              el.setAttribute("rel", "noopener noreferrer");
              if (href.startsWith("http")) el.setAttribute("target", "_blank");
            }
          }
        }
        walk(el);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child);
      }
    }
  };

  walk(template.content);
  return template.innerHTML;
}

export function isHtmlContent(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

export function plainTextFromHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
