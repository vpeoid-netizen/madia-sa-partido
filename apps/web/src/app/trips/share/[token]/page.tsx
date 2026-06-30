import { notFound } from 'next/navigation';
import { TripItineraryView, type TripItineraryItem } from '@/components/TripItineraryView';
import { getSharedTrip } from '@/lib/persistence';
import { wazeRouteLink, wazeStopFromTripItem } from '@/lib/waze';

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const trip = getSharedTrip(token);
  if (!trip) notFound();

  const payload = trip.payload as {
    itinerary?: { days?: Array<{ items?: TripItineraryItem[] }> };
    budget?: { total_php?: number };
  };

  const items = payload.itinerary?.days?.[0]?.items ?? [];
  const routeLink = wazeRouteLink(items.map((item) => wazeStopFromTripItem(item)));

  return (
    <div className="trips-page content-section">
      <h1 className="madia-brand section-title">{trip.title}</h1>
      <p>{trip.traveler_count} traveler(s)</p>
      {trip.total_estimated_cost_php !== undefined && (
        <p>Estimated total: ₱{trip.total_estimated_cost_php.toLocaleString('en-PH')}</p>
      )}

      <section className="madia-glass trips-card" style={{ marginTop: '1rem' }}>
        <h2>Itinerary</h2>
        {items.length > 0 ? (
          <TripItineraryView
            items={items}
            municipalityName={items[0]?.municipality_slug?.replace(/-/g, ' ')}
          />
        ) : (
          <p>Itinerary details not available.</p>
        )}
        {routeLink && (
          <p style={{ marginTop: '0.75rem' }}>
            <a href={routeLink} target="_blank" rel="noopener noreferrer" className="button button-primary waze-button">
              Start route in Waze
            </a>
          </p>
        )}
      </section>
    </div>
  );
}
