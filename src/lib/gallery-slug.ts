/** URL 세그먼트용 — 한글/공백 슬러그는 라우팅·조회가 깨지므로 ASCII만 허용 */
export function isSafeGallerySlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function slugifyGallery(input: string) {
  const ascii = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return ascii || `album-${Date.now().toString(36)}`;
}

/** 사이트 링크용 — 안전하지 않은 슬러그는 cuid로 폴백 */
export function galleryAlbumPathId(album: { id: string; slug: string }) {
  return isSafeGallerySlug(album.slug) ? album.slug : album.id;
}
