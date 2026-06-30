import { NextResponse } from 'next/server';
import { searchPlaces } from '@madia/domain';
import { loadRuntimeData, publicText } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const runtime = loadRuntimeData();
  if (!runtime) return NextResponse.json({ results: [] });

  const results = searchPlaces(runtime.places, { query, limit: 60 })
    .filter((place) => place.application_page_route && place.official_name)
    .map((place) => ({
      record_id: place.record_id,
      official_name: place.official_name,
      municipality: place.municipality,
      category: publicText(place.category),
      subcategory: publicText(place.subcategory),
      short_description: publicText(place.short_description),
      complete_address:
        publicText(place.complete_address) ||
        [publicText(place.barangay), place.municipality, 'Camarines Sur'].filter(Boolean).join(', '),
      application_page_route: place.application_page_route,
    }));

  return NextResponse.json({ results });
}
