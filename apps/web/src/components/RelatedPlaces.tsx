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
          const description =
            p.short_description ||
            p.complete_address ||
            `${p.municipality || 'Partido'}, Camarines Sur`;
          const ctaHref =
            p.application_page_route ||
            (bookable && p.record_type === 'accommodation'
              ? `/book?accommodation=${encodeURIComponent(p.record_id)}`
              : null);
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
                <p className="home-card-kicker">{p.subcategory || p.category || 'Destination'}</p>
                <h3>{p.official_name}</h3>
                <p className="home-card-description">{description}</p>
                {ctaHref && (
                  <Link href={ctaHref} className="municipality-card__action">
                    Explore destination →
                  </Link>
                )}
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
