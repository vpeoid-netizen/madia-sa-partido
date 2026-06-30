'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'madia-saved-trips';

export interface SavedTrip {
  id: string;
  title: string;
  municipality_slugs: string[];
  traveler_count: number;
  total_estimated_cost_php?: number;
  updated_at: string;
  payload: unknown;
}

export function useSavedTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTrips(JSON.parse(raw));
    } catch {
      setTrips([]);
    }
  }, []);

  const persist = (next: SavedTrip[]) => {
    setTrips(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return {
    trips,
    saveTrip(trip: SavedTrip) {
      const existing = trips.filter((t) => t.id !== trip.id);
      persist([trip, ...existing]);
    },
    removeTrip(id: string) {
      persist(trips.filter((t) => t.id !== id));
    },
  };
}

export function useAccessibilityPreferences() {
  const [simplified, setSimplified] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setSimplified(localStorage.getItem('madia-simplified-mode') === '1');
    setHighContrast(localStorage.getItem('madia-high-contrast') === '1');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.simplified = simplified ? 'true' : 'false';
    document.documentElement.dataset.highContrast = highContrast ? 'true' : 'false';
    localStorage.setItem('madia-simplified-mode', simplified ? '1' : '0');
    localStorage.setItem('madia-high-contrast', highContrast ? '1' : '0');
  }, [simplified, highContrast]);

  return { simplified, setSimplified, highContrast, setHighContrast };
}
