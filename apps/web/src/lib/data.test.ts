import { describe, expect, it } from 'vitest';
import { formatPlaceLocation, publicBarangay } from './data';

describe('formatPlaceLocation', () => {
  it('omits unconfirmed barangay and shows municipality only', () => {
    expect(
      formatPlaceLocation({
        barangay: 'Not publicly confirmed',
        municipality: 'Caramoan',
      }),
    ).toBe('Caramoan, Camarines Sur');
  });

  it('keeps confirmed barangay in the location line', () => {
    expect(
      formatPlaceLocation({
        barangay: 'Barangay Tabgon',
        municipality: 'Caramoan',
      }),
    ).toBe('Barangay Tabgon, Caramoan, Camarines Sur');
  });

  it('prefers a published complete address', () => {
    expect(
      formatPlaceLocation({
        barangay: 'Not publicly confirmed',
        municipality: 'Caramoan',
        completeAddress: 'Barangay Lahuy Island area, Caramoan, Camarines Sur',
      }),
    ).toBe('Barangay Lahuy Island area, Caramoan, Camarines Sur');
  });
});

describe('publicBarangay', () => {
  it('filters internal placeholder barangay values', () => {
    expect(publicBarangay('Not publicly confirmed')).toBe('');
    expect(publicBarangay('Not publicly available')).toBe('');
    expect(publicBarangay('Barangay Nato')).toBe('Barangay Nato');
  });
});
