'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  type: string;
  municipality_id: string;
  submitter_name: string;
  payload: {
    official_name?: string;
    description?: string;
    photo_url?: string;
    price_or_fee?: string;
    route_name?: string;
  };
  status: string;
  created_at: string;
}

export default function AdminReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState('submitted');
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch(`/api/submissions?status=${filter}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Unable to load submissions');
        setSubmissions(data.submissions || []);
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : 'Unable to load submissions'));
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function review(id: string, decision: 'approved' | 'rejected' | 'returned') {
    const res = await fetch(`/api/submissions/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes: `Marked as ${decision}` }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Review failed');
      return;
    }
    load();
  }

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
      <Link href="/admin" className="button button-secondary">Back to admin</Link>
      <h1 className="madia-brand">Submission review</h1>

      <label>
        Status filter
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginLeft: '0.5rem' }}>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="returned">Returned</option>
        </select>
      </label>

      {message && <p role="status">{message}</p>}

      {submissions.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '1rem' }}>No submissions in this queue.</div>
      ) : (
        <ul className="audit-list" style={{ marginTop: '1rem' }}>
          {submissions.map((s) => (
            <li key={s.id} className="madia-glass">
              <strong>{s.payload.official_name || s.payload.route_name || 'Unnamed'}</strong> — {s.type}
              <p>{s.payload.description}</p>
              {s.payload.photo_url && <p>Photo: {s.payload.photo_url}</p>}
              {s.payload.price_or_fee && <p>Price: {s.payload.price_or_fee}</p>}
              <p className="home-card-meta">
                {s.municipality_id} · {s.submitter_name} · {new Date(s.created_at).toLocaleString('en-PH')}
              </p>
              {s.status === 'submitted' && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" className="button button-primary" onClick={() => review(s.id, 'approved')}>
                    Approve
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => review(s.id, 'returned')}>
                    Return
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => review(s.id, 'rejected')}>
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
