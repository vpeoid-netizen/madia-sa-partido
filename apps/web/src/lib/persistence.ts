import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const ROOT = join(process.cwd(), '../..');
const LOCAL_DIR = join(ROOT, 'data/local');

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'refunded';

export interface RoomInventory {
  accommodation_id: string;
  room_type_id: string;
  room_type_name: string;
  total_rooms: number;
  nightly_rate_php: number;
  max_occupancy: number;
}

export interface FavoriteRecord {
  id: string;
  record_id: string;
  place_name: string;
  route: string;
  saved_at: string;
  client_id: string;
}

export interface BookingRecord {
  id: string;
  accommodation_id: string;
  accommodation_name: string;
  room_type_id: string;
  room_type_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_rate_php: number;
  nights: number;
  subtotal_php: number;
  taxes_php: number;
  total_php: number;
  status: BookingStatus;
  guest_name: string;
  guest_email: string;
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  booking_id: string;
  amount_php: number;
  provider: 'madia_test' | 'stripe';
  provider_ref: string;
  status: 'succeeded' | 'failed' | 'refunded';
  idempotency_key: string;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  details: Record<string, unknown>;
  created_at: string;
}

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'returned';

export interface Submission {
  id: string;
  type: 'new_place' | 'correction' | 'photo' | 'price' | 'route' | 'report' | 'event' | 'review' | 'claim';
  municipality_id: string;
  submitter_email: string;
  submitter_name: string;
  payload: Record<string, unknown>;
  status: SubmissionStatus;
  reviewer_notes?: string;
  reviewer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  properties: Record<string, unknown>;
  created_at: string;
}

export interface SharedTrip {
  id: string;
  token: string;
  title: string;
  payload: unknown;
  traveler_count: number;
  total_estimated_cost_php?: number;
  created_at: string;
}

export interface LocalSession {
  id: string;
  email: string;
  name: string;
  role: 'traveler' | 'contributor' | 'validator' | 'admin' | 'owner';
  municipality_id?: string;
  created_at: string;
}

interface LocalStore {
  favorites: FavoriteRecord[];
  bookings: BookingRecord[];
  payments: PaymentTransaction[];
  inventory: RoomInventory[];
  webhook_events: string[];
  audit_logs: AuditEvent[];
  carousel_overrides: Array<{ record_id: string; display_order: number; is_active: boolean }>;
  submissions: Submission[];
  analytics_events: AnalyticsEvent[];
  shared_trips: SharedTrip[];
  sessions: LocalSession[];
}

function storePath(): string {
  return join(LOCAL_DIR, 'store.json');
}

function defaultInventory(): RoomInventory[] {
  return [
    {
      accommodation_id: 'MADIA-CAR-ACC-001',
      room_type_id: 'room-lakeside',
      room_type_name: 'Lakeside Room',
      total_rooms: 4,
      nightly_rate_php: 4500,
      max_occupancy: 2,
    },
    {
      accommodation_id: 'MADIA-CAR-ACC-001',
      room_type_id: 'room-hillside',
      room_type_name: 'Hillside Room',
      total_rooms: 3,
      nightly_rate_php: 5200,
      max_occupancy: 3,
    },
    {
      accommodation_id: 'MADIA-GOA-ACC-001',
      room_type_id: 'room-standard',
      room_type_name: 'Standard Room',
      total_rooms: 6,
      nightly_rate_php: 1800,
      max_occupancy: 2,
    },
  ];
}

function readStore(): LocalStore {
  mkdirSync(LOCAL_DIR, { recursive: true });
  const path = storePath();
  if (!existsSync(path)) {
    const initial: LocalStore = {
      favorites: [],
      bookings: [],
      payments: [],
      inventory: defaultInventory(),
      webhook_events: [],
      audit_logs: [],
      carousel_overrides: [],
      submissions: [],
      analytics_events: [],
      shared_trips: [],
      sessions: [],
    };
    writeFileSync(path, JSON.stringify(initial, null, 2));
    return initial;
  }
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as LocalStore;
  if (!parsed.inventory?.length) parsed.inventory = defaultInventory();
  if (!parsed.audit_logs) parsed.audit_logs = [];
  if (!parsed.carousel_overrides) parsed.carousel_overrides = [];
  if (!parsed.submissions) parsed.submissions = [];
  if (!parsed.analytics_events) parsed.analytics_events = [];
  if (!parsed.shared_trips) parsed.shared_trips = [];
  if (!parsed.sessions) parsed.sessions = [];
  return parsed;
}

