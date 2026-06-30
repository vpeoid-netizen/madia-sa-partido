import { NextResponse } from 'next/server';
import { getLocalSession, type LocalSession } from './persistence';

export const SESSION_COOKIE = 'madia_session_id';

export type UserRole = LocalSession['role'];

function parseEmailList(value: string | undefined): string[] {
  return (value || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function parseOwnerMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const raw = process.env.MADIA_DEV_OWNER_MAP || '';
  for (const entry of raw.split(',').map((part) => part.trim()).filter(Boolean)) {
    const [email, accommodationId] = entry.split(':').map((part) => part.trim());
    if (!email || !accommodationId) continue;
    const key = email.toLowerCase();
    const list = map.get(key) || [];
    list.push(accommodationId);
    map.set(key, list);
  }
  return map;
}

function parseValidatorMap(): Map<string, string> {
  const map = new Map<string, string>();
  const raw = process.env.MADIA_DEV_VALIDATOR_MAP || '';
  for (const entry of raw.split(',').map((part) => part.trim()).filter(Boolean)) {
    const [email, municipalityId] = entry.split(':').map((part) => part.trim());
    if (!email || !municipalityId) continue;
    map.set(email.toLowerCase(), municipalityId);
  }
  return map;
}

export function resolveDevRole(email: string): UserRole {
  const normalized = email.toLowerCase().trim();
  const admins = parseEmailList(process.env.MADIA_DEV_ADMIN_EMAILS || 'admin@madia.local');
  const validators = parseEmailList(process.env.MADIA_DEV_VALIDATOR_EMAILS);
  const owners = parseOwnerMap();

  if (admins.includes(normalized)) return 'admin';
  if (validators.includes(normalized) || parseValidatorMap().has(normalized)) return 'validator';
  if (owners.has(normalized)) return 'owner';
  return 'traveler';
}

export function resolveDevMunicipalityId(email: string): string | undefined {
  return parseValidatorMap().get(email.toLowerCase().trim());
}

export function resolveOwnerAccommodationIds(email: string): string[] {
  return parseOwnerMap().get(email.toLowerCase().trim()) || [];
}

export function getSessionIdFromRequest(request: Request): string | null {
  const match = request.headers.get('cookie')?.match(/madia_session_id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getSessionFromRequest(request: Request): LocalSession | null {
  const sessionId = getSessionIdFromRequest(request);
  if (!sessionId) return null;
  return getLocalSession(sessionId);
}

type AuthResult =
  | { ok: true; session: LocalSession }
  | { ok: false; response: NextResponse };

export function requireSession(request: Request, roles?: UserRole[]): AuthResult {
  const session = getSessionFromRequest(request);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sign in required' }, { status: 401 }),
    };
  }
  if (roles && !roles.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 }),
    };
  }
  return { ok: true, session };
}

export function requireStaff(request: Request): AuthResult {
  return requireSession(request, ['admin', 'validator']);
}

export function requireAdmin(request: Request): AuthResult {
  return requireSession(request, ['admin']);
}

export function canManageBookings(session: LocalSession): boolean {
  return session.role === 'admin' || session.role === 'owner';
}

export function canReviewSubmissions(session: LocalSession): boolean {
  return session.role === 'admin' || session.role === 'validator';
}

export function canAccessSubmission(session: LocalSession, municipalityId: string): boolean {
  if (session.role === 'admin') return true;
  if (session.role === 'validator') {
    return !session.municipality_id || session.municipality_id === municipalityId;
  }
  return false;
}

export function canCancelBooking(
  session: LocalSession | null,
  booking: { guest_email: string; accommodation_id: string },
  guestEmail?: string | null,
): boolean {
  if (session?.role === 'admin') return true;
  if (session?.role === 'owner') {
    return resolveOwnerAccommodationIds(session.email).includes(booking.accommodation_id);
  }
  const email = (session?.email || guestEmail || '').toLowerCase();
  if (email && email === booking.guest_email.toLowerCase()) return true;
  return false;
}
