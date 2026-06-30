import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clientKey, rateLimit } from '@/lib/rate-limit';

const LIMITED_PREFIXES = ['/api/ai/', '/api/bookings', '/api/submissions', '/api/auth/', '/api/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const shouldLimit = LIMITED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!shouldLimit) return NextResponse.next();

  const key = clientKey(request);
  if (!rateLimit(key, 40, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
