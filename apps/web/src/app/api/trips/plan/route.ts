import { NextResponse } from 'next/server';
import {
  isMunicipalitySlug,
  planTripFromPreferences,
  type MunicipalitySlug,
  type TripPlanPreferences,
} from '@madia/domain';
import { loadRuntimeData } from '@/lib/data';

const INTEREST_OPTIONS = ['beach', 'food', 'heritage', 'waterfall', 'nature', 'festival'] as const;

function parsePreferences(body: Record<string, unknown>): TripPlanPreferences | { error: string } {
  const municipalitySlugs = Array.isArray(body.municipalitySlugs)
    ? body.municipalitySlugs
        .map((value) => String(value))
        .filter((slug): slug is MunicipalitySlug => isMunicipalitySlug(slug))
    : [];

  const days = Math.min(Math.max(Number(body.days) || 1, 1), 7);
  const travelers = Math.min(Math.max(Number(body.travelers) || 1, 1), 20);
  const budgetPhp =
    body.budgetPhp !== undefined && body.budgetPhp !== null && body.budgetPhp !== ''
      ? Math.max(Number(body.budgetPhp) || 0, 0)
      : undefined;

  const interests = Array.isArray(body.interests)
    ? body.interests.map((value) => String(value).toLowerCase()).filter((value) => value.length > 0)
    : [];

  const foodNotes = body.foodNotes ? String(body.foodNotes).trim() : undefined;
  const activityNotes = body.activityNotes ? String(body.activityNotes).trim() : undefined;

  if (!activityNotes && !foodNotes && municipalitySlugs.length === 0 && interests.length === 0) {
    return {
      error: 'Tell us where to go or what you want to do and eat so we can build your itinerary.',
    };
  }

  return {
    municipalitySlugs,
    days,
    travelers,
    budgetPhp,
    interests: interests.length > 0 ? interests : [...INTEREST_OPTIONS],
    foodNotes,
    activityNotes,
  };
}

export async function POST(request: Request) {
  const runtime = loadRuntimeData();
  if (!runtime?.places?.length) {
    return NextResponse.json({ error: 'Tourism data is unavailable right now.' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const prefs = parsePreferences(body);
  if ('error' in prefs) {
    return NextResponse.json({ error: prefs.error }, { status: 400 });
  }

  const result = planTripFromPreferences(runtime.places, prefs);
  const stopCount = result.trip.days.reduce((sum, day) => sum + day.items.length, 0);

  if (stopCount === 0) {
    return NextResponse.json(
      {
        error:
          'No matching destinations found for your preferences. Try another municipality or broader interests.',
      },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
