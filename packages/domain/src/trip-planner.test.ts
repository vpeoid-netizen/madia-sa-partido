import { describe, expect, it } from 'vitest';
import type { Place } from './schemas.js';
import { planTripFromPreferences } from './trip-planner.js';

function samplePlace(overrides: Partial<Place> = {}): Place {
  return {
    record_id: 'MADIA-TEST-1',
    official_name: 'Test Beach',
    municipality_id: 'MADIA-MUN-CAR',
    municipality: 'Caramoan',
    record_type: 'attraction',
    category: 'Beach',
    verification_status: 'Verified',
    application_page_route: '/caramoan/test-beach',
    entrance_fee: '₱50',
    ...overrides,
  } as Place;
}

describe('planTripFromPreferences', () => {
  const pool: Place[] = [
    samplePlace({ record_id: 'A1', official_name: 'Matukad Island', category: 'Beach island' }),
    samplePlace({
      record_id: 'R1',
      record_type: 'restaurant',
      official_name: 'Seaside Grill',
      category: 'Restaurant',
      entrance_fee: undefined,
      price_range: '₱250–400',
    }),
    samplePlace({
      record_id: 'T1',
      record_type: 'transportation_route',
      official_name: 'Boat to islands',
      category: 'Boat',
      entrance_fee: '₱200 per person',
    }),
    samplePlace({
      record_id: 'H1',
      record_type: 'accommodation',
      official_name: 'Bayview Lodge',
      category: 'Resort',
      price_range: '₱2,500',
    }),
    samplePlace({
      record_id: 'A2',
      official_name: 'Our Lady Church',
      record_type: 'cultural_site',
      category: 'Heritage church',
    }),
  ];

  it('builds a multi-day itinerary with budget and narrative', () => {
    const result = planTripFromPreferences(pool, {
      municipalitySlugs: ['caramoan'],
      days: 2,
      travelers: 2,
      interests: ['beach', 'food'],
      activityNotes: 'island hopping',
      foodNotes: 'seafood',
      budgetPhp: 20000,
    });

    expect(result.trip.days).toHaveLength(2);
    expect(result.trip.days[0].items.length).toBeGreaterThan(0);
    expect(result.budget.total_php).toBeGreaterThan(0);
    expect(result.narrative).toContain('2-day');
    expect(result.narrative).toContain('seafood');
  });

  it('returns stops with coordinates when available', () => {
    const result = planTripFromPreferences(
      [
        samplePlace({
          record_id: 'G1',
          latitude: '10.5001',
          longitude: '123.7002',
          complete_address: 'Poblacion',
        }),
      ],
      {
        municipalitySlugs: ['caramoan'],
        days: 1,
        travelers: 1,
        interests: ['beach'],
      },
    );

    const first = result.trip.days[0]?.items[0];
    expect(first?.latitude).toBeCloseTo(10.5001);
    expect(first?.longitude).toBeCloseTo(123.7002);
    expect(first?.address).toContain('Poblacion');
  });
});
