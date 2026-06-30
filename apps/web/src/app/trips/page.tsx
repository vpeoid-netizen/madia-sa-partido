'use client';

import { useSavedTrips } from '@/lib/client-storage';
import { useState } from 'react';
import Link from 'next/link';
import { TripItineraryView, type TripItineraryItem } from '@/components/TripItineraryView';
import { TripPlannerForm } from '@/components/TripPlannerForm';
import { PlannedTripView, type PlannedTripResult } from '@/components/PlannedTripView';
import { MUNICIPALITY_BY_SLUG } from '@madia/domain';

type SavedPayload = {
  itinerary?: {
    days?: Array<{
      day_number?: number;
      items?: TripItineraryItem[];
    }>;
  };
  budget?: { total_php?: number };
  narrative?: string;
};

export default function TripsPage() {
  const { trips, removeTrip } = useSavedTrips();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [planned, setPlanned] = useState<PlannedTripResult | null>(null);

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
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 className="madia-brand section-title">Plan a trip</h1>
        <p className="section-lead">
          Build a multi-day Partido itinerary with transport, dining, stays, times, and estimated
          rates—then open every stop in Waze.
        </p>
      </header>

      <TripPlannerForm
        onPlan={(result) => {
          setPlanned(result);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {planned && (
        <div style={{ marginTop: '1.5rem' }}>
          <PlannedTripView result={planned} />
        </div>
      )}

      <section style={{ marginTop: '2.5rem' }} aria-labelledby="saved-trips-heading">
        <h2 id="saved-trips-heading" className="section-title" style={{ fontSize: '1.5rem' }}>
          Saved trips
        </h2>
        <p className="section-lead">Your saved itineraries on this device.</p>

        {trips.length === 0 ? (
          <div className="empty-state">
            No saved trips yet. Generate an itinerary above and tap Save itinerary.
          </div>
        ) : (
          <ul className="trips-list">
            {trips.map((trip) => {
              const payload = trip.payload as SavedPayload;
              const days = payload.itinerary?.days ?? [];

              return (
                <li key={trip.id} className="madia-glass trips-card">
                  <strong>{trip.title}</strong>
                  <p className="trips-card__meta">
                    {trip.municipality_slugs.join(', ')} · {trip.traveler_count} traveler(s)
                  </p>
                  {trip.total_estimated_cost_php !== undefined && (
                    <p>Estimated total: ₱{trip.total_estimated_cost_php.toLocaleString('en-PH')}</p>
                  )}

                  {days.map((day) => {
                    const items = day.items ?? [];
                    if (items.length === 0) return null;
                    const slug = items[0]?.municipality_slug;
                    const municipalityName =
                      slug && slug in MUNICIPALITY_BY_SLUG
                        ? MUNICIPALITY_BY_SLUG[slug as keyof typeof MUNICIPALITY_BY_SLUG].displayName
                        : trip.municipality_slugs[0]?.replace(/-/g, ' ');

                    return (
                      <div key={day.day_number ?? items[0]?.id} className="planned-trip__day">
                        {days.length > 1 && <h3>Day {day.day_number ?? '—'}</h3>}
                        <TripItineraryView items={items} municipalityName={municipalityName} />
                      </div>
                    );
                  })}

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
      </section>

      {shareUrl && (
        <p role="status" style={{ marginTop: '1rem' }}>
          Share link: <Link href={shareUrl.replace(window.location.origin, '')}>{shareUrl}</Link>
        </p>
      )}
    </div>
  );
}
