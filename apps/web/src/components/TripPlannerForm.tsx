'use client';

import { useState } from 'react';
import { MUNICIPALITY_BY_SLUG, MUNICIPALITY_SLUGS } from '@madia/domain';
import { type PlannedTripResult } from '@/components/PlannedTripView';

const INTEREST_OPTIONS = [
  { id: 'beach', label: 'Beaches & islands' },
  { id: 'food', label: 'Local food' },
  { id: 'heritage', label: 'Heritage & culture' },
  { id: 'waterfall', label: 'Waterfalls' },
  { id: 'nature', label: 'Nature & trails' },
  { id: 'festival', label: 'Festivals & events' },
] as const;

export function TripPlannerForm({
  onPlan,
}: {
  onPlan: (result: PlannedTripResult) => void;
}) {
  const [municipalitySlugs, setMunicipalitySlugs] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>(['beach', 'food', 'nature']);
  const [days, setDays] = useState(2);
  const [travelers, setTravelers] = useState(2);
  const [budgetPhp, setBudgetPhp] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  const [foodNotes, setFoodNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMunicipality(slug: string) {
    setMunicipalitySlugs((current) =>
      current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug],
    );
  }

  function toggleInterest(id: string) {
    setInterests((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trips/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipalitySlugs,
          days,
          travelers,
          budgetPhp: budgetPhp ? Number(budgetPhp) : undefined,
          interests,
          activityNotes,
          foodNotes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Could not build your itinerary. Please try again.');
        return;
      }
      onPlan(data as PlannedTripResult);
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="madia-glass detail-panel trip-planner" aria-labelledby="trip-planner-heading">
      <p className="section-kicker">AI trip planner</p>
      <h2 id="trip-planner-heading">Plan your Partido trip</h2>
      <p className="section-lead" style={{ marginTop: 0 }}>
        Tell us where to go, what to do and eat, how long you are staying, and your budget. MADIA
        builds a day-by-day itinerary with transport, times, stays, and estimated rates from
        published records.
      </p>

      <form className="trip-planner__form" onSubmit={handleSubmit}>
        <fieldset className="trip-planner__field">
          <legend>Where do you want to go?</legend>
          <p className="trip-planner__hint">Select one or more municipalities, or leave blank for MADIA to suggest.</p>
          <div className="trip-planner__chips">
            {MUNICIPALITY_SLUGS.map((slug) => (
              <label key={slug} className="trip-planner__chip">
                <input
                  type="checkbox"
                  checked={municipalitySlugs.includes(slug)}
                  onChange={() => toggleMunicipality(slug)}
                />
                <span>{MUNICIPALITY_BY_SLUG[slug].displayName}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="trip-planner__field">
          <legend>What do you want to do?</legend>
          <div className="trip-planner__chips">
            {INTEREST_OPTIONS.map((option) => (
              <label key={option.id} className="trip-planner__chip">
                <input
                  type="checkbox"
                  checked={interests.includes(option.id)}
                  onChange={() => toggleInterest(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <label className="trip-planner__textarea-label">
            Specific activities (optional)
            <textarea
              value={activityNotes}
              onChange={(event) => setActivityNotes(event.target.value)}
              rows={2}
              placeholder="e.g. island hopping, church visits, early morning hike"
            />
          </label>
        </fieldset>

        <fieldset className="trip-planner__field">
          <legend>What do you want to eat?</legend>
          <label className="trip-planner__textarea-label">
            Food preferences (optional)
            <textarea
              value={foodNotes}
              onChange={(event) => setFoodNotes(event.target.value)}
              rows={2}
              placeholder="e.g. seafood grill, local kakanin, budget-friendly carinderia"
            />
          </label>
        </fieldset>

        <div className="trip-planner__row">
          <label>
            Number of days
            <input
              type="number"
              min={1}
              max={7}
              value={days}
              onChange={(event) => setDays(Number(event.target.value) || 1)}
            />
          </label>
          <label>
            Number of travelers
            <input
              type="number"
              min={1}
              max={20}
              value={travelers}
              onChange={(event) => setTravelers(Number(event.target.value) || 1)}
            />
          </label>
          <label>
            Total budget (₱, optional)
            <input
              type="number"
              min={0}
              step={500}
              value={budgetPhp}
              onChange={(event) => setBudgetPhp(event.target.value)}
              placeholder="e.g. 15000"
            />
          </label>
        </div>

        {error && (
          <p className="trip-planner__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Building your itinerary…' : 'Generate itinerary'}
        </button>
      </form>
    </section>
  );
}
