import { NextResponse } from 'next/server';
import type { Place } from '@madia/domain';
import { searchPlaces } from '@madia/domain';
import { loadRuntimeData } from '@/lib/data';
import { getPlaceImage } from '@/lib/images';

const BROWSEABLE_TYPES = new Set([
  'attraction',
  'cultural_site',
  'accommodation',
  'restaurant',
  'festival_event',
  'tourism_service',
]);

function isSearchablePlace(place: Place): boolean {
  if (!place.official_name?.trim()) return false;
  if (place.record_type === 'transportation_route' && !place.application_page_route?.trim()) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const runtime = loadRuntimeData();
  if (!runtime) {
    return NextResponse.json({ results: [], error: 'Data not imported' }, { status: 503 });
  }

  const searchable = runtime.places.filter(isSearchablePlace);
  const pool = q.trim()
    ? searchable
    : searchable.filter((place) => BROWSEABLE_TYPES.has(place.record_type));

  const results = searchPlaces(pool, { query: q, limit: 25 }).map((place) => {
    const image = getPlaceImage(place);
    return {
      ...place,
      image_url: image.url,
      image_attribution: image.attribution,
    };
  });
  return NextResponse.json({ results });
}
