import { describe, expect, it } from 'vitest';
import { getStockImageForPlace, getStockImageCandidatesForPlace } from './stock-images';

describe('getStockImageForPlace', () => {
  it('returns verified place photo for Gota Beach by name', () => {
    const image = getStockImageForPlace({
      record_id: 'MADIA-CAR-ATT-005',
      record_type: 'attraction',
      municipality_id: 'MADIA-MUN-CAR',
      official_name: 'Gota Beach',
      category: 'Natural Attraction',
    } as never);
    expect(image?.url).toMatch(/Gota_Beach|Gota-Beach/i);
  });

  it('returns municipality scenery for restaurants instead of unrelated food stock', () => {
    const image = getStockImageForPlace({
      record_id: 'MADIA-GOA-RES-001',
      record_type: 'restaurant',
      municipality_id: 'MADIA-MUN-GOA',
      official_name: 'Local Grill House',
      category: 'Restaurant',
    } as never);
    expect(image?.url).toContain('wikimedia.org');
    expect(image?.url).toMatch(/Goa|goa/i);
    expect(image?.url).not.toMatch(/Kinilaw|Mindanao|pusit/i);
  });

  it('returns attraction island imagery for island names', () => {
    const image = getStockImageForPlace({
      record_id: 'MADIA-CAR-ATT-099',
      record_type: 'attraction',
      municipality_id: 'MADIA-MUN-CAR',
      official_name: 'Matukad Island',
      category: 'Natural Attraction',
    } as never);
    expect(image?.url).toContain('wikimedia.org');
  });

  it('returns cultural site church imagery', () => {
    const image = getStockImageForPlace({
      record_id: 'MADIA-GOA-CUL-001',
      record_type: 'cultural_site',
      official_name: 'Goa Church',
      category: 'Heritage',
    } as never);
    expect(image?.url).toMatch(/church|Church|Goa/i);
  });

  it('returns municipality scenery for festivals instead of unrelated churches', () => {
    const image = getStockImageForPlace({
      record_id: 'MADIA-CAR-FES-001',
      record_type: 'festival_event',
      municipality_id: 'MADIA-MUN-CAR',
      official_name: 'Isla Carahan Festival',
      category: 'Festival',
    } as never);
    expect(image?.url).toContain('wikimedia.org');
    expect(image?.url).not.toMatch(/St\._Joseph|San_Jose/i);
  });

  it('returns local parish church for parish fiestas when available', () => {
    const image = getStockImageForPlace({
      record_id: 'MADIA-GOA-FES-001',
      record_type: 'festival_event',
      municipality_id: 'MADIA-MUN-GOA',
      official_name: 'Saint Michael Parish Fiesta',
      category: 'Religious Festival',
    } as never);
    expect(image?.url).toMatch(/Goa_Church/i);
  });
  it('varies images by record id within the same municipality', () => {
    const urls = new Set(
      ['MADIA-CAR-ATT-002', 'MADIA-CAR-ATT-003', 'MADIA-CAR-ATT-004', 'MADIA-CAR-ATT-005'].map(
        (record_id) =>
          getStockImageForPlace({
            record_id,
            record_type: 'attraction',
            municipality_id: 'MADIA-MUN-CAR',
            official_name: record_id,
          } as never)?.url,
      ),
    );
    expect(urls.size).toBeGreaterThan(1);
  });

  it('returns multiple candidates for accommodations', () => {
    const candidates = getStockImageCandidatesForPlace({
      record_id: 'MADIA-CAR-ACC-001',
      record_type: 'accommodation',
      municipality_id: 'MADIA-MUN-CAR',
      official_name: 'Tugawe Cove Resort',
      category: 'Accommodation',
    } as never);
    expect(candidates.length).toBeGreaterThan(3);
  });
});
