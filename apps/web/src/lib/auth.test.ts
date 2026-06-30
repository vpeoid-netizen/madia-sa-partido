import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  canCancelBooking,
  canManageBookings,
  resolveDevRole,
  resolveOwnerAccommodationIds,
} from './auth';
import type { LocalSession } from './persistence';

describe('resolveDevRole', () => {
  const originalAdmin = process.env.MADIA_DEV_ADMIN_EMAILS;

  beforeEach(() => {
    process.env.MADIA_DEV_ADMIN_EMAILS = 'admin@madia.local';
  });

  afterEach(() => {
    process.env.MADIA_DEV_ADMIN_EMAILS = originalAdmin;
  });

  it('assigns admin role to configured email', () => {
    expect(resolveDevRole('admin@madia.local')).toBe('admin');
    expect(resolveDevRole('traveler@example.com')).toBe('traveler');
  });
});

describe('booking authorization', () => {
  const admin: LocalSession = {
    id: '1',
    email: 'admin@madia.local',
    name: 'Admin',
    role: 'admin',
    created_at: new Date().toISOString(),
  };

  const owner: LocalSession = {
    id: '2',
    email: 'owner@caramoan.gov',
    name: 'Owner',
    role: 'owner',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    process.env.MADIA_DEV_OWNER_MAP = 'owner@caramoan.gov:MADIA-CAR-ACC-001';
  });

  it('allows staff to manage bookings', () => {
    expect(canManageBookings(admin)).toBe(true);
    expect(canManageBookings(owner)).toBe(true);
  });

  it('scopes owner accommodations', () => {
    expect(resolveOwnerAccommodationIds('owner@caramoan.gov')).toContain('MADIA-CAR-ACC-001');
  });

  it('allows guest email match for cancellation', () => {
    const booking = {
      guest_email: 'guest@example.com',
      accommodation_id: 'MADIA-CAR-ACC-001',
    };
    expect(canCancelBooking(null, booking, 'guest@example.com')).toBe(true);
    expect(canCancelBooking(null, booking, 'other@example.com')).toBe(false);
    expect(canCancelBooking(owner, booking)).toBe(true);
  });
});
