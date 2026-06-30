export const PROVINCIAL_FALLBACK = '/images/provincial-fallback.svg';

export interface PlaceImageInfo {
  url: string;
  attribution?: string;
  isFallback: boolean;
  photo_id?: string;
}

/** Normalize Wikimedia redirect and commons URLs to a browser-loadable image URL. */
export function normalizePhotoUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();

  const redirectMatch = trimmed.match(/Special:Redirect\/file\/(.+)$/i);
  if (redirectMatch) {
    const filename = decodeURIComponent(redirectMatch[1]);
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1600`;
  }

  if (trimmed.includes('commons.wikimedia.org') && !trimmed.includes('Special:FilePath')) {
    const fileMatch = trimmed.match(/\/wiki\/File:(.+)$/i);
    if (fileMatch) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(decodeURIComponent(fileMatch[1]))}?width=1600`;
    }
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
}

export function isExternalImageUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
