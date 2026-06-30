'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MadiaImage } from '@/components/MadiaImage';

interface PlaceResult {
  record_id: string;
  official_name: string;
  municipality: string;
  category: string;
  application_page_route?: string;
  image_url?: string;
  image_attribution?: string;
}

export default function ExplorePageClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) {
          setResults([]);
          setError(data.error || 'Search is temporarily unavailable.');
          return;
        }
        const named = (data.results || []).filter(
          (place: PlaceResult) => place.official_name?.trim(),
        );
        setResults(named);
      } catch {
        setResults([]);
        setError('Search is temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="madia-brand">Explore</h1>
      <label>
        <span className="sr-only">Search destinations</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search places, barangays, or categories"
          className="search-input"
        />
      </label>
      <p aria-live="polite">
        {loading ? 'Searching…' : error ? error : `${results.length} result(s)`}
      </p>
      <ul className="explore-results">
        {results.map((place, index) => (
          <li
            key={place.record_id || place.application_page_route || `${place.official_name}-${index}`}
            className="explore-result madia-glass"
          >
            <MadiaImage
              src={place.image_url || '/images/provincial-fallback.svg'}
              alt={place.official_name}
              fill
              sizes="120px"
              frameClassName="madia-image-frame explore-thumb-frame"
            />
            <div className="explore-result-body">
              <strong>{place.official_name}</strong>
              <p className="home-card-meta">
                {place.municipality} · {place.category}
              </p>
              {place.application_page_route && (
                <Link href={place.application_page_route} className="button button-primary">
                  Open place
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!loading && !error && results.length === 0 && (
        <div className="empty-state">Try another spelling or municipality name.</div>
      )}
    </div>
  );
}
