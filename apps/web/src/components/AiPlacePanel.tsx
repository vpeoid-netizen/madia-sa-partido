'use client';

import { useState } from 'react';

export function AiPlacePanel({
  municipalityName,
  placeId,
  placeName,
}: {
  municipalityName: string;
  placeId: string;
  placeName: string;
}) {
  const [question, setQuestion] = useState(`Tell me about ${placeName}`);
  const [answer, setAnswer] = useState<string | null>(null);
  const [records, setRecords] = useState<Array<{ record_id: string; official_name: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, placeId, municipalityName }),
      });
      const data = await response.json();
      setAnswer(data.answer);
      setRecords(data.grounded_records || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="madia-glass detail-panel" aria-labelledby="ai-heading">
      <p className="section-kicker">Local travel assistant</p>
      <h2 id="ai-heading">Ask MADIA about this destination</h2>
      <p style={{ color: 'var(--madia-muted)' }}>
        Get attraction ideas, suggested routes, travel-day tips, and itinerary support for Partido.
      </p>
      <label>
        <span className="sr-only">Your question</span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '1rem',
            border: '1px solid rgba(31,73,56,0.15)',
          }}
        />
      </label>
      <button
        type="button"
        className="button button-primary"
        onClick={ask}
        disabled={loading}
        style={{ marginTop: '0.6rem' }}
      >
        {loading ? 'Preparing your guide…' : 'Ask MADIA'}
      </button>
      {answer && (
        <div style={{ marginTop: '1rem' }}>
          <p>{answer}</p>
          {records.length > 0 && (
            <p style={{ color: 'var(--madia-muted)', fontSize: '0.85rem' }}>
              Based on: {records.map((record) => record.official_name).join(', ')}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
