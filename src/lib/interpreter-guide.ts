export type InterpreterProfile = {
  region: string;
  name: string;
  age: string;
  gender: string;
  languages: string;
  email: string;
  phone: string;
  notes: string;
};

const FIELD_LABELS = {
  age: "나이",
  gender: "성별",
  languages: "구사 언어",
  email: "메일 주소",
  phone: "전화번호",
  notes: "특이사항",
} as const;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unescapeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function extractField(content: string, label: string) {
  const pattern = new RegExp(
    `<p>\\s*<strong>${label}<\\/strong>\\s*(?:<br\\s*\\/?>)?\\s*([\\s\\S]*?)\\s*<\\/p>`,
    "i",
  );
  const match = content.match(pattern);
  if (!match) return "";
  return unescapeHtml(
    match[1]
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim(),
  );
}

export function emptyInterpreterProfile(
  overrides?: Partial<InterpreterProfile>,
): InterpreterProfile {
  return {
    region: overrides?.region ?? "Chennai",
    name: overrides?.name ?? "",
    age: overrides?.age ?? "",
    gender: overrides?.gender ?? "",
    languages: overrides?.languages ?? "",
    email: overrides?.email ?? "",
    phone: overrides?.phone ?? "",
    notes: overrides?.notes ?? "",
  };
}

export function buildInterpreterContent(profile: InterpreterProfile) {
  const rows: Array<[string, string, "text" | "email" | "phone" | "multiline"]> = [
    [FIELD_LABELS.age, profile.age ?? "", "text"],
    [FIELD_LABELS.gender, profile.gender ?? "", "text"],
    [FIELD_LABELS.languages, profile.languages ?? "", "text"],
    [FIELD_LABELS.email, profile.email ?? "", "email"],
    [FIELD_LABELS.phone, profile.phone ?? "", "phone"],
    [FIELD_LABELS.notes, profile.notes ?? "", "multiline"],
  ];

  return rows
    .filter(([, value]) => value.trim())
    .map(([label, value, kind]) => {
      const safe = escapeHtml(value.trim());
      if (kind === "email") {
        return `<p><strong>${label}</strong><br/><a href="mailto:${safe}">${safe}</a></p>`;
      }
      if (kind === "phone") {
        const tel = safe.replace(/[^\d+]/g, "");
        return `<p><strong>${label}</strong><br/><a href="tel:${tel}">${safe}</a></p>`;
      }
      if (kind === "multiline") {
        return `<p><strong>${label}</strong><br/>${safe.replace(/\n/g, "<br/>")}</p>`;
      }
      return `<p><strong>${label}</strong><br/>${safe}</p>`;
    })
    .join("");
}

export function parseInterpreterProfile(input: {
  title: string;
  content: string;
  region: string;
}): InterpreterProfile {
  return emptyInterpreterProfile({
    region: input.region || "Chennai",
    name: input.title,
    age: extractField(input.content, FIELD_LABELS.age),
    gender: extractField(input.content, FIELD_LABELS.gender),
    languages: extractField(input.content, FIELD_LABELS.languages),
    email: extractField(input.content, FIELD_LABELS.email),
    phone: extractField(input.content, FIELD_LABELS.phone),
    notes: extractField(input.content, FIELD_LABELS.notes),
  });
}

export function isInterpreterCategory(category: string) {
  return category.trim() === "통역원";
}
