'use client';

import { useSavedTrips } from '@/lib/client-storage';
import { useState } from 'react';
import Link from 'next/link';

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
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="madia-brand">Saved trips</h1>
      {trips.length === 0 ? (
        <div className="empty-state">
          No saved trips yet. Open a place, build a plan, and tap Save trip.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.65rem' }}>
          {trips.map((trip) => (
            <li key={trip.id} className="madia-glass" style={{ padding: '0.85rem' }}>
              <strong>{trip.title}</strong>
              <p style={{ margin: '0.35rem 0' }}>
                {trip.municipality_slugs.join(', ')} · {trip.traveler_count} traveler(s)
              </p>
              {trip.total_estimated_cost_php !== undefined && (
                <p>Estimated total: ₱{trip.total_estimated_cost_php.toLocaleString('en-PH')}</p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
          ))}
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
