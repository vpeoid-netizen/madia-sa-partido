import { describe, expect, it } from 'vitest';
import {
  checkAvailability,
  createBooking,
  processTestPayment,
  addFavorite,
  listFavorites,
} from './persistence';

describe('persistence booking flow', () => {
  it('creates booking and idempotent test payment', () => {
    const rooms = checkAvailability({
      accommodation_id: 'MADIA-CAR-ACC-001',
      check_in: '2026-08-01',
      check_out: '2026-08-03',
      guests: 2,
    });
    expect(rooms.length).toBeGreaterThan(0);

    const booking = createBooking({
      accommodation_id: 'MADIA-CAR-ACC-001',
      accommodation_name: 'Test Resort',
      room_type_id: rooms[0].room_type_id,
      check_in: '2026-08-01',
      check_out: '2026-08-03',
      guests: 2,
      guest_name: 'Test Guest',
      guest_email: 'guest@example.com',
    });
    expect(booking.status).toBe('pending');

    const pay1 = processTestPayment(booking.id, 'idem-1');
    const pay2 = processTestPayment(booking.id, 'idem-1');
    expect(pay2.id).toBe(pay1.id);
  });

  it('stores favorites per client', () => {
    const fav = addFavorite('client-a', {
      record_id: 'MADIA-CAR-ATT-005',
      place_name: 'Gota Beach',
      route: '/municipalities/caramoan/gota-beach',
    });
    expect(fav.record_id).toBe('MADIA-CAR-ATT-005');
    expect(listFavorites('client-a').length).toBeGreaterThan(0);
  });
});