function writeStore(store: LocalStore): void {
  mkdirSync(LOCAL_DIR, { recursive: true });
  writeFileSync(storePath(), JSON.stringify(store, null, 2));
}

export function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  actor: string,
  details: Record<string, unknown> = {},
): AuditEvent {
  const store = readStore();
  const event: AuditEvent = {
    id: randomUUID(),
    action,
    entity_type: entityType,
    entity_id: entityId,
    actor,
    details,
    created_at: new Date().toISOString(),
  };
  store.audit_logs.unshift(event);
  writeStore(store);
  return event;
}

export function listAuditLogs(limit = 50): AuditEvent[] {
  return readStore().audit_logs.slice(0, limit);
}

export function listFavorites(clientId: string): FavoriteRecord[] {
  return readStore().favorites.filter((f) => f.client_id === clientId);
}

export function addFavorite(
  clientId: string,
  input: { record_id: string; place_name: string; route: string },
): FavoriteRecord {
  const store = readStore();
  const existing = store.favorites.find(
    (f) => f.client_id === clientId && f.record_id === input.record_id,
  );
  if (existing) return existing;

  const record: FavoriteRecord = {
    id: randomUUID(),
    ...input,
    client_id: clientId,
    saved_at: new Date().toISOString(),
  };
  store.favorites.unshift(record);
  writeStore(store);
  logAudit('favorite.added', 'place', input.record_id, clientId);
  return record;
}

export function removeFavorite(clientId: string, recordId: string): boolean {
  const store = readStore();
  const before = store.favorites.length;
  store.favorites = store.favorites.filter(
    (f) => !(f.client_id === clientId && f.record_id === recordId),
  );
  writeStore(store);
  if (store.favorites.length < before) {
    logAudit('favorite.removed', 'place', recordId, clientId);
    return true;
  }
  return false;
}

