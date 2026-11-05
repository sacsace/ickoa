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
  "img",
  "figure",
  "figcaption",
]);

const ALLOWED_ATTRS = new Set([
  "href",
  "target",
  "rel",
  "class",
  "src",
  "alt",
  "width",
  "height",
  "loading",
  "style",
]);

function isSafeSrc(value: string) {
  const src = value.trim();
  if (!src) return false;
  if (/^javascript:/i.test(src)) return false;
  if (/^(https?:|\/|data:image\/)/i.test(src)) return true;
  return false;
}

/** img 크기 조절용 style만 허용 (width / max-width / height) */
export function sanitizeInlineStyle(value: string) {
  const allowed: string[] = [];
  for (const part of value.split(";")) {
    const [rawProp, ...rest] = part.split(":");
    if (!rawProp || rest.length === 0) continue;
    const prop = rawProp.trim().toLowerCase();
    const val = rest.join(":").trim().toLowerCase();
    if (!["width", "max-width", "height"].includes(prop)) continue;
    if (!/^(\d+(\.\d+)?(%|px)|auto)$/.test(val)) continue;
    allowed.push(`${prop}: ${val}`);
  }
  return allowed.join("; ");
}

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
          // img 등 void 요소는 unwrap 시 내용이 없으므로 그냥 제거
          if (tag === "img") {
            el.remove();
          } else {
            el.replaceWith(...Array.from(el.childNodes));
          }
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
          if (name === "src") {
            if (!isSafeSrc(attr.value)) {
              el.removeAttribute("src");
            }
          }
          if (name === "style") {
            const cleaned = sanitizeInlineStyle(attr.value);
            if (cleaned) el.setAttribute("style", cleaned);
            else el.removeAttribute("style");
          }
        }
        if (tag === "img" && !el.getAttribute("src")) {
          el.remove();
          continue;
        }
        if (tag === "img" && !el.getAttribute("loading")) {
          el.setAttribute("loading", "lazy");
        }
        if (tag === "img") {
          const cls = (el.getAttribute("class") || "")
            .split(/\s+/)
            .filter((c) => c && c !== "is-selected" && !c.startsWith("ProseMirror"));
          if (cls.length) el.setAttribute("class", cls.join(" "));
          else el.removeAttribute("class");
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

/** 본문 HTML에서 첫 이미지 src (썸네일 후보) */
export function firstImageSrcFromHtml(html?: string | null) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src\s*=\s*(["'])(.*?)\1/i);
  const src = match?.[2]?.trim();
  if (!src || !isSafeSrc(src)) return null;
  return src;
}

export function eventCoverImage(event: {
  image?: string | null;
  description?: string | null;
}) {
  const direct = event.image?.trim();
  if (direct) return direct;
  return firstImageSrcFromHtml(event.description);
}

/** 첨부 썸네일이 없으면 본문 첫 이미지를 카드 썸네일로 사용 */
export function newsCoverImage(news: {
  image?: string | null;
  content?: string | null;
}) {
  const direct = news.image?.trim();
  if (direct) return direct;
  return firstImageSrcFromHtml(news.content);
}
