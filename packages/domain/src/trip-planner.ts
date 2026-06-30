import { MUNICIPALITY_BY_SLUG, type MunicipalitySlug } from './constants.js';
import { calculateTripBudget, parseFeeText, type BudgetSummary } from './budget.js';
import { searchPlaces } from './search.js';
import type { Place, Trip, TripDay, TripItem } from './schemas.js';
import { parseCoordinate } from './schemas.js';

const SLUG_BY_MUNICIPALITY_ID = Object.fromEntries(
  Object.entries(MUNICIPALITY_BY_SLUG).map(([slug, meta]) => [meta.id, slug]),
) as Record<string, MunicipalitySlug>;

export interface TripPlanPreferences {
  municipalitySlugs: MunicipalitySlug[];
  days: number;
  travelers: number;
  budgetPhp?: number;
  interests: string[];
  foodNotes?: string;
  activityNotes?: string;
}

export interface PlannedTripResult {
  trip: Trip;
  budget: BudgetSummary;
  narrative: string;
  fees: Record<string, string | undefined>;
}

const INTEREST_MATCHERS: Record<string, RegExp> = {
  beach: /beach|island|coast|sandbar|cove|marine|snorkel/i,
  food: /restaurant|food|dining|grill|seafood|café|cafe/i,
  heritage: /church|heritage|cultural|parish|shrine|historic/i,
  waterfall: /fall|waterfall|cascade|spring/i,
  nature: /nature|park|trail|mountain|national/i,
  festival: /festival|fiesta|event|celebration/i,
};

const DAY_SLOTS: Array<{
  start: string;
  end: string;
  kinds: Array<Place['record_type'] | 'meal'>;
  activity: string;
}> = [
  { start: '08:00', end: '09:00', kinds: ['transportation_route', 'tourism_service'], activity: 'Travel / transfer' },
  { start: '09:30', end: '11:30', kinds: ['attraction', 'cultural_site'], activity: 'Morning visit' },
  { start: '12:00', end: '13:30', kinds: ['restaurant'], activity: 'Lunch' },
  { start: '14:30', end: '16:30', kinds: ['attraction', 'cultural_site', 'festival_event'], activity: 'Afternoon explore' },
  { start: '17:00', end: '18:00', kinds: ['transportation_route'], activity: 'Local ride / boat transfer' },
  { start: '19:00', end: '20:30', kinds: ['restaurant'], activity: 'Dinner' },
];

function isBrowsable(place: Place): boolean {
  return Boolean(place.official_name?.trim() && place.application_page_route);
}

function placeSlug(place: Place): string {
  return SLUG_BY_MUNICIPALITY_ID[place.municipality_id] || 'partido';
}

function placeAddress(place: Place): string | undefined {
  const barangay = place.barangay?.trim();
  const parts = [place.complete_address, barangay, place.municipality, 'Camarines Sur'].filter(Boolean);
  const joined = parts.join(', ').trim();
  return joined || undefined;
}

function matchesInterests(place: Place, interests: string[]): boolean {
  if (interests.length === 0) return true;
  const text = [
    place.category,
    place.subcategory,
    place.official_name,
    place.short_description,
    place.record_type,
  ]
    .filter(Boolean)
    .join(' ');

  return interests.some((interest) => {
    const pattern = INTEREST_MATCHERS[interest];
    return pattern ? pattern.test(text) : text.toLowerCase().includes(interest.toLowerCase());
  });
}

function rankPlace(place: Place, interests: string[], query: string): number {
  let score = place.verification_status.toLowerCase().includes('verified') ? 10 : 0;
  if (matchesInterests(place, interests)) score += 20;
  if (query) {
    const results = searchPlaces([place], { query, limit: 1 });
    if (results.length > 0) score += 30;
  }
  return score;
}

function pickPlaces(
  pool: Place[],
  recordTypes: Place['record_type'][],
  count: number,
  used: Set<string>,
  interests: string[],
  query: string,
): Place[] {
  const candidates = pool
    .filter((place) => recordTypes.includes(place.record_type))
    .filter((place) => !used.has(place.record_id))
    .map((place) => ({ place, score: rankPlace(place, interests, query) }))
    .sort((a, b) => b.score - a.score || a.place.official_name.localeCompare(b.place.official_name));

  const picked: Place[] = [];
  for (const { place } of candidates) {
    if (picked.length >= count) break;
    picked.push(place);
    used.add(place.record_id);
  }
  return picked;
}