export function getInventory(accommodationId: string): RoomInventory[] {
  return readStore().inventory.filter((r) => r.accommodation_id === accommodationId);
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function bookedRoomsForRange(
  store: LocalStore,
  accommodationId: string,
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
): number {
  return store.bookings.filter(
    (b) =>
      b.accommodation_id === accommodationId &&
      b.room_type_id === roomTypeId &&
      (b.status === 'confirmed' || b.status === 'pending') &&
      b.check_in < checkOut &&
      b.check_out > checkIn,
  ).length;
}

export function checkAvailability(input: {
  accommodation_id: string;
  check_in: string;
  check_out: string;
  guests: number;
}) {
  const store = readStore();
  const rooms = getInventory(input.accommodation_id);
  const nights = nightsBetween(input.check_in, input.check_out);

  return rooms
    .map((room) => {
      const booked = bookedRoomsForRange(
        store,
        input.accommodation_id,
        room.room_type_id,
        input.check_in,
        input.check_out,
      );
      const available = Math.max(0, room.total_rooms - booked);
      return {
        ...room,
        nights,
        available_rooms: available,
        total_php: room.nightly_rate_php * nights,
        fits_guests: input.guests <= room.max_occupancy,
      };
    })
    .filter((r) => r.available_rooms > 0 && r.fits_guests);
}

export function createBooking(input: {
  accommodation_id: string;
  accommodation_name: string;
  room_type_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  guest_email: string;
}): BookingRecord {
  const store = readStore();
  const room = store.inventory.find(
    (r) =>
      r.accommodation_id === input.accommodation_id && r.room_type_id === input.room_type_id,
  );
  if (!room) throw new Error('Room type not found');

  const available = checkAvailability({
    accommodation_id: input.accommodation_id,
    check_in: input.check_in,
    check_out: input.check_out,
    guests: input.guests,
  }).find((r) => r.room_type_id === input.room_type_id);

  if (!available) throw new Error('No availability for selected dates');

  const nights = nightsBetween(input.check_in, input.check_out);
  const subtotal = room.nightly_rate_php * nights;
  const taxes = Math.round(subtotal * 0.12);

  const booking: BookingRecord = {
    id: randomUUID(),
    accommodation_id: input.accommodation_id,
    accommodation_name: input.accommodation_name,
    room_type_id: room.room_type_id,
    room_type_name: room.room_type_name,
    check_in: input.check_in,
    check_out: input.check_out,
    guests: input.guests,
    nightly_rate_php: room.nightly_rate_php,
    nights,
    subtotal_php: subtotal,
    taxes_php: taxes,
    total_php: subtotal + taxes,
    status: 'pending',
    guest_name: input.guest_name,
    guest_email: input.guest_email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.bookings.unshift(booking);
  writeStore(store);
  logAudit('booking.created', 'booking', booking.id, input.guest_email, {
    accommodation_id: input.accommodation_id,
    total_php: booking.total_php,
  });
  return booking;
}

export function getBooking(id: string): BookingRecord | null {
  return readStore().bookings.find((b) => b.id === id) ?? null;
}

export function listBookings(): BookingRecord[] {
  return readStore().bookings;
}

export function processTestPayment(bookingId: string, idempotencyKey: string): PaymentTransaction {
  const store = readStore();

  const existing = store.payments.find((p) => p.idempotency_key === idempotencyKey);
  if (existing) return existing;

  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');

  const tx: PaymentTransaction = {
    id: randomUUID(),
    booking_id: bookingId,
    amount_php: booking.total_php,
    provider: 'madia_test',
    provider_ref: `test_pi_${randomUUID().slice(0, 8)}`,
    status: 'succeeded',
    idempotency_key: idempotencyKey,
    created_at: new Date().toISOString(),
  };

  booking.status = 'confirmed';
  booking.payment_intent_id = tx.provider_ref;
  booking.updated_at = new Date().toISOString();

  store.payments.unshift(tx);
  store.webhook_events.push(`payment.succeeded:${tx.id}`);
  writeStore(store);
  logAudit('payment.succeeded', 'booking', bookingId, 'madia_test', {
    payment_id: tx.id,
    amount_php: tx.amount_php,
  });
  return tx;
}

export function getCarouselOverrides() {
  return readStore().carousel_overrides;
}

export function setCarouselOverride(recordId: string, displayOrder: number, isActive: boolean) {
  const store = readStore();
  const idx = store.carousel_overrides.findIndex((o) => o.record_id === recordId);
  const entry = { record_id: recordId, display_order: displayOrder, is_active: isActive };
  if (idx >= 0) store.carousel_overrides[idx] = entry;
  else store.carousel_overrides.push(entry);
  writeStore(store);
  logAudit('carousel.updated', 'featured_slide', recordId, 'admin');
  return entry;
}

export function createSubmission(input: Omit<Submission, 'id' | 'status' | 'created_at' | 'updated_at'>): Submission {
  const store = readStore();
  const submission: Submission = {
    id: randomUUID(),
    ...input,
    status: 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.submissions.unshift(submission);
  writeStore(store);
  logAudit('submission.created', 'submission', submission.id, input.submitter_email, {
    type: input.type,
    municipality_id: input.municipality_id,
  });
  return submission;
}

export function listSubmissions(filters?: {
  municipality_id?: string;
  status?: SubmissionStatus;
}): Submission[] {
  let list = readStore().submissions;
  if (filters?.municipality_id) {
    list = list.filter((s) => s.municipality_id === filters.municipality_id);
  }
  if (filters?.status) {
    list = list.filter((s) => s.status === filters.status);
  }
  return list;
}

export function getSubmission(id: string): Submission | null {
  return readStore().submissions.find((s) => s.id === id) ?? null;
}

export function reviewSubmission(
  id: string,
  decision: 'approved' | 'rejected' | 'returned',
  reviewerId: string,
  notes?: string,
): Submission {
  const store = readStore();
  const submission = store.submissions.find((s) => s.id === id);
  if (!submission) throw new Error('Submission not found');
  submission.status = decision === 'approved' ? 'approved' : decision;
  submission.reviewer_id = reviewerId;
  submission.reviewer_notes = notes;
  submission.updated_at = new Date().toISOString();
  if (decision === 'approved') {
    appendSubmissionPatch(submission);
  }
  writeStore(store);
  logAudit(`submission.${decision}`, 'submission', id, reviewerId, { notes });
  return submission;
}

function appendSubmissionPatch(submission: Submission): void {
  const patchPath = join(LOCAL_DIR, 'submission-patches.json');
  mkdirSync(LOCAL_DIR, { recursive: true });
  let patches: Submission[] = [];
  if (existsSync(patchPath)) {
    patches = JSON.parse(readFileSync(patchPath, 'utf8')) as Submission[];
  }
  patches.unshift(submission);
  writeFileSync(patchPath, JSON.stringify(patches, null, 2));
  logAudit('submission.patch_queued', 'submission', submission.id, submission.reviewer_id || 'system');
}

export function trackAnalytics(eventName: string, properties: Record<string, unknown> = {}): AnalyticsEvent {
  const store = readStore();
  const event: AnalyticsEvent = {
    id: randomUUID(),
    event_name: eventName,
    properties,
    created_at: new Date().toISOString(),
  };
  store.analytics_events.unshift(event);
  if (store.analytics_events.length > 5000) {
    store.analytics_events = store.analytics_events.slice(0, 5000);
  }
  writeStore(store);
  return event;
}

export function getAnalyticsSummary() {
  const events = readStore().analytics_events;
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    counts[e.event_name] = (counts[e.event_name] || 0) + 1;
  });
  return { total: events.length, by_event: counts, recent: events.slice(0, 20) };
}

export function cancelBooking(bookingId: string, actor: string): BookingRecord {
  const store = readStore();
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');
  if (booking.status === 'cancelled' || booking.status === 'refunded') return booking;

  booking.status = 'cancelled';
  booking.updated_at = new Date().toISOString();

  const payment = store.payments.find(
    (p) => p.booking_id === bookingId && p.status === 'succeeded',
  );
  if (payment) {
    payment.status = 'refunded';
    booking.status = 'refunded';
    store.webhook_events.push(`payment.refunded:${payment.id}`);
  }

  writeStore(store);
  logAudit('booking.cancelled', 'booking', bookingId, actor, {
    refunded: Boolean(payment),
  });
  return booking;
}

export function createSharedTrip(input: {
  title: string;
  payload: unknown;
  traveler_count: number;
  total_estimated_cost_php?: number;
}): SharedTrip {
  const store = readStore();
  const trip: SharedTrip = {
    id: randomUUID(),
    token: randomUUID().replace(/-/g, '').slice(0, 12),
    ...input,
    created_at: new Date().toISOString(),
  };
  store.shared_trips.unshift(trip);
  writeStore(store);
  logAudit('trip.shared', 'trip', trip.id, 'traveler');
  return trip;
}

export function getSharedTrip(token: string): SharedTrip | null {
  return readStore().shared_trips.find((t) => t.token === token) ?? null;
}

export function createLocalSession(input: {
  email: string;
  name: string;
  role?: LocalSession['role'];
  municipality_id?: string;
}): LocalSession {
  const store = readStore();
  const existing = store.sessions.find((s) => s.email === input.email);
  if (existing) return existing;

  const session: LocalSession = {
    id: randomUUID(),
    email: input.email,
    name: input.name,
    role: input.role || 'traveler',
    municipality_id: input.municipality_id,
    created_at: new Date().toISOString(),
  };
  store.sessions.push(session);
  writeStore(store);
  logAudit('session.created', 'user', session.id, input.email);
  return session;
}

export function getLocalSession(sessionId: string): LocalSession | null {
  return readStore().sessions.find((s) => s.id === sessionId) ?? null;
}
