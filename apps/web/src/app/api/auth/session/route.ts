import { NextResponse } from 'next/server';
import {
  resolveDevMunicipalityId,
  resolveDevRole,
  SESSION_COOKIE,
} from '@/lib/auth';
import { createLocalSession, getLocalSession } from '@/lib/persistence';

export async function GET(request: Request) {
  const sessionId = request.headers.get('cookie')?.match(/madia_session_id=([^;]+)/)?.[1];
  if (!sessionId) {
    return NextResponse.json({ user: null });
  }
  const session = getLocalSession(decodeURIComponent(sessionId));
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
      municipality_id: session.municipality_id,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();

  if (!email || !name) {
    return NextResponse.json({ error: 'email and name required' }, { status: 400 });
  }

  const role = resolveDevRole(email);
  const municipality_id = role === 'validator' ? resolveDevMunicipalityId(email) : undefined;
  const session = createLocalSession({ email, name, role, municipality_id });
  const response = NextResponse.json({
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
      municipality_id: session.municipality_id,
    },
  });
  response.cookies.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
