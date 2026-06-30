import { describe, expect, it } from 'vitest';
import { getPlaceGallery } from './images';

describe('getPlaceGallery', () => {
  it('includes stock imagery when no licensed photo exists', () => {
    const gallery = getPlaceGallery({
      record_id: 'MADIA-CAR-ATT-099',
      record_type: 'attraction',
      municipality_id: 'MADIA-MUN-CAR',
      official_name: 'Matukad Island',
      category: 'Natural Attraction',
    } as never);

    expect(gallery.length).toBeGreaterThan(0);
    expect(gallery[0].url).toContain('wikimedia.org');
  });
});
