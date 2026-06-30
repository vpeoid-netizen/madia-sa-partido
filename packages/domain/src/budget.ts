import type { Trip } from './schemas.js';

export interface BudgetLineItem {
  label: string;
  amount_php: number;
  confidence: 'high' | 'medium' | 'low';
  verification_status: string;
  source_note?: string;
}

export interface BudgetSummary {
  traveler_count: number;
  line_items: BudgetLineItem[];
  subtotal_per_person_php: number;
  total_php: number;
  assumptions: string[];
}

export function parseFeeText(value: string | undefined): { amount: number | null; note: string } {
  if (!value || !value.trim()) {
    return { amount: null, note: 'Information not yet available' };
  }
  const lower = value.toLowerCase();
  if (lower.includes('free') || lower.includes('no fee')) {
    return { amount: 0, note: value };
  }
  if (
    lower.includes('not publicly') ||
    lower.includes('requires confirmation') ||
    lower.includes('unknown')
  ) {
    return { amount: null, note: value };
  }
  const match = value.replace(/,/g, '').match(/(?:php|₱)?\s*(\d+(?:\.\d+)?)/i);
  if (match) return { amount: Number(match[1]), note: value };
  return { amount: null, note: value };
}

export function calculateTripBudget(
  trip: Trip,
  entranceFees: Record<string, string | undefined>,
): BudgetSummary {
  const assumptions = [
    'Meals, lodging, and transport fares are excluded unless explicitly attached to a stop.',
    'Unverified or unavailable fees are not counted in the total.',
  ];
  const lineItems: BudgetLineItem[] = [];

  for (const day of trip.days) {
    for (const item of day.items) {
      const feeText = entranceFees[item.record_id];
      const parsed = parseFeeText(feeText);
      if (parsed.amount === null) {
        assumptions.push(`${item.place_name}: ${parsed.note}`);
        continue;
      }
      lineItems.push({
        label: `${item.place_name} entrance/fee`,
        amount_php: parsed.amount,
        confidence: item.cost_confidence || 'medium',
        verification_status: item.verification_status || 'partially_verified',
        source_note: parsed.note,
      });
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount_php, 0);

  return {
    traveler_count: trip.traveler_count,
    line_items: lineItems,
    subtotal_per_person_php: subtotal,
    total_php: subtotal * trip.traveler_count,
    assumptions,
  };
}

export function createSampleItinerary(input: {
  title: string;
  municipalitySlug: string;
  places: Array<{
    record_id: string;
    official_name: string;
    verification_status: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
  }>;
  travelerCount?: number;
}): Trip {
  const now = new Date().toISOString();
  const items = input.places.slice(0, 4).map((place, index) => ({
    id: `item-${index + 1}`,
    record_id: place.record_id,
    place_name: place.official_name,
    municipality_slug: input.municipalitySlug,
    activity: 'Visit and explore',
    start_time: `${9 + index * 2}:00`,
    end_time: `${10 + index * 2}:00`,
    duration_minutes: 90,
    verification_status: place.verification_status,
    cost_confidence: 'medium' as const,
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
    address: place.address,
  }));

  const day = {
    day_number: 1,
    items,
    subtotal_php: undefined,
  };

  return {
    id: `trip-${Date.now()}`,
    title: input.title,
    municipality_slugs: [input.municipalitySlug],
    days: [day],
    traveler_count: input.travelerCount ?? 1,
    assumptions: ['Sample itinerary based on verified MADIA records only.'],
    created_at: now,
    updated_at: now,
  };
}
