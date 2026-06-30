'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { type Map as MaplibreMap, type MapLayerMouseEvent } from 'maplibre-gl';
import { MAP_ATTRIBUTION, computeBounds, type PartidoFeatureCollection } from '@madia/maps';
import type { MunicipalityMapSummary } from '@madia/domain';
import { MunicipalitySummaryPanel } from './MunicipalitySummaryPanel';

interface PartidoMapProps {
  geojson: PartidoFeatureCollection;
  summaries: MunicipalityMapSummary[];
  summaryImages?: Record<string, { url: string; attribution?: string }>;
  lowBandwidth?: boolean;
}

export function PartidoMap({ geojson, summaries, summaryImages = {}, lowBandwidth = false }: PartidoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const summaryBySlug = useMemo(() => {
    const map = new Map<string, MunicipalityMapSummary>();
    summaries.forEach((s) => map.set(s.municipality_slug, s));
    return map;
  }, [summaries]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return geojson.features
      .map((f) => f.properties)
      .filter((p) => {
        if (!q) return true;
        return (
          p.municipality_name.toLowerCase().includes(q) ||
          (p.municipality_name_ascii || '').toLowerCase().includes(q) ||
          p.municipality_slug.includes(q)
        );
      })
      .sort((a, b) => a.municipality_name.localeCompare(b.municipality_name));
  }, [geojson.features, search]);

  const selectMunicipality = useCallback(
    (slug: string) => {
      setSelectedSlug(slug);
      const map = mapRef.current;
      const feature = geojson.features.find((f) => f.properties.municipality_slug === slug);
      if (!map || !feature) return;
      const bounds = new maplibregl.LngLatBounds();
      const walk = (coords: unknown): void => {
        if (!Array.isArray(coords)) return;
        if (typeof coords[0] === 'number') {
          bounds.extend(coords as [number, number]);
          return;
        }
        coords.forEach(walk);
      };
      const geom = feature.geometry as { coordinates?: unknown };
      if (geom.coordinates) walk(geom.coordinates);
      map.fitBounds(bounds, { padding: 60, duration: lowBandwidth ? 0 : 500 });
      map.setFilter('municipality-selected', ['==', ['get', 'municipality_slug'], slug]);
    },
    [geojson.features, lowBandwidth],
  );

  const resetMap = useCallback(() => {
    setSelectedSlug(null);
    const map = mapRef.current;
    if (!map) return;
    const bounds = computeBounds(geojson);
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: 40, duration: lowBandwidth ? 0 : 400 },
    );
    map.setFilter('municipality-selected', ['==', ['get', 'municipality_slug'], '']);
  }, [geojson, lowBandwidth]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!geojson.features.length) {
      setMapError('Boundary data is not yet available. Use the municipality list below.');
      return;
    }

    const bounds = computeBounds(geojson);
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: { 'raster-opacity': 0.82 },
          },
        ],
      },
      bounds: [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      fitBoundsOptions: { padding: 40 },
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: MAP_ATTRIBUTION }),
      'bottom-right',
    );

    map.on('load', () => {
      map.addSource('partido-municipalities', {
        type: 'geojson',
        data: geojson as GeoJSON.FeatureCollection,
      });

      map.addLayer({
        id: 'municipality-fill',
        type: 'fill',
        source: 'partido-municipalities',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#7EC8C7',
            '#B9E4E8',
          ],
          'fill-opacity': 0.55,
        },
      });

      map.addLayer({
        id: 'municipality-outline',
        type: 'line',
        source: 'partido-municipalities',
        paint: {
          'line-color': '#0B3D5E',
          'line-width': 1.5,
        },
      });

      map.addLayer({
        id: 'municipality-selected',
        type: 'line',
        source: 'partido-municipalities',
        filter: ['==', ['get', 'municipality_slug'], ''],
        paint: {
          'line-color': '#D96C4F',
          'line-width': 4,
          'line-dasharray': [1, 0.5],
        },
      });

      map.addLayer({
        id: 'municipality-labels',
        type: 'symbol',
        source: 'partido-municipalities',
        layout: {
          'text-field': ['get', 'municipality_name'],
          'text-size': 12,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#102A33',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.2,
        },
      });

      let hoveredId: string | number | undefined;
      map.on('mousemove', 'municipality-fill', (e: MapLayerMouseEvent) => {
        if (!e.features?.length) return;
        map.getCanvas().style.cursor = 'pointer';
        if (hoveredId !== undefined) {
          map.setFeatureState({ source: 'partido-municipalities', id: hoveredId }, { hover: false });
        }
        hoveredId = e.features[0].id;
        if (hoveredId !== undefined) {
          map.setFeatureState({ source: 'partido-municipalities', id: hoveredId }, { hover: true });
        }
      });
      map.on('mouseleave', 'municipality-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredId !== undefined) {
          map.setFeatureState({ source: 'partido-municipalities', id: hoveredId }, { hover: false });
        }
      });
      map.on('click', 'municipality-fill', (e: MapLayerMouseEvent) => {
        const slug = e.features?.[0]?.properties?.municipality_slug;
        if (slug) selectMunicipality(String(slug));
      });

      setMapReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geojson, selectMunicipality]);

  const selectedSummary = selectedSlug ? summaryBySlug.get(selectedSlug) : undefined;

  return (
    <section aria-label="Partido Area map" style={{ padding: '0 0.75rem 1rem' }}>
      <div
        className="madia-glass"
        style={{
          padding: '1rem',
          marginBottom: '0.75rem',
          display: 'grid',
          gap: '0.75rem',
        }}
      >
        <div>
          <h1 className="madia-brand" style={{ margin: 0, fontSize: '1.6rem' }}>
            Choose where you want to go in Partido
          </h1>
          <p style={{ margin: '0.35rem 0 0', maxWidth: '48rem' }}>
            Tap or choose a municipality on the map, or use the searchable list. The first tap
            selects a municipality; use Explore Municipality to open its profile.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ flex: '1 1 220px' }}>
            <span className="sr-only">Search municipalities</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search municipalities (e.g. Sagñay, Sagnay)"
              style={{
                width: '100%',
                minHeight: 'var(--madia-touch-min)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(11,61,94,0.15)',
                padding: '0.65rem 0.85rem',
              }}
            />
          </label>
          <button type="button" className="button button-secondary" onClick={resetMap}>
            Reset Map
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
          gap: '0.75rem',
          alignItems: 'start',
        }}
      >
        <div>
          <div
            ref={containerRef}
            role="application"
            aria-label="Interactive map of Partido municipalities"
            style={{
              width: '100%',
              height: 'min(68vh, 720px)',
              borderRadius: 'var(--madia-radius-md)',
              overflow: 'hidden',
              border: '1px solid rgba(11,61,94,0.12)',
              background: '#d9edf2',
            }}
          />
          {!mapReady && !mapError && (
            <p aria-live="polite" style={{ marginTop: '0.5rem' }}>
              Loading map boundaries…
            </p>
          )}
          {mapError && (
            <div className="empty-state" role="alert" style={{ marginTop: '0.5rem' }}>
              {mapError}
            </div>
          )}
          <p style={{ fontSize: '0.78rem', marginTop: '0.5rem', opacity: 0.85 }}>{MAP_ATTRIBUTION}</p>
        </div>

        <aside aria-label="Municipality selection">
          <div className="madia-glass" style={{ padding: '0.85rem' }}>
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>All municipalities</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.35rem' }}>
              {filteredList.map((m) => (
                <li key={m.municipality_slug}>
                  <button
                    type="button"
                    onClick={() => selectMunicipality(m.municipality_slug)}
                    aria-pressed={selectedSlug === m.municipality_slug}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      minHeight: 'var(--madia-touch-min)',
                      padding: '0.55rem 0.7rem',
                      borderRadius: '0.65rem',
                      border:
                        selectedSlug === m.municipality_slug
                          ? '2px solid #D96C4F'
                          : '1px solid rgba(11,61,94,0.12)',
                      background:
                        selectedSlug === m.municipality_slug ? 'rgba(126,200,199,0.25)' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <strong>{m.municipality_name}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {selectedSummary && (
            <div style={{ marginTop: '0.75rem' }}>
              <MunicipalitySummaryPanel
                summary={selectedSummary}
                imageUrl={summaryImages[selectedSummary.municipality_slug]?.url}
                imageAttribution={summaryImages[selectedSummary.municipality_slug]?.attribution}
              />
            </div>
          )}
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          section > div:last-child {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
