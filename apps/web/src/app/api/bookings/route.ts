import { NextResponse } from 'next/server';
import {
  canManageBookings,
  getSessionFromRequest,
  resolveOwnerAccommodationIds,
} from '@/lib/auth';
import { createBooking, getBooking, listBookings } from '@/lib/persistence';
import { loadRuntimeData } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const booking = getBooking(id);
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ booking });
  }

  const session = getSessionFromRequest(request);
  if (!session || !canManageBookings(session)) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  let bookings = listBookings();
  if (session.role === 'owner') {
    const accommodationIds = resolveOwnerAccommodationIds(session.email);
    bookings = bookings.filter((booking) => accommodationIds.includes(booking.accommodation_id));
  }

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const body = await request.json();
  const accommodationId = String(body.accommodation_id || '');
  const runtime = loadRuntimeData();
  const place = runtime?.places.find((p) => p.record_id === accommodationId);
  if (!place || place.record_type !== 'accommodation') {
    return NextResponse.json({ error: 'Accommodation not found' }, { status: 404 });
  }

  try {
    const booking = createBooking({
      accommodation_id: accommodationId,
      accommodation_name: place.official_name,
      room_type_id: String(body.room_type_id),
      check_in: String(body.check_in),
      check_out: String(body.check_out),
      guests: Number(body.guests) || 1,
      guest_name: String(body.guest_name),
      guest_email: String(body.guest_email),
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Booking failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
