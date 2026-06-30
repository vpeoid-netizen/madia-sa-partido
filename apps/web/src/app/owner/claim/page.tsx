'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MUNICIPALITY_BY_SLUG } from '@madia/domain';

const MUNICIPALITIES = Object.entries(MUNICIPALITY_BY_SLUG).map(([slug, meta]) => ({
  slug,
  id: meta.id,
  name: meta.displayName,
}));

export default function OwnerClaimPage() {
  const [municipalityId, setMunicipalityId] = useState<string>(MUNICIPALITIES[0]?.id || '');
  const [businessName, setBusinessName] = useState('');
  const [recordId, setRecordId] = useState('');
  const [email, setEmail] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'claim',
          municipality_id: municipalityId,
          submitter_email: email,
          submitter_name: submitterName,
          payload: {
            official_name: businessName,
            record_id: recordId || undefined,
            description,
            claim_role: 'owner',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || 'Claim request failed');
      setStatus(`Claim submitted. Reference: ${data.submission.id}. A municipal reviewer will contact you.`);
      setBusinessName('');
      setRecordId('');
      setDescription('');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Claim request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '720px', margin: '0 auto' }}>
      <Link href="/contribute" className="button button-secondary">Back to contribute</Link>
      <h1 className="madia-brand">Claim your business listing</h1>
      <p>
        Accommodation providers, restaurants, and tourism operators can request ownership of an existing
        MADIA listing to manage reservations and updates.
      </p>

      <form className="madia-glass book-form" onSubmit={submit}>
        <label>
          Municipality
          <select value={municipalityId} onChange={(e) => setMunicipalityId(e.target.value)}>
            {MUNICIPALITIES.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>

        <label>
          Business or property name
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </label>

        <label>
          MADIA record ID (if known)
          <input
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            placeholder="e.g. MADIA-CAR-ACC-001"
          />
        </label>

        <label>
          Your name
          <input value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} required />
        </label>

        <label>
          Business email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Proof of ownership or management
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Business permit, DOT accreditation, or other supporting details"
            required
          />
        </label>

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit claim request'}
        </button>
      </form>

      {status && <p role="status" className="book-status">{status}</p>}
    </div>
  );
}
