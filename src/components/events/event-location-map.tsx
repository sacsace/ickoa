type EventLocationMapProps = {
  location: string;
  mapsUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
};

function normalizeHref(raw: string) {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export function EventLocationMap({
  location,
  mapsUrl,
  lat,
  lng,
}: EventLocationMapProps) {
  const hasCoords =
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);
  const href = mapsUrl?.trim()
    ? normalizeHref(mapsUrl.trim())
    : hasCoords
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;

  if (!hasCoords && !href) return null;

  const embedSrc = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(href!)}&output=embed`;

  return (
    <section className="mt-8 border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-4 md:px-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            위치
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{location}</p>
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand hover:underline"
          >
            Google 지도에서 보기
          </a>
        ) : null}
      </div>
      <div className="relative aspect-[16/9] w-full bg-muted md:aspect-[21/9]">
        <iframe
          title={`${location} 지도`}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
