import { describe, expect, it } from 'vitest';
import type { Place } from '@madia/domain';
import { assignUniquePlaceImages } from './images';
import { normalizePhotoUrl } from './image-utils';

describe('normalizePhotoUrl', () => {
  it('converts Wikimedia redirect URLs to FilePath URLs', () => {
    const url = normalizePhotoUrl(
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Atulayan_Island_01.jpg',
    );
    expect(url).toContain('Special:FilePath');
    expect(url).toContain('Atulayan_Island_01.jpg');
  });

  it('preserves direct upload URLs', () => {
    const url = normalizePhotoUrl(
      'https://upload.wikimedia.org/wikipedia/commons/0/04/Caramoan_Gota_Beach_Front_I.jpg',
    );
    expect(url).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/0/04/Caramoan_Gota_Beach_Front_I.jpg',
    );
  });

  it('returns null for empty values', () => {
    expect(normalizePhotoUrl('')).toBeNull();
    expect(normalizePhotoUrl(null)).toBeNull();
  });
});

describe('assignUniquePlaceImages', () => {
  it('assigns unique images to Caramoan featured stays', () => {
    const stays: Place[] = [
      {
        record_id: 'MADIA-CAR-ACC-001',
        record_type: 'accommodation',
        municipality_id: 'MADIA-MUN-CAR',
        official_name: 'Tugawe Cove Resort',
      },
      {
        record_id: 'MADIA-CAR-ACC-002',
        record_type: 'accommodation',
        municipality_id: 'MADIA-MUN-CAR',
        official_name: 'Gota Village Resort',
      },
      {
        record_id: 'MADIA-CAR-ACC-003',
        record_type: 'accommodation',
        municipality_id: 'MADIA-MUN-CAR',
        official_name: 'Residencia de Salvacion',
      },
      {
        record_id: 'MADIA-CAR-ACC-004',
        record_type: 'accommodation',
        municipality_id: 'MADIA-MUN-CAR',
        official_name: 'Paniman Bay Lodge',
      },
      {
        record_id: 'MADIA-CAR-ACC-005',
        record_type: 'accommodation',
        municipality_id: 'MADIA-MUN-CAR',
        official_name: "RMTM's Front Beach Resort",
      },
      {
        record_id: 'MADIA-CAR-ACC-006',
        record_type: 'accommodation',
        municipality_id: 'MADIA-MUN-CAR',
        official_name: 'Airusxander Beach Resort',
      },
    ] as Place[];

    const images = assignUniquePlaceImages(stays);
    const urls = [...images.values()].map((image) => image.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
