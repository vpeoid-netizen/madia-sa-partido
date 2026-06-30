'use client';

import { useState } from 'react';

export function AiPlacePanel({
  municipalityName,
  municipalitySlug,
  placeId,
  placeName,
}: {
  municipalityName: string;
  municipalitySlug?: string;
  placeId: string;
  placeName: string;
}) {
  const [question, setQuestion] = useState(`Tell me about ${placeName}`);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<
    Array<{ record_id: string; official_name: string; source?: string; last_confirmed?: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  async function ask() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          placeId,
          municipalityName,
          municipalitySlug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnswer(null);
        setSources([]);
        setError(data.error || 'The assistant is temporarily unavailable.');
        return;
      }
      setAnswer(data.answer);
      setSources(data.grounded_records || []);
      setProvider(data.provider && data.provider !== 'grounded' ? data.provider : null);
    } catch {
      setAnswer(null);
      setSources([]);
      setError('The assistant is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="madia-glass" aria-labelledby="ai-heading" style={{ padding: '1rem' }}>
      <h2 id="ai-heading">Ask MADIA about this place</h2>
      <p style={{ fontSize: '0.92rem' }}>
        Answers use published MADIA records only. When information is unavailable, MADIA says so.
      </p>
      <label>
        <span className="sr-only">Your question</span>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem' }}
        />
      </label>
      <button
        type="button"
        className="button button-primary"
        onClick={ask}
        disabled={loading}
        style={{ marginTop: '0.5rem' }}
      >
        {loading ? 'Thinking…' : 'Ask AI Assistant'}
      </button>
      {error && <p style={{ marginTop: '0.75rem' }}>{error}</p>}
      {answer && (
        <div style={{ marginTop: '0.75rem' }}>
          {provider && provider !== 'grounded' && (
            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.85 }}>
              Enhanced by {provider} · grounded in MADIA records
            </p>
          )}
          <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
          {sources.length > 0 && (
            <ul className="source-meta">
              {sources.map((r) => (
                <li key={r.record_id}>
                  <strong>{r.official_name}</strong>
                  {r.last_confirmed && ` · Last updated ${r.last_confirmed}`}
                  {r.source && (
                    <>
                      {' · '}
                      <a href={r.source} target="_blank" rel="noopener noreferrer">
                        Source
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
