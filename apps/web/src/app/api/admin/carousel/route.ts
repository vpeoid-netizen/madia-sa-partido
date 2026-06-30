import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { buildCarouselSlides } from '@/lib/carousel';
import { getCarouselOverrides, setCarouselOverride } from '@/lib/persistence';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const slides = buildCarouselSlides();
  const overrides = getCarouselOverrides();
  return NextResponse.json({ slides, overrides });
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const recordId = String(body.record_id || '');
  const displayOrder = Number(body.display_order ?? 0);
  const isActive = body.is_active !== false;

  if (!recordId) {
    return NextResponse.json({ error: 'record_id required' }, { status: 400 });
  }

  const override = setCarouselOverride(recordId, displayOrder, isActive);
  return NextResponse.json({ override });
}
