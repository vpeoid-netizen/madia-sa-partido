import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Municipality, MunicipalityMapSummary, Photo, Place } from '@madia/domain';
import { isPublicPhoto, MUNICIPALITY_BY_SLUG, type MunicipalitySlug } from '@madia/domain';
import type { PartidoFeatureCollection } from '@madia/maps';

const ROOT = join(process.cwd(), '../..');
const HIDDEN_PUBLIC_VALUES = [
  'not publicly available',
  'not publicly confirmed',
  'not publicly recorded',
  'information not yet available',
  'requires confirmation',
  'requires local confirmation',
  'needs verification',
  'unverified',
  'partially verified',
  'working record',
  'working entry',
  'photo lead available',
  'permission required',
  'unclear – do not use',
];

export interface RuntimeData {
  meta: {
    batch_id: string;
    repository_version: string;
    imported_at: string;
    timezone: string;
    currency: string;
  };
  municipalities: Municipality[];
  summaries: MunicipalityMapSummary[];
  places: Place[];
  photos: Photo[];
}

function cachePath(): string {
  return join(ROOT, 'data/cache/madia-runtime.json');
}

export function publicText(value?: string | null): string {
  const text = String(value || '').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  if (HIDDEN_PUBLIC_VALUES.some((term) => lower === term || lower.startsWith(`${term}.`))) return '';

  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => {
      const sentenceLower = sentence.toLowerCase();
      return ![
        'working entry',
        'working record',
        'before unrestricted public display',
        'must be confirmed',
        'requires confirmation',
        'needs verification',
        'not publicly available',
        'confidence level',
      ].some((term) => sentenceLower.includes(term));
    })
    .join(' ')
    .trim();
}

export function hasPublicValue(value?: string | null): boolean {
  return Boolean(publicText(value));
}

export function publicBarangay(value?: string | null): string {
  const text = publicText(value);
  if (!text) return '';
  const lower = text.toLowerCase();
  if (
    lower.includes('not publicly') ||
    lower.includes('requires confirmation') ||
    lower.includes('requires local confirmation') ||
    lower.includes('information not yet')
  ) {
    return '';
  }
  return text;
}

export function formatPlaceLocation(input: {
  barangay?: string | null;
  municipality?: string | null;
  province?: string;
  completeAddress?: string | null;
}): string {
  const province = input.province || 'Camarines Sur';
  const address = publicText(input.completeAddress);
  if (address) return address;
  return [publicBarangay(input.barangay), input.municipality, province].filter(Boolean).join(', ');
}

export function loadRuntimeData(): RuntimeData | null {
  const path = cachePath();
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as RuntimeData;
}

export function loadGeoJson(variant: 'web' | 'light' = 'web'): PartidoFeatureCollection {
  const filename =
    variant === 'light' ? 'partido_municipalities_light.geojson' : 'partido_municipalities_web.geojson';
  const path = join(ROOT, 'data/geojson', filename);
  if (!existsSync(path)) return { type: 'FeatureCollection', features: [] };
  return JSON.parse(readFileSync(path, 'utf8')) as PartidoFeatureCollection;
}

export function getMunicipalityBySlug(slug: string) {
  if (!(slug in MUNICIPALITY_BY_SLUG)) return null;
  const meta = MUNICIPALITY_BY_SLUG[slug as MunicipalitySlug];
  const data = loadRuntimeData();
  const municipality = data?.municipalities.find((item) => item.municipality_id === meta.id);
  const summary = data?.summaries.find((item) => item.municipality_id === meta.id);
  return { meta, municipality, summary };
}

export function getPlacesForMunicipality(municipalityId: string): Place[] {
  const data = loadRuntimeData();
  return data?.places.filter((place) => place.municipality_id === municipalityId) ?? [];
}

export function getPlaceBySlug(municipalitySlug: string, placeSlug: string): Place | null {
  const info = getMunicipalityBySlug(municipalitySlug);
  if (!info) return null;
  return (
    getPlacesForMunicipality(info.meta.id).find((place) => {
      const route = place.application_page_route || '';
      return route.endsWith(`/${placeSlug}`) || route.includes(`/${placeSlug}`);
    }) ?? null
  );
}

export function getPublicPhoto(photoId?: string | null): Photo | null {
  if (!photoId) return null;
  const data = loadRuntimeData();
  const photo = data?.photos.find((item) => item.photo_id === photoId);
  if (!photo || !isPublicPhoto(photo)) return null;
  return photo;
}

export function getPublicPhotoForPlace(place: Place): Photo | null {
  const data = loadRuntimeData();
  if (!data) return null;
  const candidates = data.photos.filter(isPublicPhoto);
  return (
    candidates.find((photo) => photo.photo_id === place.cover_photo_id) ||
    candidates.find((photo) => photo.related_record_id === place.record_id) ||
    candidates.find((photo) => photo.municipality_id === place.municipality_id) ||
    null
  );
}

export function placeSlugFromRoute(route?: string): string {
  if (!route) return '';
  const parts = route.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}
