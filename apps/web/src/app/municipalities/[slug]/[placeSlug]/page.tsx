import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseCoordinate } from '@madia/domain';
import { AiPlacePanel } from '@/components/AiPlacePanel';
import { TripBuilderPanel } from '@/components/TripBuilderPanel';
import {
  getMunicipalityBySlug,
  getPlaceBySlug,
  getPlacesForMunicipality,
  getPublicPhotoForPlace,
  publicText,
} from '@/lib/data';

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

  const photo = getPublicPhotoForPlace(place);
  const lat = parseCoordinate(place.latitude);
  const lng = parseCoordinate(place.longitude);
  const municipalityPlaces = getPlacesForMunicipality(municipality.meta.id);
  const address =
    publicText(place.complete_address) ||
    [publicText(place.barangay), municipality.meta.displayName, 'Camarines Sur']
      .filter(Boolean)
      .join(', ');
  const overview = publicText(place.full_description) || publicText(place.short_description);
  const fee = publicText(place.entrance_fee) || publicText(place.price_range);
  const visitDuration = publicText(place.recommended_visit_duration);
  const bestTime = publicText(place.best_time_to_visit);

  return (
    <div className="destination-page">
      <Link
        href={`/municipalities/${slug}`}
        className="button button-secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to {municipality.meta.displayName}
      </Link>

      {(photo?.original_url || photo?.storage_path) && (
        <img
          src={photo.original_url || photo.storage_path}
          alt={`${place.official_name} in ${municipality.meta.displayName}`}
          className="place-hero-image"
          referrerPolicy="no-referrer"
        />
      )}

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
        </div>
      </article>

      {(lat !== null || address) && (
        <section className="madia-glass detail-panel">
          <h2>Location</h2>
          <p>{address}</p>
          {lat !== null && lng !== null && (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Open in maps →
            </a>
          )}
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

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <AiPlacePanel
          municipalityName={municipality.meta.displayName}
          placeId={place.record_id}
          placeName={place.official_name}
        />
        <TripBuilderPanel
          municipalitySlug={slug}
          municipalityName={municipality.meta.displayName}
          focusPlace={{
            record_id: place.record_id,
            official_name: place.official_name,
            verification_status: 'VERIFIED',
            entrance_fee: fee,
          }}
          places={municipalityPlaces
            .filter((item) => item.record_type === 'attraction')
            .slice(0, 8)
            .map((item) => ({
              record_id: item.record_id,
              official_name: item.official_name,
              verification_status: 'VERIFIED',
              entrance_fee: publicText(item.entrance_fee),
            }))}
        />
      </div>
    </div>
  );
}
