import type { Place } from '@madia/domain';
import { MUNICIPALITY_BY_SLUG, normalizeSearchText, searchPlaces } from '@madia/domain';

export interface AiContext {
  places: Place[];
  municipalityName?: string;
}

export interface AiResponse {
  answer: string;
  grounded_records: Array<{
    record_id: string;
    official_name: string;
    verification_status: string;
    source?: string;
    last_confirmed?: string;
  }>;
  assumptions: string[];
  unavailable: string[];
  provider: 'grounded' | 'ollama' | 'groq' | 'gemini' | 'openai';
  model?: string;
}

const SYSTEM_RULES = [
  'Use only approved MADIA records.',
  'Never invent prices, schedules, contacts, or routes.',
  'Say "Information not yet available" when data is missing.',
  'Distinguish verified from partially verified information.',
];

interface SearchSignals {
  keywords: string[];
  recordTypes?: string[];
  municipalityHint?: string;
  isGeneralBrowse: boolean;
  isItinerary: boolean;
}

const INTENT_PATTERNS: Array<{
  pattern: RegExp;
  terms: string[];
  types?: string[];
}> = [
  {
    pattern: /stay|accommodation|hotel|resort|lodge|where to sleep|place to stay/i,
    terms: ['resort', 'hotel', 'accommodation'],
    types: ['accommodation'],
  },
  {
    pattern: /food|eat|restaurant|dining|seafood|meal|lunch|dinner|grill/i,
    terms: ['restaurant', 'food', 'grill'],
    types: ['restaurant'],
  },
  {
    pattern: /beach|island|swim|snorkel|sandbar|coast|sea|cove/i,
    terms: ['beach', 'island'],
    types: ['attraction'],
  },
  {
    pattern: /fall|falls|waterfall|nature|trail|hike|mountain|spring/i,
    terms: ['falls', 'nature', 'spring'],
    types: ['attraction'],
  },
  {
    pattern: /church|heritage|culture|histor|parish|shrine/i,
    terms: ['church', 'heritage'],
    types: ['cultural_site', 'attraction'],
  },
  {
    pattern: /festival|fiesta|event|celebration/i,
    terms: ['festival'],
    types: ['festival_event'],
  },
  {
    pattern: /transport|route|boat|ferry|jeepney|bus|travel to|getting around/i,
    terms: ['transport', 'route', 'boat'],
    types: ['transportation_route', 'tourism_service'],
  },
];

const STOP_WORDS = new Set([
  'what',
  'can',
  'could',
  'would',
  'should',
  'i',
  'do',
  'in',
  'for',
  'one',
  'day',
  'the',
  'a',
  'an',
  'is',
  'are',
  'there',
  'any',
  'please',
  'how',
  'to',
  'get',
  'around',
  'where',
  'stay',
  'at',
  'on',
  'my',
  'me',
  'tell',
  'about',
  'visit',
  'see',
  'go',
  'best',
  'good',
  'nice',
  'some',
  'with',
  'and',
  'or',
  'of',
]);

function detectMunicipalityInText(text: string): string | undefined {
  const normalized = normalizeSearchText(text);
  for (const meta of Object.values(MUNICIPALITY_BY_SLUG)) {
    const name = normalizeSearchText(meta.displayName);
    if (normalized.includes(name)) return meta.displayName;
  }
  if (normalized.includes('san jose')) return 'San Jose';
  return undefined;
}

