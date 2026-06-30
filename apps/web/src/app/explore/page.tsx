'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MadiaImage } from '@/components/MadiaImage';

interface PlaceResult {
  record_id: string;
  official_name: string;
  municipality: string;
  category: string;
  subcategory?: string;
  short_description?: string;
  complete_address?: string;
  application_page_route?: string;
  image_url?: string;
  image_attribution?: string;
}

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="destination-page">
      <header style={{ marginBottom: '2rem' }}>
        <p className="section-kicker">Find your next stop</p>
        <h1 className="madia-brand section-title">Explore destinations</h1>
        <p className="section-lead">
          Search the beaches, islands, waterfalls, heritage sites, food destinations, and visitor
          services of Partido.
        </p>
      </header>

      <label>
        <span className="sr-only">Search destinations</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a place, municipality, or destination type"
          style={{
            width: '100%',
            minHeight: '3.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '999px',
            border: '1px solid rgba(31,73,56,0.15)',
            background: 'rgba(255,253,247,0.88)',
          }}
        />
      </label>
      <p aria-live="polite" style={{ color: 'var(--madia-muted)' }}>
        {loading ? 'Searching…' : `${results.length} destinations`}
      </p>

      <div className="place-grid">
        {results.map((place) => {
          const description = place.short_description || place.complete_address || `${place.municipality}, Camarines Sur`;
          return (
            <Link
              key={place.record_id}
              href={place.application_page_route || '/'}
              className="place-card madia-glass"
            >
              <MadiaImage
                src={place.image_url || '/images/provincial-fallback.svg'}
                alt={place.official_name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                frameClassName="madia-image-frame place-card__image"
              />
              <div className="place-card__body">
                <span className="place-card__type">
                  {place.subcategory || place.category || 'Destination'}
                </span>
                <h3>{place.official_name}</h3>
                <p className="place-card__description">{description}</p>
                <span className="municipality-card__action">Explore destination →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
