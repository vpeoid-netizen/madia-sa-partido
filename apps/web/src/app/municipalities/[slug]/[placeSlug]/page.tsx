import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseCoordinate } from '@madia/domain';
import { AiPlacePanel } from '@/components/AiPlacePanel';
import { PlacePhotoGallery } from '@/components/PlacePhotoGallery';
import { RelatedPlaces } from '@/components/RelatedPlaces';
import { SaveFavoriteButton } from '@/components/SaveFavoriteButton';
import { TripBuilderPanel } from '@/components/TripBuilderPanel';
import { MadiaImage } from '@/components/MadiaImage';
import { wazeLinkForStop } from '@/lib/waze';
import {
  getMunicipalityBySlug,
  getPlaceBySlug,
  getPlacesForMunicipality,
  formatPlaceLocation,
  publicText,
} from '@/lib/data';
import { getPlaceGallery, getPlaceImage } from '@/lib/images';

function relatedInMunicipality(
  municipalityId: string,
  currentId: string,
  recordType: 'accommodation' | 'restaurant' | 'transportation_route',
  limit = 3,
) {
  return getPlacesForMunicipality(municipalityId)
    .filter((place) => place.record_id !== currentId && place.record_type === recordType)
    .filter((place) => place.official_name && place.application_page_route)
    .slice(0, limit);
}

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string; placeSlug: string }>;
}) {
  const { slug, placeSlug } = await params;
  const municipality = getMunicipalityBySlug(slug);
  if (!municipality) notFound();

  const place = getPlaceBySlug(slug, placeSlug);
  if (!place) notFound();

  const municipalityName = municipality.meta.displayName;
  const heroImage = getPlaceImage(place);
  const gallery = getPlaceGallery(place);
  const municipalityPlaces = getPlacesForMunicipality(municipality.meta.id);
  const lat = parseCoordinate(place.latitude);
  const lng = parseCoordinate(place.longitude);
  const address = formatPlaceLocation({
    barangay: place.barangay,
    municipality: municipalityName,
    completeAddress: place.complete_address,
  });
  const overview = publicText(place.full_description) || publicText(place.short_description);
  const fee = publicText(place.entrance_fee) || publicText(place.price_range);
  const visitDuration = publicText(place.recommended_visit_duration);
  const bestTime = publicText(place.best_time_to_visit);
  const detailRoute = place.application_page_route || `/municipalities/${slug}/${placeSlug}`;
  const wazeUrl = wazeLinkForStop(
    {
      place_name: place.official_name,
      latitude: lat,
      longitude: lng,
      address,
      municipality: municipalityName,
    },
    { navigate: true },
  );

  function placeRef(item: (typeof municipalityPlaces)[number]) {
    const itemLat = parseCoordinate(item.latitude);
    const itemLng = parseCoordinate(item.longitude);
    const itemAddress = formatPlaceLocation({
      barangay: item.barangay,
      municipality: municipalityName,
      completeAddress: item.complete_address,
    });

    return {
      record_id: item.record_id,
      official_name: item.official_name,
      verification_status: 'VERIFIED',
      entrance_fee: publicText(item.entrance_fee),
      latitude: itemLat,
      longitude: itemLng,
      address: itemAddress || undefined,
    };
  }

  return (
    <div className="destination-page">
      <Link
        href={`/municipalities/${slug}`}
        className="button button-secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to {municipalityName}
      </Link>

      <div className="place-hero madia-image-frame">
        <MadiaImage
          src={heroImage.url}
          alt={`${place.official_name} in ${municipalityName}`}
          fill
          priority
          sizes="100vw"
          frameClassName="place-hero-image"
        />
      </div>

      <article className="destination-hero madia-glass" style={{ marginTop: '1rem' }}>
        <p className="section-kicker">
          {[publicText(place.category), publicText(place.subcategory)].filter(Boolean).join(' · ') ||
            'Destination'}
        </p>
        <h1 className="madia-brand">{place.official_name}</h1>
        <p>{address}</p>
        {overview && <p>{overview}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '1.25rem' }}>
          <Link href="/trips" className="button button-primary">
            Plan a visit
          </Link>
          <Link href="/ai" className="button button-secondary">
            Ask MADIA
          </Link>
          <SaveFavoriteButton
            recordId={place.record_id}
            placeName={place.official_name}
            route={detailRoute}
          />
        </div>
      </article>

      <PlacePhotoGallery images={gallery} title={place.official_name} />

      {(lat !== null || address) && (
        <section className="madia-glass detail-panel">
          <h2>Location</h2>
          <p>{address}</p>
          <div className="location-links">
            {lat !== null && lng !== null && (
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
                className="button button-secondary"
              >
                Open in Google Maps
              </a>
            )}
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-primary waze-button"
            >
              Open in Waze
            </a>
          </div>
        </section>
      )}

      {(fee || visitDuration || bestTime) && (
        <section className="madia-glass detail-panel">
          <h2>Visitor details</h2>
          {fee && <p><strong>Fees:</strong> {fee}</p>}
          {visitDuration && <p><strong>Suggested visit:</strong> {visitDuration}</p>}
          {bestTime && <p><strong>Best time:</strong> {bestTime}</p>}
        </section>
      )}

      <RelatedPlaces
        accommodations={relatedInMunicipality(municipality.meta.id, place.record_id, 'accommodation')}
        restaurants={relatedInMunicipality(municipality.meta.id, place.record_id, 'restaurant')}
        transport={relatedInMunicipality(municipality.meta.id, place.record_id, 'transportation_route')}
      />

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <AiPlacePanel
          municipalityName={municipalityName}
          placeId={place.record_id}
          placeName={place.official_name}
        />
        <TripBuilderPanel
          municipalitySlug={slug}
          municipalityName={municipalityName}
          focusPlace={{
            ...placeRef(place),
            entrance_fee: fee,
          }}
          places={municipalityPlaces
            .filter((item) => item.record_type === 'attraction')
            .slice(0, 8)
            .map(placeRef)}
        />
      </div>
    </div>
  );
}
