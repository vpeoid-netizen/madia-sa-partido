'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface RoomOption {
  room_type_id: string;
  room_type_name: string;
  nightly_rate_php: number;
  nights: number;
  available_rooms: number;
  total_php: number;
}

export default function BookPageClient() {
  const params = useSearchParams();
  const accommodationId = params.get('accommodation') || 'MADIA-CAR-ACC-001';
  const [accommodationName, setAccommodationName] = useState(accommodationId);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/search?q=${encodeURIComponent(accommodationId)}`)
      .then((r) => r.json())
      .then((data) => {
        const match = (data.results || []).find(
          (p: { record_id: string; official_name: string }) => p.record_id === accommodationId,
        );
        if (match) setAccommodationName(match.official_name);
      })
      .catch(() => undefined);
  }, [accommodationId]);

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    setLoading(true);
    fetch(
      `/api/accommodations/availability?accommodation_id=${encodeURIComponent(accommodationId)}&check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`,
    )
      .then((r) => r.json())
      .then((data) => setRooms(data.rooms || []))
      .finally(() => setLoading(false));
  }, [accommodationId, checkIn, checkOut, guests]);

  async function createReservation() {
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accommodation_id: accommodationId,
          room_type_id: selectedRoom,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          guest_name: guestName,
          guest_email: guestEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reservation failed');
      setBookingId(data.booking.id);
      setStatus('Reservation created. Complete test payment to confirm.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Reservation failed');
    } finally {
      setLoading(false);
    }
  }

  async function pay() {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotency_key: `pay-${bookingId}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      setStatus('Payment confirmed. Your stay is booked.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '720px', margin: '0 auto' }}>
      <Link href="/" className="button button-secondary">Back home</Link>
      <h1 className="madia-brand">Reserve your stay</h1>
      <p>{accommodationName}</p>

      <form className="madia-glass book-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          Check-in
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        </label>
        <label>
          Check-out
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        </label>
        <label>
          Guests
          <input type="number" min={1} max={8} value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
        </label>

        {loading && <p aria-live="polite">Loading availability…</p>}

        {rooms.length > 0 && (
          <fieldset>
            <legend>Available rooms</legend>
            {rooms.map((room) => (
              <label key={room.room_type_id} className="room-option">
                <input
                  type="radio"
                  name="room"
                  value={room.room_type_id}
                  checked={selectedRoom === room.room_type_id}
                  onChange={() => setSelectedRoom(room.room_type_id)}
                />
                {room.room_type_name} — ₱{room.nightly_rate_php.toLocaleString('en-PH')}/night ·{' '}
                {room.available_rooms} available · total ₱{room.total_php.toLocaleString('en-PH')}
              </label>
            ))}
          </fieldset>
        )}

        {rooms.length === 0 && checkIn && checkOut && !loading && (
          <div className="empty-state">No rooms available for these dates. Try different dates.</div>
        )}

        <label>
          Full name
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
        </label>

        {!bookingId ? (
          <button
            type="button"
            className="button button-primary"
            disabled={!selectedRoom || !guestName || !guestEmail || loading}
            onClick={createReservation}
          >
            Create reservation
          </button>
        ) : (
          <>
            <button type="button" className="button button-primary" onClick={pay} disabled={loading}>
              Pay with test provider (₱)
            </button>
            <Link href={`/bookings/${bookingId}`} className="button button-secondary">
              View confirmation
            </Link>
          </>
        )}
      </form>

      {status && <p role="status" className="book-status">{status}</p>}
    </div>
  );
}
