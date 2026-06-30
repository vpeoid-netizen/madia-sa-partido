import { NextResponse } from 'next/server';
import { canCancelBooking, getSessionFromRequest } from '@/lib/auth';
import { cancelBooking, getBooking } from '@/lib/persistence';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = getSessionFromRequest(request);

  const booking = getBooking(id);
  if (!booking) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const guestEmail = body.guest_email ? String(body.guest_email) : null;

  if (!canCancelBooking(session, booking, guestEmail)) {
    return NextResponse.json({ error: 'Not authorized to cancel this booking' }, { status: 403 });
  }

  const actor = session?.email || 'traveler';

  try {
    const updated = cancelBooking(id, actor);
    return NextResponse.json({ booking: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cancellation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
