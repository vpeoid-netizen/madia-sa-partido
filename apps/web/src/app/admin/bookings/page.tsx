'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  accommodation_name: string;
  room_type_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  total_php: number;
  status: string;
  created_at: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch('/api/bookings')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Unable to load reservations');
        setBookings(data.bookings || []);
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : 'Unable to load reservations'));
  }

  useEffect(() => {
    load();
  }, []);

  async function cancelBooking(id: string) {
    const res = await fetch(`/api/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Cancellation failed');
      return;
    }
    setMessage(`Booking ${id} updated.`);
    load();
  }

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
      <Link href="/admin" className="button button-secondary">Back to admin</Link>
      <h1 className="madia-brand">Reservations</h1>
      <p>Review accommodation bookings and process cancellations.</p>

      {message && <p role="status">{message}</p>}

      {bookings.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '1rem' }}>No reservations yet.</div>
      ) : (
        <ul className="audit-list" style={{ marginTop: '1rem' }}>
          {bookings.map((booking) => (
            <li key={booking.id} className="madia-glass">
              <strong>{booking.accommodation_name}</strong> — {booking.room_type_name}
              <p>
                {booking.guest_name} ({booking.guest_email}) · {booking.guests} guest(s)
              </p>
              <p className="home-card-meta">
                {booking.check_in} to {booking.check_out} · PHP {booking.total_php.toLocaleString()} ·{' '}
                {booking.status}
              </p>
              {booking.status !== 'cancelled' && booking.status !== 'refunded' && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => cancelBooking(booking.id)}
                >
                  Cancel booking
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
