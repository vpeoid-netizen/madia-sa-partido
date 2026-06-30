'use client';

import { MUNICIPALITY_BY_SLUG, type BudgetSummary, type Trip } from '@madia/domain';
import { TripItineraryView } from '@/components/TripItineraryView';
import { useSavedTrips } from '@/lib/client-storage';
import { useState } from 'react';

export interface PlannedTripResult {
  trip: Trip;
  budget: BudgetSummary;
  narrative: string;
}

export function PlannedTripView({ result }: { result: PlannedTripResult }) {
  const { saveTrip } = useSavedTrips();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const { trip, budget, narrative } = result;

  function handleSave() {
    saveTrip({
      id: trip.id,
      title: trip.title,
      municipality_slugs: trip.municipality_slugs,
      traveler_count: trip.traveler_count,
      total_estimated_cost_php: budget.total_php,
      updated_at: new Date().toISOString(),
      payload: { itinerary: trip, budget, narrative },
    });
    setSavedMessage('Itinerary saved on this device. Scroll down to find it in Saved trips.');
  }

  return (
    <section className="madia-glass detail-panel planned-trip" aria-labelledby="planned-trip-heading">
      <p className="section-kicker">Your itinerary</p>
      <h2 id="planned-trip-heading">{trip.title}</h2>
      <p className="section-lead" style={{ marginTop: 0, whiteSpace: 'pre-line' }}>
        {narrative}
      </p>

      {trip.days.map((day) => {
        const municipalityName =
          day.items[0]?.municipality_slug &&
          MUNICIPALITY_BY_SLUG[day.items[0].municipality_slug as keyof typeof MUNICIPALITY_BY_SLUG]
            ? MUNICIPALITY_BY_SLUG[day.items[0].municipality_slug as keyof typeof MUNICIPALITY_BY_SLUG]
                .displayName
            : undefined;

        return (
          <div key={day.day_number} className="planned-trip__day">
            <h3>Day {day.day_number}</h3>
            <TripItineraryView items={day.items} municipalityName={municipalityName} />
          </div>
        );
      })}

      <div className="planned-trip__budget">
        <h3>Estimated trip cost</h3>
        {budget.line_items.length > 0 && (
          <ul>
            {budget.line_items.map((line) => (
              <li key={line.label}>
                {line.label}: ₱{line.amount_php.toLocaleString('en-PH')}
                {line.source_note ? ` (${line.source_note})` : ''}
              </li>
            ))}
          </ul>
        )}
        <p>
          <strong>Total estimate:</strong> ₱{budget.total_php.toLocaleString('en-PH')} for{' '}
          {budget.traveler_count} traveler(s)
        </p>
        {budget.assumptions.length > 0 && (
          <ul className="planned-trip__assumptions">
            {budget.assumptions.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
        <p className="trip-planner__hint">
          Rates come from published MADIA records where available. Confirm live fares, boat
          schedules, and room rates before you travel.
        </p>
      </div>

      <button type="button" className="button button-primary" onClick={handleSave}>
        Save itinerary
      </button>
      {savedMessage && <p role="status">{savedMessage}</p>}
    </section>
  );
}
