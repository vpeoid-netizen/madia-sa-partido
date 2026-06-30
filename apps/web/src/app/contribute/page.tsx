'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MUNICIPALITY_BY_SLUG } from '@madia/domain';

const MUNICIPALITIES = Object.entries(MUNICIPALITY_BY_SLUG).map(([slug, meta]) => ({
  slug,
  id: meta.id,
  name: meta.displayName,
}));

type ContributionType =
  | 'new_place'
  | 'correction'
  | 'photo'
  | 'price'
  | 'route'
  | 'report'
  | 'event';

const TYPE_LABELS: Record<ContributionType, string> = {
  new_place: 'Add a new place',
  correction: 'Suggest a correction',
  photo: 'Share a photo',
  price: 'Update a price or fee',
  route: 'Suggest a transport route',
  report: 'Report inaccurate information',
  event: 'Add an event or festival',
};

export default function ContributePage() {
  const [type, setType] = useState<ContributionType>('new_place');
  const [municipalityId, setMunicipalityId] = useState<string>(MUNICIPALITIES[0]?.id || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [routeName, setRouteName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const payload: Record<string, string> = {
        description,
      };
      if (name) payload.official_name = name;
      if (photoUrl) payload.photo_url = photoUrl;
      if (priceValue) payload.price_or_fee = priceValue;
      if (routeName) payload.route_name = routeName;

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          municipality_id: municipalityId,
          submitter_email: email,
          submitter_name: submitterName,
          payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || 'Submission failed');
      setStatus(`Submitted successfully. Reference: ${data.submission.id}`);
      setDescription('');
      setName('');
      setPhotoUrl('');
      setPriceValue('');
      setRouteName('');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  const needsPlaceName = ['new_place', 'correction', 'photo', 'price', 'route', 'report'].includes(type);

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h1 className="madia-brand">Contribute to MADIA</h1>
      <p>Share a new place, photo, price update, route, or correction. Submissions are reviewed before publication.</p>
      <p>
        <Link href="/owner/claim">Own a business listing?</Link> Submit an ownership claim.
      </p>

      <form className="madia-glass book-form" onSubmit={submit}>
        <label>
          Contribution type
          <select value={type} onChange={(e) => setType(e.target.value as ContributionType)}>
            {(Object.keys(TYPE_LABELS) as ContributionType[]).map((value) => (
              <option key={value} value={value}>{TYPE_LABELS[value]}</option>
            ))}
          </select>
        </label>

        <label>
          Municipality
          <select value={municipalityId} onChange={(e) => setMunicipalityId(e.target.value)}>
            {MUNICIPALITIES.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>

        {needsPlaceName && (
          <label>
            Place name
            <input value={name} onChange={(e) => setName(e.target.value)} required={type === 'new_place'} />
          </label>
        )}

        {type === 'photo' && (
          <label>
            Photo link
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://"
              required
            />
          </label>
        )}

        {type === 'price' && (
          <label>
            Price or fee
            <input value={priceValue} onChange={(e) => setPriceValue(e.target.value)} required />
          </label>
        )}

        {type === 'route' && (
          <label>
            Route name
            <input value={routeName} onChange={(e) => setRouteName(e.target.value)} required />
          </label>
        )}

        <label>
          Your name
          <input value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} required />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Details
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit for review'}
        </button>
      </form>

      {status && <p role="status" className="book-status">{status}</p>}
    </div>
  );
}
