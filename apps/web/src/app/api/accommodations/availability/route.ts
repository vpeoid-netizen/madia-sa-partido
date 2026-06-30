import { NextResponse } from 'next/server';
import { checkAvailability } from '@/lib/persistence';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accommodationId = searchParams.get('accommodation_id');
  const checkIn = searchParams.get('check_in');
  const checkOut = searchParams.get('check_out');
  const guests = Number(searchParams.get('guests') || '2');

  if (!accommodationId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: 'accommodation_id, check_in, and check_out are required' },
      { status: 400 },
    );
  }

  const rooms = checkAvailability({
    accommodation_id: accommodationId,
    check_in: checkIn,
    check_out: checkOut,
    guests,
  });

  return NextResponse.json({ rooms, currency: 'PHP' });
}
