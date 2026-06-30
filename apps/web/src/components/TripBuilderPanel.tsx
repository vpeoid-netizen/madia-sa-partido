'use client';

import { useMemo, useState } from 'react';
import { calculateTripBudget, createSampleItinerary } from '@madia/domain';
import { useSavedTrips } from '@/lib/client-storage';

interface PlaceRef {
  record_id: string;
  official_name: string;
  verification_status: string;
  entrance_fee?: string;
}

export function TripBuilderPanel({
  municipalitySlug,
  municipalityName,
  focusPlace,
  places,
}: {
  municipalitySlug: string;
  municipalityName: string;
  focusPlace: PlaceRef;
  places: PlaceRef[];
}) {
  const { saveTrip } = useSavedTrips();
  const [travelerCount, setTravelerCount] = useState(2);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const itinerary = useMemo(() => {
    const selected = [
      focusPlace,
      ...places.filter((p) => p.record_id !== focusPlace.record_id).slice(0, 2),
    ];
    return createSampleItinerary({
      title: `${municipalityName} day trip`,
      municipalitySlug,
      places: selected,
      travelerCount,
    });
  }, [focusPlace, places, municipalityName, municipalitySlug, travelerCount]);

  const fees = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    [focusPlace, ...places].forEach((p) => {
      map[p.record_id] = p.entrance_fee;
    });
    return map;
  }, [focusPlace, places]);

  const budget = useMemo(
    () => calculateTripBudget({ ...itinerary, traveler_count: travelerCount }, fees),
    [itinerary, travelerCount, fees],
  );

  function handleSave() {
    saveTrip({
      id: itinerary.id,
      title: itinerary.title,
      municipality_slugs: [municipalitySlug],
      traveler_count: travelerCount,
      total_estimated_cost_php: budget.total_php,
      updated_at: new Date().toISOString(),
      payload: { itinerary, budget },
    });
    setSavedMessage('Trip saved on this device.');
  }

  return (
    <section className="madia-glass" aria-labelledby="trip-heading" style={{ padding: '1rem' }}>
      <h2 id="trip-heading">Plan and budget</h2>
      <label>
        Travelers
        <input
          type="number"
          min={1}
          max={20}
          value={travelerCount}
          onChange={(e) => setTravelerCount(Number(e.target.value) || 1)}
          style={{ marginLeft: '0.5rem', minHeight: '2.5rem', width: '5rem' }}
        />
      </label>

      <ol style={{ marginTop: '0.75rem' }}>
        {itinerary.days[0]?.items.map((item) => (
          <li key={item.id}>
            {item.start_time}–{item.end_time}: {item.place_name}
          </li>
        ))}
      </ol>

      <div style={{ marginTop: '0.75rem' }}>
        <h3>Estimated budget (PHP)</h3>
        {budget.line_items.length === 0 ? (
          <p className="empty-state">No verified fee amounts available to total yet.</p>
        ) : (
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
          {travelerCount} traveler(s)
        </p>
        <ul style={{ fontSize: '0.85rem' }}>
          {budget.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <button type="button" className="button button-primary" onClick={handleSave}>
        Save trip
      </button>
      {savedMessage && (
        <p role="status" style={{ marginTop: '0.5rem' }}>
          {savedMessage}
        </p>
      )}
    </section>
  );
}
