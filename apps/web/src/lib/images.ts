import type { Photo, Place } from '@madia/domain';
import { isPublicPhoto } from '@madia/domain';
import { getPublicPhoto, loadRuntimeData } from './data';
import {
  normalizePhotoUrl,
  PROVINCIAL_FALLBACK,
  type PlaceImageInfo,
} from './image-utils';
import { getStockImageForPlace } from './stock-images';

export { normalizePhotoUrl, PROVINCIAL_FALLBACK, type PlaceImageInfo } from './image-utils';

function hashRecordId(recordId?: string | null): number {
  if (!recordId) return 0;
  let hash = 0;
  for (let i = 0; i < recordId.length; i += 1) {
    hash = (hash * 31 + recordId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function placeImageKey(place: Place): string {
  return (
    place.record_id ||
    place.application_page_route ||
    `${place.record_type}:${place.official_name || place.municipality_id || 'partido'}`
  );
}

function municipalPublicPhotos(municipalityId: string): PlaceImageInfo[] {
  const data = loadRuntimeData();
  if (!data) return [];

  const seen = new Set<string>();
  const pool: PlaceImageInfo[] = [];

  for (const photo of data.photos) {
    if (photo.municipality_id !== municipalityId || !isPublicPhoto(photo)) continue;
    const resolved = resolvePhotoImage(photo);
    if (!resolved || seen.has(resolved.url)) continue;
    seen.add(resolved.url);
    pool.push(resolved);
  }

  return pool;
}

function pickFromPool(recordId: string | undefined, pool: PlaceImageInfo[]): PlaceImageInfo | null {
  if (pool.length === 0) return null;
  return pool[hashRecordId(recordId) % pool.length];
}

export function resolvePhotoImage(photo: Photo | null | undefined): PlaceImageInfo | null {
  if (!photo || !isPublicPhoto(photo)) return null;
  const normalized = normalizePhotoUrl(photo.original_url);
  if (!normalized) return null;
  return {
    url: normalized,
    attribution: photo.required_attribution,
    isFallback: false,
    photo_id: photo.photo_id,
  };
}

export function getPhotosForPlace(recordId: string): Photo[] {
  const data = loadRuntimeData();
  if (!data) return [];
  return data.photos.filter(
    (p) => p.related_record_id === recordId && isPublicPhoto(p),
  );
}

export function getPlaceImage(place: Place): PlaceImageInfo {
  const data = loadRuntimeData();

  if (place.cover_photo_id) {
    const cover = resolvePhotoImage(getPublicPhoto(place.cover_photo_id));
    if (cover) return cover;
  }

  const related = getPhotosForPlace(place.record_id);
  for (const photo of related) {
    const resolved = resolvePhotoImage(photo);
    if (resolved) return resolved;
  }

  const stock = getStockImageForPlace(place);
  if (stock) {
    return {
      url: stock.url,
      attribution: stock.attribution,
      isFallback: true,
    };
  }

  if (place.municipality_id) {
    const municipal = pickFromPool(
      placeImageKey(place),
      municipalPublicPhotos(place.municipality_id),
    );
    if (municipal) {
      return { ...municipal, isFallback: true };
    }
  }

  return { url: PROVINCIAL_FALLBACK, isFallback: true };
}

export function getMunicipalityImage(
  municipalityId: string,
  coverPhotoId?: string | null,
): PlaceImageInfo {
  if (coverPhotoId) {
    const cover = resolvePhotoImage(getPublicPhoto(coverPhotoId));
    if (cover) return cover;
  }

  const data = loadRuntimeData();
  if (data) {
    const attraction = data.places.find(
      (p) => p.municipality_id === municipalityId && p.record_type === 'attraction',
    );
    if (attraction) {
      const img = getPlaceImage(attraction);
      if (!img.isFallback || img.url.startsWith('http')) return img;
    }

    const municipal = pickFromPool(municipalityId, municipalPublicPhotos(municipalityId));
    if (municipal) return municipal;
  }

  return { url: PROVINCIAL_FALLBACK, isFallback: true };
}

export function getPlaceGallery(place: Place): PlaceImageInfo[] {
  const seen = new Set<string>();
  const gallery: PlaceImageInfo[] = [];

  const primary = getPlaceImage(place);
  if (primary.url && !primary.url.endsWith('provincial-fallback.svg')) {
    gallery.push(primary);
    seen.add(primary.url);
    if (primary.photo_id) seen.add(primary.photo_id);
  }

  for (const photo of getPhotosForPlace(place.record_id)) {
    if (seen.has(photo.photo_id)) continue;
    const resolved = resolvePhotoImage(photo);
    if (resolved && !seen.has(resolved.url)) {
      gallery.push(resolved);
      seen.add(resolved.url);
      seen.add(photo.photo_id);
    }
  }

  if (gallery.length === 0 && primary.url) {
    gallery.push(primary);
  }

  return gallery;
}
