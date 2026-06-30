import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { trackAnalytics, getAnalyticsSummary } from '@/lib/persistence';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json(getAnalyticsSummary());
}

export async function POST(request: Request) {
  const body = await request.json();
  const eventName = String(body.event_name || '');
  if (!eventName) {
    return NextResponse.json({ error: 'event_name required' }, { status: 400 });
  }
  const event = trackAnalytics(eventName, body.properties || {});
  return NextResponse.json({ ok: true, id: event.id }, { status: 201 });
}
