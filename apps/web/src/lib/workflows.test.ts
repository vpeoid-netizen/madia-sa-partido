import { describe, expect, it } from 'vitest';
import {
  createSubmission,
  reviewSubmission,
  trackAnalytics,
  cancelBooking,
  createBooking,
  processTestPayment,
  createSharedTrip,
  getSharedTrip,
} from './persistence';

describe('submissions workflow', () => {
  it('creates and reviews a submission', () => {
    const sub = createSubmission({
      type: 'new_place',
      municipality_id: 'MADIA-MUN-GOA',
      submitter_email: 'test@example.com',
      submitter_name: 'Tester',
      payload: { official_name: 'Test Beach', description: 'A quiet cove' },
    });
    expect(sub.status).toBe('submitted');

    const reviewed = reviewSubmission(sub.id, 'approved', 'validator-goa', 'Looks good');
    expect(reviewed.status).toBe('approved');
  });
});

describe('analytics', () => {
  it('tracks carousel events', () => {
    const event = trackAnalytics('carousel.view', { record_id: 'MADIA-CAR-ATT-005' });
    expect(event.event_name).toBe('carousel.view');
  });
});

describe('booking cancellation', () => {
  it('cancels and refunds a paid booking', () => {
    const rooms = createBooking({
      accommodation_id: 'MADIA-GOA-ACC-001',
      accommodation_name: 'Test Inn',
      room_type_id: 'room-standard',
      check_in: '2026-09-01',
      check_out: '2026-09-02',
      guests: 2,
      guest_name: 'Guest',
      guest_email: 'guest2@example.com',
    });
    processTestPayment(rooms.id, `idem-cancel-${rooms.id}`);
    const cancelled = cancelBooking(rooms.id, 'guest2@example.com');
    expect(cancelled.status).toBe('refunded');
  });
});

describe('trip sharing', () => {
  it('creates shareable trip token', () => {
    const shared = createSharedTrip({
      title: 'Goa weekend',
      payload: { days: [] },
      traveler_count: 2,
      total_estimated_cost_php: 1500,
    });
    const loaded = getSharedTrip(shared.token);
    expect(loaded?.title).toBe('Goa weekend');
  });
});
