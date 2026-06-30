import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Municipality,
  MunicipalityMapSummary,
  Photo,
  Place,
} from '@madia/domain';
import { isPublicPhoto, MUNICIPALITY_BY_SLUG, type MunicipalitySlug } from '@madia/domain';
import type { PartidoFeatureCollection } from '@madia/maps';

const ROOT = join(process.cwd(), '../..');

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

export function loadRuntimeData(): RuntimeData | null {
  const path = cachePath();
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as RuntimeData;
}

export function loadGeoJson(variant: 'web' | 'light' = 'web'): PartidoFeatureCollection {
  const filename =
    variant === 'light'
      ? 'partido_municipalities_light.geojson'
      : 'partido_municipalities_web.geojson';
  const path = join(ROOT, 'data/geojson', filename);
  if (!existsSync(path)) {
    return { type: 'FeatureCollection', features: [] };
  }
  return JSON.parse(readFileSync(path, 'utf8')) as PartidoFeatureCollection;
}

export function getMunicipalityBySlug(slug: string) {
  if (!(slug in MUNICIPALITY_BY_SLUG)) return null;
  const meta = MUNICIPALITY_BY_SLUG[slug as MunicipalitySlug];
  const data = loadRuntimeData();
  const municipality = data?.municipalities.find((m) => m.municipality_id === meta.id);
  const summary = data?.summaries.find((s) => s.municipality_id === meta.id);
  return { meta, municipality, summary };
}

export function getPlacesForMunicipality(municipalityId: string): Place[] {
  const data = loadRuntimeData();
  return data?.places.filter((p) => p.municipality_id === municipalityId) ?? [];
}

export function getPlaceBySlug(municipalitySlug: string, placeSlug: string): Place | null {
  const info = getMunicipalityBySlug(municipalitySlug);
  if (!info) return null;
  const places = getPlacesForMunicipality(info.meta.id);
  return (
    places.find((p) => {
      const route = p.application_page_route || '';
      return route.endsWith(`/${placeSlug}`) || route.includes(`/${placeSlug}`);
    }) ?? null
  );
}

export function getPublicPhoto(photoId?: string | null): Photo | null {
  if (!photoId) return null;
  const data = loadRuntimeData();
  const photo = data?.photos.find((p) => p.photo_id === photoId);
  if (!photo || !isPublicPhoto(photo)) return null;
  return photo;
}

export function placeSlugFromRoute(route?: string): string {
  if (!route) return '';
  const parts = route.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}
