import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getMunicipalityBySlug,
  getPlacesForMunicipality,
  getPublicPhotoForPlace,
  placeSlugFromRoute,
  publicText,
} from '@/lib/data';

export default async function MunicipalityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = getMunicipalityBySlug(slug);
  if (!info) notFound();

  const places = getPlacesForMunicipality(info.meta.id);
  const attractions = places.filter(
    (place) => place.record_type === 'attraction' || place.record_type === 'cultural_site',
  );
  const accommodations = places.filter((place) => place.record_type === 'accommodation');
  const restaurants = places.filter((place) => place.record_type === 'restaurant');

  return (
    <div className="destination-page">
      <Link href="/explore" className="button button-secondary" style={{ marginBottom: '1rem' }}>
        ← All destinations
      </Link>

      <header className="destination-hero madia-glass">
        <p className="section-kicker">Municipality of</p>
        <h1 className="madia-brand">{info.meta.displayName}</h1>
        {publicText(info.summary?.short_description) && (
          <p>{publicText(info.summary?.short_description)}</p>
        )}
      </header>

      <section aria-labelledby="places-heading" style={{ marginBottom: '3rem' }}>
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">Places to experience</p>
            <h2 id="places-heading" className="madia-brand section-title">
              Attractions and landmarks
            </h2>
          </div>
        </div>
        <div className="place-grid">
          {attractions.map((place) => {
            const photo = getPublicPhotoForPlace(place);
            const route = `/municipalities/${slug}/${placeSlugFromRoute(place.application_page_route)}`;
            return (
              <Link key={place.record_id} href={route} className="place-card madia-glass">
                {photo?.original_url || photo?.storage_path ? (
                  <img
                    src={photo.original_url || photo.storage_path}
                    alt={`${place.official_name} in ${info.meta.displayName}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="place-card__scenic" aria-hidden="true" />
                )}
                <div className="place-card__body">
                  <span className="place-card__type">
                    {publicText(place.subcategory) || publicText(place.category) || 'Destination'}
                  </span>
                  <h3>{place.official_name}</h3>
                  {publicText(place.short_description) && <p>{publicText(place.short_description)}</p>}
                  <span className="municipality-card__action">Explore destination →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {(accommodations.length > 0 || restaurants.length > 0) && (
        <section className="madia-glass detail-panel" aria-labelledby="visitor-heading">
          <h2 id="visitor-heading">Plan your stay</h2>
          <p>
            {accommodations.length > 0 && `${accommodations.length} places to stay`}
            {accommodations.length > 0 && restaurants.length > 0 && ' · '}
            {restaurants.length > 0 && `${restaurants.length} dining and local food options`}
          </p>
          <Link href="/trips" className="button button-primary">
            Create an itinerary
          </Link>
        </section>
      )}
    </div>
  );
}
