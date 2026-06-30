import { NextResponse } from 'next/server';
import type { Place } from '@madia/domain';
import { groundedConciergeReply } from '@madia/ai';
import { getMunicipalityBySlug, getPlacesForMunicipality, loadRuntimeData, publicText } from '@/lib/data';

function cleanAnswer(value: unknown): string {
  const text = publicText(String(value || ''));
  return text || 'MADIA can help you discover destinations and shape an itinerary across Partido.';
}

export async function POST(request: Request) {
  const body = await request.json();
  const question = String(body.question || '');
  const placeId = body.placeId ? String(body.placeId) : undefined;
  const municipalityName = body.municipalityName ? String(body.municipalityName) : undefined;
  const slug = body.municipalitySlug ? String(body.municipalitySlug) : undefined;

  let places: Place[] = [];
  if (slug) {
    const municipality = getMunicipalityBySlug(slug);
    if (municipality) places = getPlacesForMunicipality(municipality.meta.id);
  } else {
    places = loadRuntimeData()?.places ?? [];
  }

  const response = groundedConciergeReply(question, { places, municipalityName }, placeId) as {
    answer?: string;
    grounded_records?: Array<{ record_id?: string; official_name?: string }>;
  };

  return NextResponse.json({
    answer: cleanAnswer(response.answer),
    grounded_records: (response.grounded_records || [])
      .filter((record) => record.record_id && record.official_name)
      .map((record) => ({
        record_id: record.record_id,
        official_name: record.official_name,
      })),
  });
}
