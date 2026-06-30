import { NextResponse } from 'next/server';
import { createSharedTrip, getSharedTrip } from '@/lib/persistence';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }
  const trip = getSharedTrip(token);
  if (!trip) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ trip });
}

export async function POST(request: Request) {
  const body = await request.json();
  const trip = createSharedTrip({
    title: String(body.title || 'Shared trip'),
    payload: body.payload,
    traveler_count: Number(body.traveler_count) || 1,
    total_estimated_cost_php: body.total_estimated_cost_php,
  });
  return NextResponse.json(
    { token: trip.token, share_url: `/trips/share/${trip.token}` },
    { status: 201 },
  );
}
