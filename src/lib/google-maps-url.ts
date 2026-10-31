export type LatLng = { lat: number; lng: number };

function isValidCoord(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Google Maps / maps.app.goo.gl 공유 링크에서 위·경도를 추출합니다.
 * 단축 URL에 좌표가 없으면 null을 반환합니다.
 */
export function parseLatLngFromMapsUrl(raw?: string | null): LatLng | null {
  if (!raw?.trim()) return null;

  let url: string;
  try {
    const trimmed = raw.trim();
    url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  } catch {
    return null;
  }

  const decoded = (() => {
    try {
      return decodeURIComponent(url);
    } catch {
      return url;
    }
  })();

  const patterns: RegExp[] = [
    /@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
    /[?&]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
    /[?&]query=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
    /[?&]ll=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
    /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
    /\/place\/[^/]*\/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
    /destination=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
    /center=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (isValidCoord(lat, lng)) return { lat, lng };
  }

  return null;
}

export function resolveBusinessCoords(business: {
  lat?: number | null;
  lng?: number | null;
  mapsUrl?: string | null;
}): LatLng | null {
  if (
    business.lat != null &&
    business.lng != null &&
    isValidCoord(business.lat, business.lng)
  ) {
    return { lat: business.lat, lng: business.lng };
  }
  return parseLatLngFromMapsUrl(business.mapsUrl);
}

/** 단축 링크(goo.gl / maps.app.goo.gl)는 리다이렉트 후 URL에서 좌표 추출 */
export async function resolveMapsUrlCoords(
  raw?: string | null,
): Promise<LatLng | null> {
  const direct = parseLatLngFromMapsUrl(raw);
  if (direct) return direct;
  if (!raw?.trim()) return null;

  const href = /^https?:\/\//i.test(raw.trim())
    ? raw.trim()
    : `https://${raw.trim()}`;

  try {
    const res = await fetch(href, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KAICBot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    return parseLatLngFromMapsUrl(res.url) ?? parseLatLngFromMapsUrl(href);
  } catch {
    return null;
  }
}
