import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PARTIDO_MUNICIPALITY_IDS } from '@madia/domain';
import { requireStaff } from '@/lib/auth';
import { createSubmission, listSubmissions } from '@/lib/persistence';

const SubmissionSchema = z.object({
  type: z.enum(['new_place', 'correction', 'photo', 'price', 'route', 'report', 'event', 'review', 'claim']),
  municipality_id: z.string(),
  submitter_email: z.string().email(),
  submitter_name: z.string().min(1),
  payload: z.record(z.unknown()),
});

export async function GET(request: Request) {
  const auth = requireStaff(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const municipalityId = searchParams.get('municipality_id') || undefined;
  const status = searchParams.get('status') as
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'returned'
    | undefined;

  let submissions = listSubmissions({ municipality_id: municipalityId, status });
  if (auth.session.role === 'validator' && auth.session.municipality_id) {
    submissions = submissions.filter((s) => s.municipality_id === auth.session.municipality_id);
  }

  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!PARTIDO_MUNICIPALITY_IDS.includes(parsed.data.municipality_id as never)) {
    return NextResponse.json({ error: 'Invalid municipality' }, { status: 400 });
  }

  const name = String(parsed.data.payload.official_name || parsed.data.payload.place_name || '');
  if ((parsed.data.type === 'new_place' || parsed.data.type === 'claim') && name.length < 2) {
    return NextResponse.json({ error: 'Place or business name is required' }, { status: 400 });
  }

  const submission = createSubmission(parsed.data);
  return NextResponse.json({ submission }, { status: 201 });
}