function analyzeQuestion(question: string, municipalityName?: string): SearchSignals {
  const q = question.toLowerCase();
  const isItinerary =
    /what can i|things to do|one day|itinerary|activities|suggest|recommend|plan/i.test(q);
  const isGeneralBrowse = isItinerary || /explore|see in|do in|visit/i.test(q);

  const municipalityHint = municipalityName || detectMunicipalityInText(question);

  let recordTypes: string[] | undefined;
  const keywords: string[] = [];

  for (const intent of INTENT_PATTERNS) {
    if (intent.pattern.test(q)) {
      keywords.push(...intent.terms);
      recordTypes = intent.types;
      break;
    }
  }

  const words = q
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  const municipalityNorm = municipalityHint ? normalizeSearchText(municipalityHint) : '';
  for (const word of words) {
    if (normalizeSearchText(word) !== municipalityNorm) keywords.push(word);
  }

  return {
    keywords: [...new Set(keywords)],
    recordTypes,
    municipalityHint,
    isGeneralBrowse,
    isItinerary,
  };
}

function isNamedPlace(place: Place): boolean {
  return Boolean(place.official_name?.trim() && place.record_id);
}

function filterByMunicipality(places: Place[], municipalityHint: string): Place[] {
  const hint = normalizeSearchText(municipalityHint);
  return places.filter((place) => {
    const municipality = normalizeSearchText(place.municipality || '');
    return municipality.includes(hint) || hint.includes(municipality);
  });
}

