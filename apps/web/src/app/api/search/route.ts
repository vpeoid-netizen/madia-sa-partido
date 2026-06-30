import { NextResponse } from 'next/server';
import { searchPlaces } from '@madia/domain';
import { loadRuntimeData, formatPlaceLocation, publicText } from '@/lib/data';
import { getPlaceImage } from '@/lib/images';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const runtime = loadRuntimeData();
  if (!runtime) return NextResponse.json({ results: [] });

  const results = searchPlaces(runtime.places, { query, limit: 60 })
    .filter((place) => place.application_page_route && place.official_name)
    .map((place) => {
      const image = getPlaceImage(place);
      return {
        record_id: place.record_id,
        official_name: place.official_name,
        municipality: place.municipality,
        category: publicText(place.category),
        subcategory: publicText(place.subcategory),
        short_description: publicText(place.short_description),
        complete_address: formatPlaceLocation({
          barangay: place.barangay,
          municipality: place.municipality,
          completeAddress: place.complete_address,
        }),
        application_page_route: place.application_page_route,
        image_url: image.url,
        image_attribution: image.attribution,
      };
    });

  return NextResponse.json({ results });
}
