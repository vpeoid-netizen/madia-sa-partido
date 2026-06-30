import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBooking } from '@/lib/persistence';
import { BookingActions } from '@/components/BookingActions';

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = getBooking(id);
  if (!booking) notFound();

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h1 className="madia-brand">Booking confirmation</h1>
      <article className="madia-glass" style={{ padding: '1rem' }}>
        <p><strong>Reference:</strong> {booking.id}</p>
        <p><strong>Property:</strong> {booking.accommodation_name}</p>
        <p><strong>Room:</strong> {booking.room_type_name}</p>
        <p><strong>Check-in:</strong> {booking.check_in}</p>
        <p><strong>Check-out:</strong> {booking.check_out}</p>
        <p><strong>Guests:</strong> {booking.guests}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Total:</strong> ₱{booking.total_php.toLocaleString('en-PH')} (incl. taxes)</p>
        {booking.payment_intent_id && (
          <p><strong>Payment reference:</strong> {booking.payment_intent_id}</p>
        )}
        <BookingActions bookingId={booking.id} status={booking.status} guestEmail={booking.guest_email} />
      </article>
      <Link href="/" className="button button-primary" style={{ marginTop: '1rem' }}>
        Return home
      </Link>
    </div>
  );
}
