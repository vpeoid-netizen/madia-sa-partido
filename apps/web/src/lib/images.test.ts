import { describe, expect, it } from 'vitest';
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
