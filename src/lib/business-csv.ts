import type { BusinessBulkRow } from "@/actions/admin";

const HEADER_MAP: Record<string, keyof BusinessBulkRow> = {
  name: "name",
  기업명: "name",
  category: "category",
  업종: "category",
  region: "region",
  지역: "region",
  address: "address",
  주소: "address",
  phone: "phone",
  전화: "phone",
  전화번호: "phone",
  website: "website",
  웹사이트: "website",
  lat: "lat",
  위도: "lat",
  lng: "lng",
  경도: "lng",
  description: "description",
  소개: "description",
  설명: "description",
};

export const BUSINESS_CSV_TEMPLATE = [
  "기업명,업종,지역,주소,전화,웹사이트,위도,경도,소개",
  "Hanwoo Restaurant,식당,Chennai,\"T. Nagar, Chennai\",+91-44-0000-0000,example.com,,,한식 레스토랑",
  "Hyundai Motor India,제조업,Sri City,\"Sriperumbudur, Tamil Nadu\",,,12.97,80.22,",
].join("\n");

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if ((ch === "," || ch === "\t") && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

export function parseBusinessCsv(text: string): BusinessBulkRow[] {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("헤더와 데이터 행이 필요합니다.");
  }

  const headers = splitCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const mapped = headers.map((h) => HEADER_MAP[h] ?? null);
  if (!mapped.includes("name") || !mapped.includes("category") || !mapped.includes("region") || !mapped.includes("address")) {
    throw new Error("헤더에 기업명, 업종, 지역, 주소 열이 필요합니다.");
  }

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: BusinessBulkRow = {
      name: "",
      category: "",
      region: "",
      address: "",
    };
    mapped.forEach((key, idx) => {
      if (!key) return;
      row[key] = cells[idx] ?? "";
    });
    return row;
  });
}
