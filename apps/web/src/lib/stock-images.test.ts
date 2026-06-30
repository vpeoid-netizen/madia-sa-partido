import { describe, expect, it } from 'vitest';
import { getStockImageForPlace } from './stock-images';

describe('getStockImageForPlace', () => {
  it('returns accommodation beach imagery', () => {
    const image = getStockImageForPlace({
      record_id: 'MADIA-CAR-ACC-001',
      record_type: 'accommodation',
    } as never);
    expect(image?.url).toContain('wikimedia.org');
    expect(image?.attribution).toBeTruthy();
  });

  it('returns restaurant food imagery', () => {
    const image = getStockImageForPlace({
      record_id: 'MADIA-CAR-RES-001',
      record_type: 'restaurant',
    } as never);
    expect(image?.url).toContain('wikimedia.org');
    expect(image?.url).toMatch(/pusit|Kinilaw|Market|Adobong/i);
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
  it('varies images by record id', () => {
    const urls = new Set(
      ['MADIA-CAR-RES-001', 'MADIA-CAR-RES-002', 'MADIA-CAR-RES-003', 'MADIA-CAR-RES-004'].map(
        (record_id) =>
          getStockImageForPlace({
            record_id,
            record_type: 'restaurant',
          } as never)?.url,
      ),
    );
    expect(urls.size).toBeGreaterThan(1);
  });
});
