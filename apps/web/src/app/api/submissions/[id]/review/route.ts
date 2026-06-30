import { NextResponse } from 'next/server';
import {
  canAccessSubmission,
  canReviewSubmissions,
  getSessionFromRequest,
} from '@/lib/auth';
import { getSubmission, reviewSubmission } from '@/lib/persistence';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = getSessionFromRequest(request);
  if (!session || !canReviewSubmissions(session)) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const existing = getSubmission(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!canAccessSubmission(session, existing.municipality_id)) {
    return NextResponse.json({ error: 'Not authorized for this municipality' }, { status: 403 });
  }

  const body = await request.json();
  const decision = body.decision as 'approved' | 'rejected' | 'returned';
  const notes = body.notes ? String(body.notes) : undefined;

  if (!['approved', 'rejected', 'returned'].includes(decision)) {
    return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
  }

  try {
    const submission = reviewSubmission(id, decision, session.email, notes);
    return NextResponse.json({ submission });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Review failed';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
