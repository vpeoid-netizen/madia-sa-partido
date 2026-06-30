import { describe, expect, it } from 'vitest';
import type { Place } from './schemas.js';
import { searchPlaces } from './search.js';

const sample: Place[] = [
  {
    record_id: '1',
    municipality_id: 'MADIA-MUN-GOA',
    category: 'Natural Attraction',
    official_name: 'Mount Isarog access from Goa',
    verification_status: 'PARTIALLY VERIFIED',
    record_type: 'attraction',
    municipality: 'Goa',
  },
  {
    record_id: '2',
    municipality_id: 'MADIA-MUN-SAG',
    category: 'Natural Attraction',
    official_name: 'Atulayan Island',
    alternate_or_local_name: 'Atulayan',
    verification_status: 'PARTIALLY VERIFIED',
    record_type: 'attraction',
    municipality: 'Sagñay',
  },
];

describe('searchPlaces', () => {
  it('finds accented and unaccented municipality names', () => {
    const sagnay = searchPlaces(sample, { query: 'Sagnay' });
    expect(sagnay[0]?.official_name).toBe('Atulayan Island');
  });

  it('returns no fabricated results for unknown query', () => {
    const none = searchPlaces(sample, { query: 'Nonexistent Place XYZ' });
    expect(none).toHaveLength(0);
  });
});
