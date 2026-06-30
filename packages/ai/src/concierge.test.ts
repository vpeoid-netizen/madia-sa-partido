import { describe, expect, it } from 'vitest';
import { groundedConciergeReply } from './concierge';
import type { Place } from '@madia/domain';

const samplePlace: Place = {
  record_id: 'MADIA-CAR-ATT-001',
  municipality_id: 'MADIA-MUN-CAR',
  category: 'Beach',
  official_name: 'Gota Beach',
  verification_status: 'verified',
  record_type: 'attraction',
  municipality: 'Caramoan',
  short_description: 'White-sand cove popular for swimming.',
  entrance_fee: 'PHP 50',
  primary_source: 'MADIA repository',
  date_information_last_confirmed: '2026-01-15',
};

const goaAttraction: Place = {
  record_id: 'MADIA-GOA-ATT-001',
  municipality_id: 'MADIA-MUN-GOA',
  category: 'Natural Attraction',
  official_name: 'Hiwacloy Sulfur Spring',
  verification_status: 'PARTIALLY VERIFIED',
  record_type: 'attraction',
  municipality: 'Goa',
  short_description: 'Natural spring area in Goa.',
};

const goaChurch: Place = {
  record_id: 'MADIA-GOA-CUL-001',
  municipality_id: 'MADIA-MUN-GOA',
  category: 'Heritage',
  official_name: 'Goa Church',
  verification_status: 'PARTIALLY VERIFIED',
  record_type: 'cultural_site',
  municipality: 'Goa',
  short_description: 'Historic parish church.',
};

describe('groundedConciergeReply', () => {
  it('returns grounded answer for matching place', () => {
    const response = groundedConciergeReply(
      'Gota Beach',
      {
        places: [samplePlace],
        municipalityName: 'Caramoan',
      },
      samplePlace.record_id,
    );
    expect(response.answer).toContain('Gota Beach');
    expect(response.grounded_records).toHaveLength(1);
    expect(response.grounded_records[0].record_id).toBe('MADIA-CAR-ATT-001');
  });

  it('does not invent data when no match exists', () => {
    const response = groundedConciergeReply('Tell me about Atlantis Resort', {
      places: [samplePlace],
    });
    expect(response.grounded_records).toHaveLength(0);
    expect(response.answer).toContain('Information not yet available');
  });

  it('answers natural-language itinerary questions with multiple records', () => {
    const response = groundedConciergeReply('What can I do in Goa for one day?', {
      places: [goaAttraction, goaChurch, samplePlace],
      municipalityName: 'Goa',
    });
    expect(response.grounded_records.length).toBeGreaterThan(0);
    expect(response.answer).toContain('Hiwacloy Sulfur Spring');
    expect(response.answer).not.toContain('Gota Beach');
  });

  it('matches beach intent in natural language', () => {
    const response = groundedConciergeReply('beaches in Caramoan', {
      places: [samplePlace, goaAttraction],
      municipalityName: 'Caramoan',
    });
    expect(response.grounded_records[0]?.official_name).toBe('Gota Beach');
  });

  it('matches accommodation intent', () => {
    const resort: Place = {
      ...samplePlace,
      record_id: 'MADIA-CAR-ACC-001',
      record_type: 'accommodation',
      category: 'Resort',
      official_name: 'Gota Village Resort',
    };
    const response = groundedConciergeReply('Where can I stay in Caramoan?', {
      places: [samplePlace, resort],
      municipalityName: 'Caramoan',
    });
    expect(response.grounded_records[0]?.official_name).toBe('Gota Village Resort');
  });

  it('prioritizes an explicitly named place in the question', () => {
    const response = groundedConciergeReply('Tell me about Gota Beach', {
      places: [samplePlace, goaAttraction],
      municipalityName: 'Caramoan',
    });
    expect(response.grounded_records).toHaveLength(1);
    expect(response.grounded_records[0]?.official_name).toBe('Gota Beach');
  });
});
