import { normalizeSearchText } from './constants.js';
import type { Place } from './schemas.js';

export interface SearchOptions {
  query?: string;
  municipalityId?: string;
  category?: string;
  verifiedOnly?: boolean;
  limit?: number;
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

function textScore(query: string, target: string): number {
  if (!target) return 0;
  const q = normalizeSearchText(query);
  const t = normalizeSearchText(target);
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 75;
  const distance = levenshtein(q, t);
  const maxLen = Math.max(q.length, t.length);
  const similarity = 1 - distance / maxLen;
  return similarity > 0.72 ? Math.round(similarity * 60) : 0;
}

export function searchPlaces(places: Place[], options: SearchOptions): Place[] {
  const limit = options.limit ?? 50;
  const query = options.query?.trim();

  let results = places.filter((place) => {
    if (options.municipalityId && place.municipality_id !== options.municipalityId) {
      return false;
    }
    if (options.category && place.category !== options.category) return false;
    if (options.verifiedOnly) {
      const status = place.verification_status.toLowerCase();
      if (!status.includes('verified') || status.includes('unverified')) return false;
    }
    return true;
  });

  if (query) {
    results = results
      .map((place) => {
        const score = Math.max(
          textScore(query, place.official_name),
          textScore(query, place.alternate_or_local_name || ''),
          textScore(query, place.municipality || ''),
          textScore(query, place.barangay || ''),
          textScore(query, place.category),
        );
        const verificationBoost =
          score > 0 && place.verification_status.toLowerCase().includes('verified') ? 8 : 0;
        return { place, score: score + verificationBoost };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.place);
  } else {
    results = [...results].sort((a, b) => (a.official_name || '').localeCompare(b.official_name || ''));
  }

  return results.slice(0, limit);
}
