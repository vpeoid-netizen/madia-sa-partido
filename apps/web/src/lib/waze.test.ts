import { describe, expect, it } from 'vitest';
import { wazeLinkForStop, wazeRouteLink } from './waze';

describe('waze links', () => {
  it('builds coordinate navigation links', () => {
    const url = wazeLinkForStop(
      { place_name: 'Gota Beach', latitude: 10.195, longitude: 123.871 },
      { navigate: true },
    );
    expect(url).toContain('waze.com/ul');
    expect(url).toContain('ll=10.195%2C123.871');
    expect(url).toContain('navigate=yes');
  });

  it('falls back to place name search when coordinates are missing', () => {
    const url = wazeLinkForStop({
      place_name: 'Atulayan Island',
      municipality: 'sagnay',
    });
    expect(url).toContain('q=Atulayan');
    expect(url).toContain('Camarines+Sur');
  });

  it('returns a route link for the first stop', () => {
    const url = wazeRouteLink([
      { place_name: 'Gota Beach', latitude: 10.1, longitude: 123.8 },
      { place_name: 'Lahos Island', latitude: 10.2, longitude: 123.9 },
    ]);
    expect(url).toContain('navigate=yes');
  });
});
