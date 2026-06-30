import Link from 'next/link';
import { MadiaImage } from '@/components/MadiaImage';
import type { MunicipalityMapSummary, Place } from '@madia/domain';
import type { PlaceImageInfo } from '@/lib/image-utils';

interface CategoryChip {
  label: string;
  query: string;
}

type MunicipalityCard = MunicipalityMapSummary & { image: PlaceImageInfo };
type PlaceCardData = { place: Place; image: PlaceImageInfo };

interface HomeSectionsProps {
  municipalities?: MunicipalityCard[];
  accommodations: PlaceCardData[];
  restaurants: PlaceCardData[];
  events: PlaceCardData[];
  transport: PlaceCardData[];
  categories: CategoryChip[];
}

function PlaceCard({ place, image }: PlaceCardData) {
  const slug = place.application_page_route || '#';
  const price = place.price_range || place.entrance_fee;
  const showPrice =
    price && !price.toLowerCase().includes('not publicly') && !price.toLowerCase().includes('not publicly recorded');

  return (
    <li className="home-card madia-glass">
      <MadiaImage
        src={image.url}
        alt={place.official_name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        frameClassName="madia-image-frame card-image-frame"
      />
      <div className="home-card-body">
        <h3>{place.official_name}</h3>
        <p className="home-card-meta">{place.municipality} · {place.category}</p>
        {showPrice && <p className="home-card-price">{price}</p>}
        <Link href={slug} className="button button-primary">
          View
        </Link>
      </div>
    </li>
  );
}

export function HomeSections({
  municipalities = [],
  accommodations,
  restaurants,
  events,
  transport,
  categories,
}: HomeSectionsProps) {
  return (
    <div className="home-sections">
      {municipalities.length > 0 && (
      <section aria-labelledby="mun-heading" className="home-section">
        <h2 id="mun-heading" className="madia-brand section-title">Explore by municipality</h2>
        <ul className="home-rail">
          {municipalities.map((m) => (
            <li key={m.municipality_id} className="home-card madia-glass">
              <MadiaImage
                src={m.image.url}
                alt={m.municipality_name}
                fill
                sizes="240px"
                frameClassName="madia-image-frame card-image-frame"
              />
              <div className="home-card-body">
                <h3>{m.municipality_name}</h3>
                <p>{m.short_description || 'Discover local destinations across Partido.'}</p>
                <p className="home-card-meta">{m.attraction_count} attractions</p>
                <Link href={m.municipality_page_route} className="button button-primary">
                  Explore
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
      )}

      <section aria-labelledby="escape-heading" className="home-section">
        <h2 id="escape-heading" className="madia-brand section-title">Find your kind of escape</h2>
        <div className="chip-row">
          {categories.map((c) => (
            <Link key={c.label} href={`/explore?q=${encodeURIComponent(c.query)}`} className="chip madia-glass">
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="stays-heading" className="home-section">
        <h2 id="stays-heading" className="madia-brand section-title">Featured stays</h2>
        {accommodations.length === 0 ? (
          <div className="empty-state">Stays will appear here as accommodation records are published.</div>
        ) : (
          <ul className="home-grid">{accommodations.map((p) => <PlaceCard key={p.place.record_id || p.place.application_page_route || p.place.official_name} {...p} />)}</ul>
        )}
      </section>

      <section aria-labelledby="taste-heading" className="home-section">
        <h2 id="taste-heading" className="madia-brand section-title">Taste Partido</h2>
        {restaurants.length === 0 ? (
          <div className="empty-state">Restaurants and local food experiences will appear here.</div>
        ) : (
          <ul className="home-grid">{restaurants.map((p) => <PlaceCard key={p.place.record_id || p.place.application_page_route || p.place.official_name} {...p} />)}</ul>
        )}
      </section>

      <section aria-labelledby="ai-heading" className="home-section madia-glass ai-cta">
        <h2 id="ai-heading" className="madia-brand section-title">Plan with MADIA AI</h2>
        <p>Ask about beaches, food, stays, and routes — grounded in published Partido records.</p>
        <Link href="/ai" className="button button-primary">Open travel assistant</Link>
      </section>

      <section aria-labelledby="transport-heading" className="home-section">
        <h2 id="transport-heading" className="madia-brand section-title">Getting around</h2>
        {transport.length === 0 ? (
          <div className="empty-state">Transportation routes will appear here.</div>
        ) : (
          <ul className="home-grid">{transport.map((p) => <PlaceCard key={p.place.record_id || p.place.application_page_route || p.place.official_name} {...p} />)}</ul>
        )}
      </section>

      <section aria-labelledby="events-heading" className="home-section">
        <h2 id="events-heading" className="madia-brand section-title">Upcoming events</h2>
        {events.length === 0 ? (
          <div className="empty-state">Events and festivals will appear here when published.</div>
        ) : (
          <ul className="home-grid">{events.map((p) => <PlaceCard key={p.place.record_id || p.place.application_page_route || p.place.official_name} {...p} />)}</ul>
        )}
      </section>

      <section aria-labelledby="map-heading" className="home-section madia-glass map-cta">
        <h2 id="map-heading" className="madia-brand section-title">Explore the Partido map</h2>
        <p>Select any of the ten municipalities on an interactive coastal map.</p>
        <Link href="/map" className="button button-primary">Open map</Link>
      </section>
    </div>
  );
}
