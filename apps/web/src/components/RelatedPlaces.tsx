import Link from 'next/link';
import type { Place } from '@madia/domain';
import { MadiaImage } from '@/components/MadiaImage';
import { assignUniquePlaceImages, placeImageLookupKey } from '@/lib/images';

function RelatedList({
  title,
  places,
  imageMap,
  bookable,
}: {
  title: string;
  places: Place[];
  imageMap: Map<string, import('@/lib/image-utils').PlaceImageInfo>;
  bookable?: boolean;
}) {
  if (places.length === 0) return null;
  return (
    <section className="related-section">
      <h2>{title}</h2>
      <ul className="home-grid">
        {places.map((p) => {
          const image = imageMap.get(placeImageLookupKey(p))!;
          return (
            <li key={p.record_id} className="home-card madia-glass">
              <MadiaImage
                src={image.url}
                alt={p.official_name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                frameClassName="madia-image-frame card-image-frame"
              />
              <div className="home-card-body">
                <h3>{p.official_name}</h3>
                <p className="home-card-meta">{p.category}</p>
                <div className="home-card-actions">
                  {p.application_page_route && (
                    <Link href={p.application_page_route} className="button button-secondary">
                      Details
                    </Link>
                  )}
                  {bookable && p.record_type === 'accommodation' && (
                    <Link
                      href={`/book?accommodation=${encodeURIComponent(p.record_id)}`}
                      className="button button-primary"
                    >
                      Check availability
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function RelatedPlaces({
  accommodations,
  restaurants,
  transport,
}: {
  accommodations: Place[];
  restaurants: Place[];
  transport: Place[];
}) {
  const imageMap = assignUniquePlaceImages([...accommodations, ...restaurants, ...transport]);

  return (
    <div className="related-places">
      <RelatedList title="Nearby stays" places={accommodations} imageMap={imageMap} bookable />
      <RelatedList title="Food nearby" places={restaurants} imageMap={imageMap} />
      <RelatedList title="Getting there" places={transport} imageMap={imageMap} />
    </div>
  );
}
