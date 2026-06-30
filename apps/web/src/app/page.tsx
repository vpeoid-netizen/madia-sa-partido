import { DestinationCarousel } from '@/components/DestinationCarousel';
import { HomeSections } from '@/components/HomeSections';
import { buildCarouselSlides, getHomepageSections } from '@/lib/carousel';
import { loadRuntimeData } from '@/lib/data';

export default function HomePage() {
  const runtime = loadRuntimeData();

  if (!runtime) {
    return (
      <div style={{ padding: '1rem' }} className="empty-state" role="alert">
        <h1 className="madia-brand">MADIA sa Partido</h1>
        <p>
          Production data has not been imported yet. Run{' '}
          <code>npm run import:data</code> from the monorepo root after installing dependencies.
        </p>
      </div>
    );
  }

  const slides = buildCarouselSlides();
  const sections = getHomepageSections();

  return (
    <>
      <DestinationCarousel slides={slides} />
      <HomeSections {...sections} />
    </>
  );
}