function toTripItem(place: Place, slot: (typeof DAY_SLOTS)[number], index: number): TripItem {
  const fee = place.entrance_fee || place.price_range;
  return {
    id: `item-${place.record_id}-${index}`,
    record_id: place.record_id,
    place_name: place.official_name,
    municipality_slug: placeSlug(place),
    activity: slot.activity,
    start_time: slot.start,
    end_time: slot.end,
    duration_minutes: 90,
    verification_status: place.verification_status,
    cost_confidence: fee && !fee.toLowerCase().includes('not publicly') ? 'medium' : 'low',
    latitude: parseCoordinate(place.latitude),
    longitude: parseCoordinate(place.longitude),
    address: placeAddress(place),
    notes:
      place.record_type === 'transportation_route'
        ? 'Confirm route, fare, and schedule with the local operator before traveling.'
        : place.record_type === 'restaurant'
          ? 'Meal costs vary by order; confirm menu prices on arrival.'
          : place.record_type === 'accommodation'
            ? 'Room rates vary by season; confirm availability before arrival.'
            : undefined,
  };
}

function buildDay(
  dayNumber: number,
  pool: Place[],
  used: Set<string>,
  interests: string[],
  query: string,
  includeStay: boolean,
): TripDay {
  const items: TripItem[] = [];
  let itemIndex = 0;

  for (const slot of DAY_SLOTS) {
    const types = slot.kinds.filter((k): k is Place['record_type'] => k !== 'meal');
    const [place] = pickPlaces(pool, types, 1, used, interests, query);
    if (!place) continue;
    items.push(toTripItem(place, slot, itemIndex++));
  }

  if (includeStay && dayNumber === 1) {
    const [stay] = pickPlaces(pool, ['accommodation'], 1, used, interests, query);
    if (stay) {
      items.push({
        ...toTripItem(stay, { start: '21:00', end: '07:00', kinds: ['accommodation'], activity: 'Overnight stay' }, itemIndex++),
        start_time: '21:00',
        end_time: '07:00',
      });
    }
  }

  return { day_number: dayNumber, items };
}

function municipalityNames(slugs: MunicipalitySlug[]): string {
  if (slugs.length === 0) return 'Partido';
  return slugs.map((slug) => MUNICIPALITY_BY_SLUG[slug].displayName).join(', ');
}

function buildNarrative(prefs: TripPlanPreferences, trip: Trip, budget: BudgetSummary): string {
  const scope = municipalityNames(prefs.municipalitySlugs);
  const interestText =
    prefs.interests.length > 0 ? prefs.interests.join(', ') : 'a mix of Partido highlights';
  const lines = [
    `Your ${prefs.days}-day Partido plan for ${prefs.travelers} traveler(s) in ${scope} focuses on ${interestText}.`,
    prefs.activityNotes ? `Activities you asked for: ${prefs.activityNotes}.` : null,
    prefs.foodNotes ? `Food preferences: ${prefs.foodNotes}.` : null,
    `The schedule below uses published MADIA records for attractions, dining, stays, and transport routes.`,
    `Estimated trip cost: ₱${budget.total_php.toLocaleString('en-PH')} (fees and rates from repository records where available).`,
    prefs.budgetPhp
      ? budget.total_php <= prefs.budgetPhp
        ? `This fits within your stated budget of ₱${prefs.budgetPhp.toLocaleString('en-PH')}.`
        : `This may exceed your stated budget of ₱${prefs.budgetPhp.toLocaleString('en-PH')}; adjust stays or activities as needed.`
      : null,
    'Open each stop in Waze for directions. Confirm fares, boat schedules, and room rates before you travel.',
  ].filter(Boolean);

  const daySummaries = trip.days.map((day) => {
    const stops = day.items.map((item) => `${item.start_time} ${item.place_name} (${item.activity})`).join('; ');
    return `Day ${day.day_number}: ${stops}`;
  });

  return [...lines, '', ...daySummaries].join('\n');
}

