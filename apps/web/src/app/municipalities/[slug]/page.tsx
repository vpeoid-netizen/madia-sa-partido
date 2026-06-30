import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MadiaImage } from '@/components/MadiaImage';
import { getMunicipalityBySlug, getPlacesForMunicipality, placeSlugFromRoute } from '@/lib/data';
import { getMunicipalityImage, getPlaceImage } from '@/lib/images';

export default async function MunicipalityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const info = getMunicipalityBySlug(slug);
  if (!info) notFound();

  const places = getPlacesForMunicipality(info.meta.id);
  const attractions = places.filter((p) => p.record_type === 'attraction');
  const accommodations = places.filter((p) => p.record_type === 'accommodation');
  const restaurants = places.filter((p) => p.record_type === 'restaurant');
  const transport = places.filter((p) => p.record_type === 'transportation_route');
  const events = places.filter((p) => p.record_type === 'festival_event');
  const services = places.filter((p) => p.record_type === 'tourism_service');
  const facilities = places.filter((p) => p.record_type === 'facility');

  function PlaceLinks({ items, title }: { items: typeof places; title: string }) {
    return (
      <section aria-labelledby={title} style={{ marginBottom: '1.25rem' }}>
        <h2 id={title}>{title}</h2>
        {items.length === 0 ? (
          <div className="empty-state">Information not yet available</div>
        ) : (
          <ul className="home-grid">
            {items.map((place) => {
              const image = getPlaceImage(place);
              return (
                <li key={place.record_id} className="home-card madia-glass">
                  <MadiaImage
                    src={image.url}
                    alt={place.official_name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    frameClassName="madia-image-frame card-image-frame"
                  />
                  <div className="home-card-body">
                    <strong>{place.official_name}</strong>
                    <p style={{ margin: '0.35rem 0' }}>
                      {place.short_description || place.category}
                    </p>
                    <Link
                      href={`/municipalities/${slug}/${placeSlugFromRoute(place.application_page_route)}`}
                      className="button button-primary"
                    >
                      View
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  const headerImage = getMunicipalityImage(info.meta.id, info.summary?.cover_photo_id);

  return (
    <div style={{ padding: '0 0 2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="place-hero municipality-hero">
        <MadiaImage
          src={headerImage.url}
          alt={info.meta.displayName}
          fill
          sizes="100vw"
          frameClassName="place-hero-frame"
        />
        <div className="place-hero-overlay madia-glass">
          <Link href="/map" className="button button-secondary">
            Back to map
          </Link>
          <h1 className="madia-brand place-hero-title">{info.meta.displayName}</h1>
          <p>{info.summary?.short_description || 'Discover destinations across this Partido municipality.'}</p>
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem 0' }}>
        <PlaceLinks items={attractions} title="Destinations" />
        <PlaceLinks items={accommodations} title="Where to stay" />
        <PlaceLinks items={restaurants} title="Food and dining" />
        <PlaceLinks items={transport} title="Transportation" />
        <PlaceLinks items={events} title="Events" />
        <PlaceLinks items={services} title="Tourism services" />
        <PlaceLinks items={facilities} title="Facilities" />
      </div>
    </div>
  );
}
