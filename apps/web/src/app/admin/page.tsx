'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminStats {
  municipalities: number;
  places: number;
  attractions: number;
  carousel_slides: number;
  bookings: number;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  created_at: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function refresh() {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setAudit(data.audit_logs || []);
      });
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((data) => setAnalytics(data.by_event || {}));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function runImport(dryRun: boolean) {
    setImporting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', dry_run: dryRun }),
      });
      const data = await res.json();
      setMessage(dryRun ? `Dry run complete: ${JSON.stringify(data.report?.counts)}` : 'Import complete.');
      refresh();
    } finally {
      setImporting(false);
    }
  }

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
      <h1 className="madia-brand">Administrator</h1>
      <p>Platform overview and data operations. Administrator sign-in required.</p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <Link href="/admin/carousel" className="button button-secondary">Carousel</Link>
        <Link href="/admin/review" className="button button-secondary">Submissions</Link>
        <Link href="/admin/bookings" className="button button-secondary">Reservations</Link>
        <Link href="/" className="button button-secondary">Preview site</Link>
      </div>

      {stats && (
        <div className="admin-stats madia-glass">
          <p><strong>Municipalities:</strong> {stats.municipalities}</p>
          <p><strong>Places:</strong> {stats.places}</p>
          <p><strong>Attractions:</strong> {stats.attractions}</p>
          <p><strong>Carousel slides:</strong> {stats.carousel_slides}</p>
          <p><strong>Bookings:</strong> {stats.bookings}</p>
        </div>
      )}

      <section className="madia-glass" style={{ padding: '1rem', marginTop: '1rem' }}>
        <h2>Analytics</h2>
        {Object.keys(analytics).length === 0 ? (
          <p className="empty-state">No events recorded yet.</p>
        ) : (
          <ul>
            {Object.entries(analytics).map(([name, count]) => (
              <li key={name}>{name}: {count}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="madia-glass" style={{ padding: '1rem', marginTop: '1rem' }}>
        <h2>Data import</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="button button-secondary" disabled={importing} onClick={() => runImport(true)}>
            Dry-run import
          </button>
          <button type="button" className="button button-primary" disabled={importing} onClick={() => runImport(false)}>
            Run import
          </button>
        </div>
        {message && <p role="status">{message}</p>}
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2>Recent audit events</h2>
        {audit.length === 0 ? (
          <div className="empty-state">No audit events yet.</div>
        ) : (
          <ul className="audit-list">
            {audit.map((e) => (
              <li key={e.id} className="madia-glass">
                <strong>{e.action}</strong> on {e.entity_type}/{e.entity_id} by {e.actor}
                <span className="audit-time">{new Date(e.created_at).toLocaleString('en-PH')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