function findExplicitPlaceMention(question: string, pool: Place[]): Place | undefined {
  const normalizedQuestion = normalizeSearchText(question);

  const ranked = pool
    .map((place) => {
      const name = normalizeSearchText(place.official_name);
      if (!name) return { place, score: 0 };

      if (normalizedQuestion.includes(name)) return { place, score: 100 };

      const nameWords = name.split(/\s+/).filter((word) => word.length > 3);
      const matchedWords = nameWords.filter((word) => normalizedQuestion.includes(word));
      if (nameWords.length > 0 && matchedWords.length === nameWords.length) {
        return { place, score: 90 };
      }
      if (matchedWords.length >= 2) return { place, score: 75 };

      return { place, score: 0 };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.place;
}

function findRelevantPlaces(
  context: AiContext,
  question: string,
  focusRecordId?: string,
): { matches: Place[]; signals: SearchSignals } {
  const places = context.places.filter(isNamedPlace);
  const signals = analyzeQuestion(question, context.municipalityName);

  if (focusRecordId) {
    const focus = places.find((place) => place.record_id === focusRecordId);
    if (focus) return { matches: [focus], signals };
  }

  let pool = places;
  if (signals.municipalityHint) {
    const scoped = filterByMunicipality(places, signals.municipalityHint);
    if (scoped.length > 0) pool = scoped;
  }

  const explicitPlace = findExplicitPlaceMention(question, pool);
  if (explicitPlace) return { matches: [explicitPlace], signals };

  let matches = searchPlaces(pool, { query: question, limit: 5 });
  if (matches.length > 0) return { matches, signals };

  const keywordQuery = signals.keywords.join(' ');
  if (keywordQuery) {
    const typePool = signals.recordTypes
      ? pool.filter((place) => signals.recordTypes!.includes(place.record_type))
      : pool;
    matches = searchPlaces(typePool.length > 0 ? typePool : pool, {
      query: keywordQuery,
      limit: 5,
    });
    if (matches.length > 0) return { matches, signals };
  }

  if (signals.recordTypes) {
    const typed = pool.filter((place) => signals.recordTypes!.includes(place.record_type));
    if (typed.length > 0) return { matches: typed.slice(0, 5), signals };
  }

  if (signals.isGeneralBrowse) {
    const browse = pool.filter((place) =>
      ['attraction', 'cultural_site', 'festival_event'].includes(place.record_type),
    );
    if (browse.length > 0) return { matches: browse.slice(0, 5), signals };
  }

  if (signals.municipalityHint) {
    const fallback = pool.filter((place) =>
      ['attraction', 'cultural_site', 'accommodation', 'restaurant'].includes(place.record_type),
    );
    if (fallback.length > 0) return { matches: fallback.slice(0, 5), signals };
  }

  return { matches: [], signals };
}

function formatPlaceSummary(place: Place): string {
  const parts = [`${place.official_name} (${place.category})`];
  if (place.short_description) parts.push(place.short_description);
  const fee = place.entrance_fee || place.price_range;
  if (fee && !fee.toLowerCase().includes('not publicly')) {
    parts.push(`Fee note: ${fee}`);
  }
  return parts.join(' — ');
}

function buildSinglePlaceAnswer(place: Place, context: AiContext): string {
  const fee = place.entrance_fee || place.price_range;
  const feeText =
    fee && !fee.toLowerCase().includes('not publicly')
      ? `Reported fee or price note: ${fee}.`
      : 'Fee information not yet available in MADIA.';

  const hours =
    place.operating_status && !place.operating_status.toLowerCase().includes('requires confirmation')
      ? `Operating status: ${place.operating_status}.`
      : 'Operating hours not yet available in MADIA.';

  return [
    `${place.official_name} is listed in MADIA as a ${place.category.toLowerCase()} in ${place.municipality || context.municipalityName || 'Partido'}.`,
    place.short_description || 'Detailed description not yet available.',
    feeText,
    hours,
    place.date_information_last_confirmed
      ? `Last updated: ${place.date_information_last_confirmed}.`
      : null,
    place.primary_source ? 'See the linked source record for details.' : null,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildMultiPlaceAnswer(matches: Place[], context: AiContext, signals: SearchSignals): string {
  const scope = signals.municipalityHint || context.municipalityName || 'Partido';
  const intro = signals.isItinerary
    ? `Here are published MADIA places you could consider for a visit in ${scope}:`
    : `Based on MADIA records in ${scope}, these places may match your question:`;

  const bullets = matches.map((place, index) => `${index + 1}. ${formatPlaceSummary(place)}`).join('\n');

  return `${intro}\n\n${bullets}\n\nSchedules, contacts, and live fees should be confirmed with each site. Information not yet available in MADIA is not listed here.`;
}

function toGroundedRecords(matches: Place[]) {
  return matches.map((place) => ({
    record_id: place.record_id,
    official_name: place.official_name,
    verification_status: place.verification_status,
    source: place.primary_source,
    last_confirmed: place.date_information_last_confirmed,
  }));
}

export function groundedConciergeReply(
  question: string,
  context: AiContext,
  focusRecordId?: string,
): AiResponse {
  const assumptions = [...SYSTEM_RULES];
  const unavailable: string[] = [];
  const trimmed = question.trim();

  if (!trimmed) {
    return {
      answer: 'Please enter a question about places, food, stays, or activities in Partido.',
      grounded_records: [],
      assumptions,
      unavailable: ['No question provided'],
      provider: 'grounded',
    };
  }

  const { matches, signals } = findRelevantPlaces(context, trimmed, focusRecordId);

  if (matches.length === 0) {
    return {
      answer:
        'I could not find matching MADIA records for that question in the current scope. Information not yet available for unsupported claims.',
      grounded_records: [],
      assumptions,
      unavailable: ['No matching place record in repository scope'],
      provider: 'grounded',
    };
  }

  if (matches.length === 1) {
    const focus = matches[0];
    if (!focus.primary_source) unavailable.push('Primary source not attached');
    if (!focus.date_information_last_confirmed) unavailable.push('Last confirmation date');

    return {
      answer: buildSinglePlaceAnswer(focus, context),
      grounded_records: toGroundedRecords([focus]),
      assumptions,
      unavailable,
      provider: 'grounded',
    };
  }

  return {
    answer: buildMultiPlaceAnswer(matches, context, signals),
    grounded_records: toGroundedRecords(matches),
    assumptions,
    unavailable,
    provider: 'grounded',
  };
}

export const AI_TOOL_NAMES = [
  'search_municipalities',
  'get_municipality_summary',
  'search_places',
  'get_place_details',
  'find_nearby_places',
  'get_prices',
  'get_operating_hours',
  'search_transport_routes',
  'calculate_trip_budget',
  'create_itinerary',
  'get_verification_status',
] as const;
