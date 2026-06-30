import type { MunicipalityMapSummary, Place } from '@madia/domain';
import { assignUniquePlaceImages, getMunicipalityImage, placeImageLookupKey } from '@/lib/images';
import { publicText } from '@/lib/data';

export const HOME_CATEGORIES = [
  { label: 'Beaches & islands', query: 'beach' },
  { label: 'Waterfalls', query: 'falls' },
  { label: 'Heritage & churches', query: 'church' },
  { label: 'Food & dining', query: 'restaurant' },
  { label: 'Places to stay', query: 'accommodation' },
  { label: 'Festivals', query: 'festival' },
] as const;

function isBrowsable(place: Place): boolean {
  return Boolean(place.official_name?.trim() && place.application_page_route);
}

function pickPlaces(places: Place[], recordType: Place['record_type'], limit = 6): Place[] {
  return places
    .filter((place) => place.record_type === recordType && isBrowsable(place))
    .slice(0, limit);
}

export function buildHomeSectionsData(input: {
  summaries: MunicipalityMapSummary[];
  places: Place[];
}) {
  const municipalities = input.summaries.map((summary) => ({
    ...summary,
    short_description: publicText(summary.short_description) || summary.short_description,
    image: getMunicipalityImage(summary.municipality_id, summary.cover_photo_id),
  }));

  const accommodations = pickPlaces(input.places, 'accommodation');
  const restaurants = pickPlaces(input.places, 'restaurant');
  const events = pickPlaces(input.places, 'festival_event');
  const transport = pickPlaces(input.places, 'transportation_route', 4);
  const imageMap = assignUniquePlaceImages([
    ...accommodations,
    ...restaurants,
    ...events,
    ...transport,
  ]);

  const toCard = (place: Place) => ({
    place,
    image: imageMap.get(placeImageLookupKey(place))!,
  });

  return {
    municipalities,
    accommodations: accommodations.map(toCard),
    restaurants: restaurants.map(toCard),
    events: events.map(toCard),
    transport: transport.map(toCard),
    categories: [...HOME_CATEGORIES],
  };
}
