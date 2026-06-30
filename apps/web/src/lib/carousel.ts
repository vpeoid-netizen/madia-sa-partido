import type { Place } from '@madia/domain';
import { MUNICIPALITY_BY_SLUG, type MunicipalitySlug } from '@madia/domain';
import { getPublicPhoto, loadRuntimeData, placeSlugFromRoute, publicBarangay, publicText } from './data';
import { getCarouselOverrides } from './persistence';
import { getMunicipalityImage, assignUniquePlaceImages, getPlaceImage, placeImageLookupKey } from './images';

export interface CarouselSlide {
  featured_slide_id: string;
  destination_record_id: string;
  municipality_id: string;
  destination_name: string;
  municipality_name: string;
  barangay_name?: string;
  destination_slug: string;
  short_caption?: string;
  experience_type: string;
  display_order: number;
  destination_page_route: string;
  image_url?: string;
  image_attribution?: string;
  is_active: boolean;
}

const PROVINCIAL_FALLBACK = '/images/provincial-fallback.svg';

function resolveSlideImage(place: Place): {
  image_url: string;
  image_attribution?: string;
} {
  const image = getPlaceImage(place);
  return {
    image_url: image.url,
    image_attribution: image.attribution,
  };
}

function municipalitySlugFromId(municipalityId: string): MunicipalitySlug | null {
  for (const [slug, meta] of Object.entries(MUNICIPALITY_BY_SLUG)) {
    if (meta.id === municipalityId) return slug as MunicipalitySlug;
  }
  return null;
}

function interleaveByMunicipality(places: Place[]): Place[] {
  const buckets = new Map<string, Place[]>();
  places.forEach((p) => {
    const list = buckets.get(p.municipality_id) || [];
    list.push(p);
    buckets.set(p.municipality_id, list);
  });
  const keys = [...buckets.keys()].sort();
  const result: Place[] = [];
  let added = true;
  let index = 0;
  while (added) {
    added = false;
    for (const key of keys) {
      const bucket = buckets.get(key)!;
      if (index < bucket.length) {
        result.push(bucket[index]);
        added = true;
      }
    }
    index += 1;
  }
  return result;
}

export function buildCarouselSlides(): CarouselSlide[] {
  const data = loadRuntimeData();
  if (!data) return [];

  const attractions = data.places.filter((p) => p.record_type === 'attraction');
  const ordered = interleaveByMunicipality(
    [...attractions].sort((a, b) => a.official_name.localeCompare(b.official_name)),
  );

  const overrides = getCarouselOverrides();
  const overrideMap = new Map(overrides.map((o) => [o.record_id, o]));

  const slides = ordered.map((place, index) => {
    const slug =
      municipalitySlugFromId(place.municipality_id) ||
      (place.municipality || '').toLowerCase().replace(/\s+/g, '-');
    const placeSlug = placeSlugFromRoute(place.application_page_route);
    const route =
      place.application_page_route || `/municipalities/${slug}/${placeSlug}`;
    const { image_url, image_attribution } = resolveSlideImage(place);

    return {
      featured_slide_id: `slide-${place.record_id}`,
      destination_record_id: place.record_id,
      municipality_id: place.municipality_id,
      destination_name: place.official_name,
      municipality_name: place.municipality || slug,
      barangay_name: publicBarangay(place.barangay) || undefined,
      destination_slug: placeSlug,
      short_caption: publicText(place.short_description) || undefined,
      experience_type: place.category || 'Destination',
      display_order: index + 1,
      destination_page_route: route,
      image_url,
      image_attribution,
      is_active: overrideMap.get(place.record_id)?.is_active ?? true,
    };
  });

  return slides.sort((a, b) => {
    const oa = overrideMap.get(a.destination_record_id)?.display_order;
    const ob = overrideMap.get(b.destination_record_id)?.display_order;
    return (oa ?? a.display_order) - (ob ?? b.display_order);
  });
}

export function getHomepageSections() {
  const data = loadRuntimeData();
  if (!data) {
    return {
      municipalities: [],
      accommodations: [],
      restaurants: [],
      events: [],
      transport: [],
      categories: [] as { label: string; query: string }[],
    };
  }

  const hasIdentity = (p: Place) => Boolean(p.record_id || p.official_name);

  const accommodations = data.places
    .filter((p) => p.record_type === 'accommodation' && hasIdentity(p))
    .slice(0, 6);
  const restaurants = data.places
    .filter((p) => p.record_type === 'restaurant' && hasIdentity(p))
    .slice(0, 6);
  const events = data.places
    .filter((p) => p.record_type === 'festival_event' && hasIdentity(p))
    .slice(0, 4);
  const transport = data.places
    .filter((p) => p.record_type === 'transportation_route' && hasIdentity(p))
    .slice(0, 4);

  const categories = [
    { label: 'Beaches & islands', query: 'beach' },
    { label: 'Nature & trails', query: 'nature' },
    { label: 'Heritage & culture', query: 'church' },
    { label: 'Food & flavors', query: 'food' },
    { label: 'Places to stay', query: 'resort' },
    { label: 'Adventures', query: 'island' },
  ];

  const imageMap = assignUniquePlaceImages([
    ...accommodations,
    ...restaurants,
    ...events,
    ...transport,
  ]);
  const card = (place: Place) => ({
    place,
    image: imageMap.get(placeImageLookupKey(place))!,
  });

  return {
    municipalities: data.summaries.map((m) => ({
      ...m,
      image: getMunicipalityImage(m.municipality_id, m.cover_photo_id),
    })),
    accommodations: accommodations.map(card),
    restaurants: restaurants.map(card),
    events: events.map(card),
    transport: transport.map(card),
    categories,
  };
}

export function getRelatedPlaces(municipalityId: string, excludeRecordId: string) {
  const data = loadRuntimeData();
  if (!data) return { accommodations: [], restaurants: [], transport: [] };

  const inMunicipality = data.places.filter(
    (p) => p.municipality_id === municipalityId && p.record_id !== excludeRecordId,
  );

  return {
    accommodations: inMunicipality.filter((p) => p.record_type === 'accommodation').slice(0, 4),
    restaurants: inMunicipality.filter((p) => p.record_type === 'restaurant').slice(0, 4),
    transport: inMunicipality.filter((p) => p.record_type === 'transportation_route').slice(0, 4),
  };
}
