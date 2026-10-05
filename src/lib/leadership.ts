export const LEADERSHIP_LEVELS = [
  { value: 1, label: "1단 — 회장" },
  { value: 2, label: "2단 — 부회장" },
  { value: 3, label: "3단 — 사무총장·임원" },
  { value: 4, label: "4단 — 기타" },
] as const;

export type LeadershipCard = {
  id: string;
  name: string;
  nameEn: string | null;
  role: string;
  bio: string | null;
  image: string | null;
  level: number;
  order: number;
};

/** Infer org-chart level from role when level is missing/legacy. */
export function inferLeadershipLevel(role: string, fallback = 3) {
  const r = role.trim();
  if (r === "회장" || r.endsWith(" 회장") || r.includes("회장단장")) return 1;
  if (r.includes("부회장")) return 2;
  if (r.includes("사무총장") || r.includes("총무") || r.includes("재무")) return 3;
  return fallback;
}

export function groupByLevel(members: LeadershipCard[]) {
  const map = new Map<number, LeadershipCard[]>();
  for (const member of members) {
    const level = member.level > 0 ? member.level : inferLeadershipLevel(member.role);
    const list = map.get(level) ?? [];
    list.push(member);
    map.set(level, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([level, items]) => ({
      level,
      items: items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "ko")),
    }));
}
