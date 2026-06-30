import { NextResponse } from 'next/server';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { requireAdmin } from '@/lib/auth';
import { listAuditLogs, listBookings } from '@/lib/persistence';
import { buildCarouselSlides } from '@/lib/carousel';
import { loadRuntimeData } from '@/lib/data';

const ROOT = join(process.cwd(), '../..');

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const runtime = loadRuntimeData();
  const slides = buildCarouselSlides();
  return NextResponse.json({
    stats: {
      municipalities: runtime?.municipalities.length ?? 0,
      places: runtime?.places.length ?? 0,
      attractions: runtime?.places.filter((p) => p.record_type === 'attraction').length ?? 0,
      carousel_slides: slides.filter((s) => s.is_active).length,
      bookings: listBookings().length,
    },
    audit_logs: listAuditLogs(20),
    repository_version: runtime?.meta.repository_version,
  });
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  if (body.action === 'import') {
    const dryRun = Boolean(body.dry_run);
    const flag = dryRun ? '--dry-run' : '';
    try {
      const output = execSync(`node scripts/import-runtime.mjs ${flag}`.trim(), {
        cwd: ROOT,
        encoding: 'utf8',
      });
      const report = JSON.parse(output.trim().split('\n').pop() || '{}');
      return NextResponse.json({ report });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
