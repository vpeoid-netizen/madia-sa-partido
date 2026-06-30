import { NextResponse } from 'next/server';
import type { Place } from '@madia/domain';
import { MUNICIPALITY_BY_SLUG } from '@madia/domain';
import { conciergeWithOptionalLlm } from '@madia/ai';
import { getMunicipalityBySlug, getPlacesForMunicipality, loadRuntimeData } from '@/lib/data';

function resolveMunicipalityScope(body: Record<string, unknown>) {
  let slug = body.municipalitySlug ? String(body.municipalitySlug) : '';
  let name = body.municipalityName ? String(body.municipalityName) : undefined;
  const question = String(body.question || '');

  if (!slug && name) {
    const municipalityName = name;
    slug =
      Object.entries(MUNICIPALITY_BY_SLUG).find(
        ([, meta]) => meta.displayName.toLowerCase() === municipalityName.toLowerCase(),
      )?.[0] || '';
  }

  if (!slug) {
    const normalized = question.toLowerCase();
    for (const [candidateSlug, meta] of Object.entries(MUNICIPALITY_BY_SLUG)) {
      const display = meta.displayName.toLowerCase();
      if (normalized.includes(display) || normalized.includes(candidateSlug.replace('-', ' '))) {
        slug = candidateSlug;
        name = meta.displayName;
        break;
      }
    }
  }

  if (slug && !name && slug in MUNICIPALITY_BY_SLUG) {
    name = MUNICIPALITY_BY_SLUG[slug as keyof typeof MUNICIPALITY_BY_SLUG].displayName;
  }

  return { slug, name };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const question = String(body.question || '').trim();
  if (!question) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 });
  }

  const placeId = body.placeId ? String(body.placeId) : undefined;
  const { slug, name: municipalityName } = resolveMunicipalityScope(body);

  let places: Place[] = [];
  if (slug) {
    const municipality = getMunicipalityBySlug(slug);
    if (municipality) places = getPlacesForMunicipality(municipality.meta.id);
  } else {
    const runtime = loadRuntimeData();
    places = runtime?.places ?? [];
  }

  const response = await conciergeWithOptionalLlm(
    question,
    { places, municipalityName },
    placeId,
  );

  return NextResponse.json(response);
}