function enrichBudget(
  trip: Trip,
  base: BudgetSummary,
  placesById: Map<string, Place>,
  travelers: number,
  days: number,
): BudgetSummary {
  const lineItems = [...base.line_items];
  const assumptions = [...base.assumptions];
  const seenMeals = new Set<string>();
  const seenTransport = new Set<string>();
  const seenStay = new Set<string>();

  for (const day of trip.days) {
    for (const item of day.items) {
      const place = placesById.get(item.record_id);
      if (!place) continue;

      if (place.record_type === 'restaurant' && !seenMeals.has(item.id)) {
        seenMeals.add(item.id);
        const parsed = parseFeeText(place.price_range);
        if (parsed.amount !== null) {
          lineItems.push({
            label: `${item.place_name} (meal estimate)`,
            amount_php: parsed.amount,
            confidence: 'medium',
            verification_status: place.verification_status,
            source_note: parsed.note,
          });
        } else {
          assumptions.push(`${item.place_name}: meal cost estimated at ₱250 per person if menu prices are unavailable.`);
          lineItems.push({
            label: `${item.place_name} (meal estimate)`,
            amount_php: 250,
            confidence: 'low',
            verification_status: place.verification_status,
            source_note: 'Estimated meal allowance',
          });
        }
      }

      if (place.record_type === 'transportation_route' && !seenTransport.has(item.record_id)) {
        seenTransport.add(item.record_id);
        assumptions.push(`${item.place_name}: confirm fare with operator; transport estimate ₱150 per person if not published.`);
        lineItems.push({
          label: `${item.place_name} (transport estimate)`,
          amount_php: 150,
          confidence: 'low',
          verification_status: place.verification_status,
          source_note: 'Estimated local fare',
        });
      }

      if (place.record_type === 'accommodation' && !seenStay.has(item.record_id)) {
        seenStay.add(item.record_id);
        const parsed = parseFeeText(place.price_range);
        if (parsed.amount !== null) {
          lineItems.push({
            label: `${item.place_name} (nightly stay)`,
            amount_php: parsed.amount,
            confidence: 'medium',
            verification_status: place.verification_status,
            source_note: parsed.note,
          });
        } else {
          assumptions.push(`${item.place_name}: room rate not published; budget excludes lodging until confirmed.`);
        }
      }
    }
  }

  const subtotal = lineItems.reduce((sum, line) => sum + line.amount_php, 0);
  const perPersonExtras = lineItems
    .filter((line) => !line.label.includes('nightly stay'))
    .reduce((sum, line) => sum + line.amount_php, 0);
  const lodging = lineItems
    .filter((line) => line.label.includes('nightly stay'))
    .reduce((sum, line) => sum + line.amount_php, 0);

  return {
    traveler_count: travelers,
    line_items: lineItems,
    subtotal_per_person_php: perPersonExtras,
    total_php: perPersonExtras * travelers + lodging * Math.max(days - 1, 0),
    assumptions,
  };
}

export function planTripFromPreferences(places: Place[], prefs: TripPlanPreferences): PlannedTripResult {
  const days = Math.min(Math.max(prefs.days, 1), 7);
  const travelers = Math.min(Math.max(prefs.travelers, 1), 20);
  const query = [prefs.activityNotes, prefs.foodNotes].filter(Boolean).join(' ');

  let pool = places.filter(isBrowsable);
  if (prefs.municipalitySlugs.length > 0) {
    const ids = new Set<string>(prefs.municipalitySlugs.map((slug) => MUNICIPALITY_BY_SLUG[slug].id));
    const scoped = pool.filter((place) => ids.has(place.municipality_id));
    if (scoped.length > 0) pool = scoped;
  }

  const used = new Set<string>();
  const tripDays: TripDay[] = [];
  for (let day = 1; day <= days; day += 1) {
    tripDays.push(buildDay(day, pool, used, prefs.interests, query, days > 1));
  }

  const municipality_slugs =
    prefs.municipalitySlugs.length > 0
      ? prefs.municipalitySlugs
      : [...new Set(tripDays.flatMap((d) => d.items.map((i) => i.municipality_slug)))];

  const now = new Date().toISOString();
  const trip: Trip = {
    id: `trip-${Date.now()}`,
    title: `${municipalityNames(prefs.municipalitySlugs)} · ${days}-day trip`,
    municipality_slugs,
    days: tripDays,
    traveler_count: travelers,
    assumptions: ['Itinerary built from published MADIA records. Confirm live fares and schedules before travel.'],
    created_at: now,
    updated_at: now,
  };

  const placesById = new Map(places.map((place) => [place.record_id, place]));
  const fees: Record<string, string | undefined> = {};
  for (const day of trip.days) {
    for (const item of day.items) {
      const place = placesById.get(item.record_id);
      fees[item.record_id] = place?.entrance_fee || place?.price_range;
    }
  }

  const baseBudget = calculateTripBudget(trip, fees);
  const budget = enrichBudget(trip, baseBudget, placesById, travelers, days);
  trip.total_estimated_cost_php = budget.total_php;

  return {
    trip,
    budget,
    narrative: buildNarrative(prefs, trip, budget),
    fees,
  };
}

// Re-export for tests
export { parseFeeText } from './budget.js';
