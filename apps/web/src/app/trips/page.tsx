'use client';

import { useSavedTrips } from '@/lib/client-storage';
import { useState } from 'react';
import Link from 'next/link';
import { TripItineraryView, type TripItineraryItem } from '@/components/TripItineraryView';

type SavedPayload = {
  itinerary?: {
    days?: Array<{
      items?: TripItineraryItem[];
    }>;
  };
  budget?: { total_php?: number };
};

export default function TripsPage() {
  const { trips, removeTrip } = useSavedTrips();
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function shareTrip(trip: (typeof trips)[0]) {
    const res = await fetch('/api/trips/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: trip.title,
        payload: trip.payload,
        traveler_count: trip.traveler_count,
        total_estimated_cost_php: trip.total_estimated_cost_php,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      const url = `${window.location.origin}${data.share_url}`;
      setShareUrl(url);
      if (navigator.share) {
        await navigator.share({ title: trip.title, url });
      }
    }
  }

  return (
    <div className="trips-page content-section">
      <h1 className="madia-brand section-title">Saved trips</h1>
      <p className="section-lead">
        Your Partido itineraries with Waze navigation for every stop.
      </p>

      {trips.length === 0 ? (
        <div className="empty-state">
          No saved trips yet. Open a destination, build a plan, and tap Save itinerary.
        </div>
      ) : (
        <ul className="trips-list">
          {trips.map((trip) => {
            const payload = trip.payload as SavedPayload;
            const items = payload.itinerary?.days?.[0]?.items ?? [];

            return (
              <li key={trip.id} className="madia-glass trips-card">
                <strong>{trip.title}</strong>
                <p className="trips-card__meta">
                  {trip.municipality_slugs.join(', ')} · {trip.traveler_count} traveler(s)
                </p>
                {trip.total_estimated_cost_php !== undefined && (
                  <p>Estimated total: ₱{trip.total_estimated_cost_php.toLocaleString('en-PH')}</p>
                )}

                {items.length > 0 && (
                  <TripItineraryView
                    items={items}
                    municipalityName={trip.municipality_slugs[0]?.replace(/-/g, ' ')}
                  />
                )}

                <div className="trips-card__actions">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => shareTrip(trip)}
                  >
                    Share trip
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeTrip(trip.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {shareUrl && (
        <p role="status" style={{ marginTop: '1rem' }}>
          Share link: <Link href={shareUrl.replace(window.location.origin, '')}>{shareUrl}</Link>
        </p>
      )}
    </div>
  );
}
