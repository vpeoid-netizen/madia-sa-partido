'use client';

import { useState } from 'react';

export default function AiPage() {
  const [question, setQuestion] = useState('Create a one-day Partido itinerary with nature and local food.');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="destination-page">
      <header style={{ marginBottom: '2rem' }}>
        <p className="section-kicker">Your local itinerary assistant</p>
        <h1 className="madia-brand section-title">Ask MADIA</h1>
        <p className="section-lead">
          Tell MADIA what you enjoy, how long you are staying, and where you want to begin. It will
          shape a practical Partido travel plan around your interests.
        </p>
      </header>

      <section className="madia-glass detail-panel">
        <label>
          <span className="sr-only">Your travel question</span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={5}
            style={{
              width: '100%',
              padding: '1rem',
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
          style={{ marginTop: '0.75rem' }}
        >
          {loading ? 'Creating your itinerary…' : 'Create my itinerary'}
        </button>
        {answer && <div style={{ marginTop: '1.25rem', lineHeight: 1.75 }}>{answer}</div>}
      </section>
    </div>
  );
}
