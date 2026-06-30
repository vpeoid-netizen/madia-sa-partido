'use client';

import { useState } from 'react';
import Link from 'next/link';

const MUNICIPALITIES = [
  { slug: '', name: 'All Partido' },
  { slug: 'caramoan', name: 'Caramoan' },
  { slug: 'garchitorena', name: 'Garchitorena' },
  { slug: 'goa', name: 'Goa' },
  { slug: 'lagonoy', name: 'Lagonoy' },
  { slug: 'presentacion', name: 'Presentacion' },
  { slug: 'sagnay', name: 'Sagñay' },
  { slug: 'san-jose', name: 'San Jose' },
  { slug: 'siruma', name: 'Siruma' },
  { slug: 'tigaon', name: 'Tigaon' },
  { slug: 'tinambac', name: 'Tinambac' },
];

const SAMPLE_QUESTIONS = [
  'What can I do in Goa for one day?',
  'Beaches in Caramoan',
  'Where can I eat seafood in Lagonoy?',
  'Places to stay in Sagñay',
];

interface GroundedRecord {
  record_id: string;
  official_name: string;
  verification_status: string;
  source?: string;
  last_confirmed?: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  ollama: 'Ollama',
  groq: 'Groq',
  gemini: 'Gemini',
  openai: 'OpenAI',
};

export default function AiPage() {
  const [question, setQuestion] = useState('What can I do in Goa for one day?');
  const [municipalitySlug, setMunicipalitySlug] = useState('goa');
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProvider, setLastProvider] = useState<string | null>(null);

  const municipalityName =
    MUNICIPALITIES.find((municipality) => municipality.slug === municipalitySlug)?.name ||
    'Partido';

  async function ask(preset?: string) {
    const nextQuestion = preset ?? question;
    if (preset) setQuestion(preset);
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);
    setLastProvider(null);

    try {
      const body: Record<string, string> = { question: nextQuestion };
      if (municipalitySlug) {
        body.municipalitySlug = municipalitySlug;
        body.municipalityName = municipalityName;
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'The assistant is temporarily unavailable.');
        return;
      }

      setAnswer(data.answer || 'No answer returned.');
      setSources(data.grounded_records || []);
      setLastProvider(data.provider && data.provider !== 'grounded' ? data.provider : null);
    } catch {
      setError('The assistant is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="madia-brand">AI Assistant</h1>
      <p>
        Grounded tourism help for the Partido Area. Answers use published MADIA records only and
        will not invent missing facts.
      </p>

      <label style={{ display: 'block', marginTop: '1rem' }}>
        <span>Municipality scope</span>
        <select
          value={municipalitySlug}
          onChange={(event) => setMunicipalitySlug(event.target.value)}
          style={{ display: 'block', width: '100%', marginTop: '0.35rem', padding: '0.6rem' }}
        >
          {MUNICIPALITIES.map((municipality) => (
            <option key={municipality.slug || 'all'} value={municipality.slug}>
              {municipality.name}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'block', marginTop: '1rem' }}>
        <span>Your question</span>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', marginTop: '0.35rem' }}
        />
      </label>

      <button
        type="button"
        className="button button-primary"
        onClick={() => ask()}
        disabled={loading || !question.trim()}
        style={{ marginTop: '0.5rem' }}
      >
        {loading ? 'Thinking…' : 'Ask'}
      </button>

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '0.92rem', marginBottom: '0.5rem' }}>Try asking:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {SAMPLE_QUESTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              className="button"
              onClick={() => ask(sample)}
              disabled={loading}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="empty-state" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {answer && (
        <div className="madia-glass" style={{ marginTop: '1rem', padding: '1rem' }}>
          {lastProvider && (
            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', opacity: 0.85 }}>
              Enhanced by {PROVIDER_LABELS[lastProvider] || lastProvider} · grounded in MADIA records
            </p>
          )}
          <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
          {sources.length > 0 && (
            <>
              <h2 style={{ fontSize: '1rem', marginTop: '1rem' }}>Grounded records</h2>
              <ul className="source-meta">
                {sources.map((record) => (
                  <li key={record.record_id}>
                    <strong>{record.official_name}</strong>
                    {` · ${record.verification_status}`}
                    {record.last_confirmed && ` · Updated ${record.last_confirmed}`}
                    {record.source && (
                      <>
                        {' · '}
                        <a href={record.source} target="_blank" rel="noopener noreferrer">
                          Source
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <p style={{ marginTop: '1.25rem', fontSize: '0.92rem' }}>
        Tip: open any place page and use <strong>Ask MADIA about this place</strong> for
        place-specific answers.{' '}
        <Link href="/explore">Browse places</Link>
      </p>
    </div>
  );
}
