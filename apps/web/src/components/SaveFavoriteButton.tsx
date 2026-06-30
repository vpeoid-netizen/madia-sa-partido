'use client';

import { useEffect, useState } from 'react';

function clientId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('madia-client-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('madia-client-id', id);
  }
  return id;
}

export function SaveFavoriteButton({
  recordId,
  placeName,
  route,
}: {
  recordId: string;
  placeName: string;
  route: string;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = clientId();
    fetch(`/api/favorites?client_id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.favorites as Array<{ record_id: string }>;
        setSaved(list.some((f) => f.record_id === recordId));
      })
      .catch(() => undefined);
  }, [recordId]);

  async function toggle() {
    setBusy(true);
    try {
      const cid = clientId();
      if (saved) {
        await fetch(`/api/favorites?client_id=${encodeURIComponent(cid)}&record_id=${encodeURIComponent(recordId)}`, {
          method: 'DELETE',
        });
        setSaved(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: cid, record_id: recordId, place_name: placeName, route }),
        });
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="button button-secondary"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
    >
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
