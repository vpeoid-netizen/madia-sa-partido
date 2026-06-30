import { describe, expect, it } from 'vitest';
import { buildCarouselSlides } from './carousel';
import { loadRuntimeData } from './data';

describe('buildCarouselSlides', () => {
  it('includes all imported attractions when runtime data exists', () => {
    const runtime = loadRuntimeData();
    if (!runtime) {
      expect(true).toBe(true);
      return;
    }
    const attractionCount = runtime.places.filter((p) => p.record_type === 'attraction').length;
    const slides = buildCarouselSlides();
    expect(slides.length).toBe(attractionCount);
    expect(slides.every((s) => s.destination_name && s.destination_page_route)).toBe(true);
    expect(slides.every((s) => !s.barangay_name?.toLowerCase().includes('not publicly'))).toBe(true);
  });
});
