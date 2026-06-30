import Link from 'next/link';
import { MUNICIPALITY_BY_SLUG } from '@madia/domain';
import { AttractionCarousel, type AttractionSlide } from '@/components/AttractionCarousel';
import { HomeSections } from '@/components/HomeSections';
import { MadiaImage } from '@/components/MadiaImage';
import { PartidoMap } from '@/components/PartidoMap';
import { loadGeoJson, loadRuntimeData, formatPlaceLocation, publicText } from '@/lib/data';
import { getMunicipalityImage, assignUniquePlaceImages, placeImageLookupKey } from '@/lib/images';
import { buildHomeSectionsData } from '@/lib/home-sections';
import { PROVINCIAL_FALLBACK } from '@/lib/image-utils';
import { parseCoordinate } from '@madia/domain';

const MUNICIPALITY_SLUG_BY_ID = Object.fromEntries(
  Object.entries(MUNICIPALITY_BY_SLUG).map(([slug, info]) => [info.id, slug]),
);

export default function HomePage() {
  const runtime = loadRuntimeData();
  if (!runtime) {
    throw new Error('MADIA runtime data is required. Run npm run setup from the project root.');
  }

  const geojson = loadGeoJson('web');
  const homeSections = buildHomeSectionsData({
    summaries: runtime.summaries,
    places: runtime.places,
  });

  const attractionPlaces = runtime.places
    .filter((place) => place.record_type === 'attraction')
    .filter((place) => place.official_name && place.application_page_route)
    .sort(
      (a, b) =>
        (a.municipality || '').localeCompare(b.municipality || '') ||
        (a.official_name || '').localeCompare(b.official_name || ''),
    );

  const attractionImages = assignUniquePlaceImages(attractionPlaces);

  const slides: AttractionSlide[] = attractionPlaces.map((place) => {
      const image = attractionImages.get(placeImageLookupKey(place))!;
      const address = formatPlaceLocation({
        barangay: place.barangay,
        municipality: place.municipality,
        completeAddress: place.complete_address,
      });
      const description = publicText(place.short_description) || publicText(place.full_description);
      const type = [publicText(place.category), publicText(place.subcategory)].filter(Boolean).join(' · ');
      const municipalityName = place.municipality || 'Partido';
      const municipalitySlug = MUNICIPALITY_SLUG_BY_ID[place.municipality_id] || municipalityName.toLowerCase();

      return {
        id: place.record_id,
        name: place.official_name,
        municipality: municipalityName,
        municipalitySlug,
        address,
        latitude: parseCoordinate(place.latitude),
        longitude: parseCoordinate(place.longitude),
        type: type || 'Tourist Attraction',
        description:
          description ||
          `Discover ${place.official_name}, one of the distinctive destinations of ${municipalityName}.`,
        route: place.application_page_route || `/municipalities/${municipalitySlug}`,
        imageUrl: image.url.endsWith(PROVINCIAL_FALLBACK) ? undefined : image.url,
        imageAttribution: image.attribution,
      };
    });

  return (
    <div className="home-page">
      <AttractionCarousel slides={slides} />

      <section className="home-intro content-section" aria-labelledby="partido-heading">
        <div>
          <p className="section-kicker">One coast. Ten towns. Countless stories.</p>
          <h2 id="partido-heading" className="madia-brand section-title">
            Discover the heart of Partido
          </h2>
          <p className="section-lead">
            Explore islands, waterfalls, heritage churches, local flavors, community celebrations,
            and quiet coastal escapes across the Fourth District of Camarines Sur.
          </p>
        </div>
        <div className="home-intro__actions">
          <Link href="/explore" className="button button-primary">
            Browse destinations
          </Link>
          <Link href="/ai" className="button button-secondary">
            Ask MADIA
          </Link>
        </div>
      </section>

      <HomeSections
        accommodations={homeSections.accommodations}
        restaurants={homeSections.restaurants}
        events={homeSections.events}
        transport={homeSections.transport}
        categories={homeSections.categories}
      />

      <section id="municipalities" className="content-section" aria-labelledby="municipalities-heading">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">Across Partido</p>
            <h2 id="municipalities-heading" className="madia-brand section-title">
              Explore every municipality
            </h2>
          </div>
          <Link href="/explore" className="text-link">
            See all destinations →
          </Link>
        </div>
        <div className="municipality-grid">
          {runtime.summaries.map((summary) => {
            const image = getMunicipalityImage(summary.municipality_id, summary.cover_photo_id);
            return (
              <Link
                key={summary.municipality_id}
                href={summary.municipality_page_route}
                className="municipality-card madia-glass municipality-card--photo"
              >
                <MadiaImage
                  src={image.url}
                  alt={summary.municipality_name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  frameClassName="madia-image-frame municipality-card__image"
                />
                <div className="municipality-card__body">
                  <span className="municipality-card__count">
                    {summary.attraction_count} destinations
                  </span>
                  <h3>{summary.municipality_name}</h3>
                  <p className="home-card-description">{publicText(summary.short_description)}</p>
                  <span className="municipality-card__action">Explore destination →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="map" className="map-section" aria-labelledby="map-heading">
        <div className="content-section map-section__intro">
          <p className="section-kicker">Find your way</p>
          <h2 id="map-heading" className="madia-brand section-title">
            Explore Partido on the map
          </h2>
          <p className="section-lead">
            Select a municipality to see its destinations and begin shaping your journey.
          </p>
        </div>
        <PartidoMap geojson={geojson} summaries={runtime.summaries} />
      </section>
    </div>
  );
}
