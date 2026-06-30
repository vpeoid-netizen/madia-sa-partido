import { PartidoMap } from '@/components/PartidoMap';
import { loadGeoJson, loadRuntimeData } from '@/lib/data';
import { getMunicipalityImage } from '@/lib/images';

export default function MapPage() {
  const runtime = loadRuntimeData();
  const geojson = loadGeoJson('web');
  const summaries = runtime?.summaries ?? [];

  if (!runtime) {
    return (
      <div style={{ padding: '1rem' }} className="empty-state" role="alert">
        <h1 className="madia-brand">Partido map</h1>
        <p>Run <code>npm run import:data</code> to load municipality boundaries and summaries.</p>
      </div>
    );
  }

  const summaryImages = Object.fromEntries(
    summaries.map((summary) => {
      const image = getMunicipalityImage(summary.municipality_id, summary.cover_photo_id);
      return [
        summary.municipality_slug,
        { url: image.url, attribution: image.attribution },
      ];
    }),
  );

  return (
    <div style={{ height: 'calc(100dvh - 6rem)', minHeight: '420px' }}>
      <PartidoMap geojson={geojson} summaries={summaries} summaryImages={summaryImages} />
    </div>
  );
}
