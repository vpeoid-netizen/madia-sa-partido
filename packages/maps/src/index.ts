export interface MunicipalityFeatureProperties {
  municipality_id: string;
  municipality_name: string;
  municipality_name_ascii?: string;
  municipality_slug: string;
  official_psgc_code: string;
  centroid_latitude?: number;
  centroid_longitude?: number;
  label_latitude?: number;
  label_longitude?: number;
  bounding_box?: [number, number, number, number];
  short_description?: string;
  municipality_page_route?: string;
  required_attribution?: string;
  boundary_accuracy?: string;
}

export interface PartidoFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: GeoJSON.Geometry;
    properties: MunicipalityFeatureProperties;
  }>;
}

export const PARTIDO_BOUNDS: [number, number, number, number] = [122.8, 13.4, 124.2, 14.3];

export const MAP_ATTRIBUTION = [
  '© OpenStreetMap contributors',
  '© PSA / NAMRIA administrative boundaries (indicative)',
  'Boundaries are administrative and not cadastral.',
].join(' · ');

export function getFeatureBySlug(
  collection: PartidoFeatureCollection,
  slug: string,
): PartidoFeatureCollection['features'][number] | undefined {
  return collection.features.find((f) => f.properties.municipality_slug === slug);
}

export function getFeatureById(
  collection: PartidoFeatureCollection,
  municipalityId: string,
): PartidoFeatureCollection['features'][number] | undefined {
  return collection.features.find((f) => f.properties.municipality_id === municipalityId);
}

export function computeBounds(
  collection: PartidoFeatureCollection,
): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const walk = (coords: unknown): void => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number') {
      const [x, y] = coords as [number, number];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      return;
    }
    coords.forEach(walk);
  };

  for (const feature of collection.features) {
    const geom = feature.geometry as { coordinates?: unknown };
    if (geom.coordinates) walk(geom.coordinates);
  }

  if (!Number.isFinite(minX)) return PARTIDO_BOUNDS;
  const padX = (maxX - minX) * 0.05;
  const padY = (maxY - minY) * 0.05;
  return [minX - padX, minY - padY, maxX + padX, maxY + padY];
}
