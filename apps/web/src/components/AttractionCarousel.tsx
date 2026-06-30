'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AddToItineraryButton } from '@/components/AddToItineraryButton';

export interface AttractionSlide {
  id: string;
  name: string;
  municipality: string;
  municipalitySlug: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  type: string;
  description: string;
  route: string;
  imageUrl?: string;
  imageAttribution?: string;
}

export function AttractionCarousel({ slides }: { slides: AttractionSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const current = slides[index];
  const total = slides.length;

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || total < 2) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % total);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, total]);

  useEffect(() => {
    if (index >= total && total > 0) setIndex(0);
  }, [index, total]);

  if (!current) return null;

  const move = (direction: -1 | 1) => {
    setIndex((value) => (value + direction + total) % total);
    setPaused(true);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < 45) return;
    move(distance > 0 ? -1 : 1);
  };

  return (
    <section
      className="attraction-carousel"
      aria-roledescription="carousel"
      aria-label="Tourist attractions across Partido"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onPointerDown={(event) => {
        pointerStart.current = event.clientX;
      }}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') move(-1);
        if (event.key === 'ArrowRight') move(1);
      }}
      tabIndex={0}
    >
      <div className="attraction-carousel__media" key={current.id}>
        {current.imageUrl ? (
          <img
            src={current.imageUrl}
            alt={`${current.name} in ${current.municipality}`}
            className="attraction-carousel__image"
            loading={index === 0 ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="attraction-carousel__image attraction-carousel__image--scenic" aria-hidden="true" />
        )}
        <div className="attraction-carousel__veil" />
      </div>

      <div className="attraction-carousel__content" aria-live="polite">
        <div className="attraction-carousel__eyebrow">
          <span>{current.type}</span>
          <span aria-hidden="true">•</span>
          <span>{current.municipality}</span>
        </div>
        <h1 className="madia-brand attraction-carousel__title">{current.name}</h1>
        <p className="attraction-carousel__address">{current.address}</p>
        <p className="attraction-carousel__description">{current.description}</p>
        <div className="attraction-carousel__actions">
          <Link href={current.route} className="button button-primary button-light">
            Explore destination
          </Link>
          <AddToItineraryButton
            placeId={current.id}
            placeName={current.name}
            municipalitySlug={current.municipalitySlug}
            municipalityName={current.municipality}
            latitude={current.latitude}
            longitude={current.longitude}
            address={current.address}
          />
        </div>
        {current.imageAttribution && (
          <p className="attraction-carousel__credit">{current.imageAttribution}</p>
        )}
      </div>

      <div className="attraction-carousel__controls" aria-label="Carousel controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous attraction">
          <span aria-hidden="true">←</span>
        </button>
        <div className="attraction-carousel__progress" aria-label={`Attraction ${index + 1} of ${total}`}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <i style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
          <span>{String(total).padStart(2, '0')}</span>
        </div>
        <button type="button" onClick={() => move(1)} aria-label="Next attraction">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
