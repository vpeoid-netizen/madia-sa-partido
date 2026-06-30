'use client';

import { useState } from 'react';
import Link from 'next/link';

export function BookingActions({
  bookingId,
  status,
  guestEmail,
}: {
  bookingId: string;
  status: string;
  guestEmail?: string;
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [message, setMessage] = useState<string | null>(null);

  async function cancel() {
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_email: guestEmail }),
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentStatus(data.booking.status);
      setMessage('Booking cancelled.' + (data.booking.status === 'refunded' ? ' Refund recorded.' : ''));
    } else {
      setMessage(data.error || 'Cancellation failed');
    }
  }

  if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
    return <p>Status: {currentStatus}</p>;
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <button type="button" className="button button-secondary" onClick={cancel}>
        Cancel booking
      </button>
      {message && <p role="status">{message}</p>}
      <Link href="/book" className="button button-primary" style={{ marginLeft: '0.5rem' }}>
        Book another stay
      </Link>
    </div>
  );
}
