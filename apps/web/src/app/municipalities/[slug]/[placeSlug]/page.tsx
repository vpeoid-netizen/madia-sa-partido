import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseCoordinate } from '@madia/domain';
import { AiPlacePanel } from '@/components/AiPlacePanel';
import { MadiaImage } from '@/components/MadiaImage';
import { PanoramaViewer } from '@/components/PanoramaViewer';
import { PlacePhotoGallery } from '@/components/PlacePhotoGallery';
import { RelatedPlaces } from '@/components/RelatedPlaces';
import { SaveFavoriteButton } from '@/components/SaveFavoriteButton';
import { SourceMeta } from '@/components/SourceMeta';
import { TripBuilderPanel } from '@/components/TripBuilderPanel';
import {
  getMunicipalityBySlug,
  getPlaceBySlug,
  getPlacesForMunicipality,
} from '@/lib/data';
import { getRelatedPlaces } from '@/lib/carousel';
import { getPlaceGallery, getPlaceImage } from '@/lib/images';

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

  const heroImage = getPlaceImage(place);
  const gallery = getPlaceGallery(place);
  const lat = parseCoordinate(place.latitude);
  const lng = parseCoordinate(place.longitude);
  const municipalityPlaces = getPlacesForMunicipality(municipality.meta.id);
  const related = getRelatedPlaces(municipality.meta.id, place.record_id);
  const route = place.application_page_route || `/municipalities/${slug}/${placeSlug}`;

  const fee = place.entrance_fee || place.price_range;
  const showFee =
    fee &&
    !fee.toLowerCase().includes('not publicly') &&
    !fee.toLowerCase().includes('not publicly recorded');

  return (
    <div className="place-page">
      <div className="place-hero">
        <MadiaImage
          src={heroImage.url}
          alt={place.official_name}
          fill
          priority
          sizes="100vw"
          frameClassName="place-hero-frame"
        />
        <div className="place-hero-overlay madia-glass">
          <Link href={`/municipalities/${slug}`} className="button button-secondary">
            Back to {municipality.meta.displayName}
          </Link>
          <h1 className="madia-brand place-hero-title">{place.official_name}</h1>
          <p>{place.category} · {place.municipality}</p>
          {heroImage.attribution && (
            <p className="photo-attribution">{heroImage.attribution}</p>
          )}
        </div>
      </div>

      <div className="place-content">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <SaveFavoriteButton
            recordId={place.record_id}
            placeName={place.official_name}
            route={route}
          />
          {place.record_type === 'accommodation' && (
            <Link
              href={`/book?accommodation=${encodeURIComponent(place.record_id)}`}
              className="button button-primary"
            >
              Check availability
            </Link>
          )}
        </div>

        <PlacePhotoGallery images={gallery} title={place.official_name} />

        {!heroImage.isFallback && gallery.length > 0 && (
          <section style={{ marginTop: '1rem' }}>
            <h2>Immersive preview</h2>
            <PanoramaViewer imageUrl={heroImage.url} title={place.official_name} />
          </section>
        )}

        <article className="madia-glass" style={{ padding: '1rem', marginTop: '1rem' }}>
          <section>
            <h2>Overview</h2>
            <p>{place.short_description || 'Information not yet available'}</p>
            {place.full_description && <p>{place.full_description}</p>}
          </section>

          <section style={{ marginTop: '1rem' }}>
            <h2>Location</h2>
            {lat !== null && lng !== null ? (
              <p>
                Coordinates: {lat}, {lng}
              </p>
            ) : null}
            {(place.complete_address || place.barangay) && (
              <p>{place.complete_address || place.barangay}</p>
            )}
          </section>

          {showFee && (
            <section style={{ marginTop: '1rem' }}>
              <h2>Prices and fees</h2>
              <p>{fee}</p>
            </section>
          )}

          <section style={{ marginTop: '1rem' }}>
            <h2>Source and freshness</h2>
            <SourceMeta
              source={place.primary_source}
              lastUpdated={place.date_information_last_confirmed || place.date_accessed}
              priceNote={showFee ? 'Current listed price' : 'Contact directly for current price'}
            />
          </section>
        </article>

        <RelatedPlaces {...related} />

        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
          <AiPlacePanel
            municipalityName={municipality.meta.displayName}
            placeId={place.record_id}
            placeName={place.official_name}
            municipalitySlug={slug}
          />
          <TripBuilderPanel
            municipalitySlug={slug}
            municipalityName={municipality.meta.displayName}
            focusPlace={{
              record_id: place.record_id,
              official_name: place.official_name,
              verification_status: place.verification_status,
              entrance_fee: place.entrance_fee,
            }}
            places={municipalityPlaces
              .filter((p) => p.record_type === 'attraction')
              .slice(0, 6)
              .map((p) => ({
                record_id: p.record_id,
                official_name: p.official_name,
                verification_status: p.verification_status,
                entrance_fee: p.entrance_fee,
              }))}
          />
        </div>
      </div>
    </div>
  );
}
