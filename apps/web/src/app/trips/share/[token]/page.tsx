import { notFound } from 'next/navigation';
import { getSharedTrip } from '@/lib/persistence';

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const trip = getSharedTrip(token);
  if (!trip) notFound();

  const payload = trip.payload as {
    itinerary?: { days?: Array<{ items?: Array<{ place_name: string; start_time?: string; end_time?: string }> }> };
    budget?: { total_php?: number };
  };

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h1 className="madia-brand">{trip.title}</h1>
      <p>{trip.traveler_count} traveler(s)</p>
      {trip.total_estimated_cost_php !== undefined && (
        <p>Estimated total: ₱{trip.total_estimated_cost_php.toLocaleString('en-PH')}</p>
      )}

      <section className="madia-glass" style={{ padding: '1rem', marginTop: '1rem' }}>
        <h2>Itinerary</h2>
        <ol>
          {payload.itinerary?.days?.[0]?.items?.map((item, i) => (
            <li key={i}>
              {item.start_time && item.end_time ? `${item.start_time}–${item.end_time}: ` : ''}
              {item.place_name}
            </li>
          )) || <li>Itinerary details not available.</li>}
        </ol>
      </section>
    </div>
  );
}
