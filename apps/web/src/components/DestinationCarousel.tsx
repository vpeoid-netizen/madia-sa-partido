'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CarouselSlide } from '@/lib/carousel';
import { MadiaImage } from './MadiaImage';
import { SaveFavoriteButton } from './SaveFavoriteButton';

interface DestinationCarouselProps {
  slides: CarouselSlide[];
}

const STORAGE_KEY = 'madia-carousel-index';

export function DestinationCarousel({ slides }: DestinationCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);
  const activeSlides = slides.filter((s) => s.is_active);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const n = Number(saved);
      if (Number.isFinite(n) && n >= 0 && n < activeSlides.length) setIndex(n);
    }
  }, [activeSlides.length]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, String(index));
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'carousel.view',
        properties: {
          record_id: activeSlides[index]?.destination_record_id,
          slide_index: index,
        },
      }),
    }).catch(() => undefined);
  }, [index, activeSlides]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || activeSlides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % activeSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, activeSlides.length]);

  const goTo = useCallback(
    (next: number) => {
      setPaused(true);
      setIndex(((next % activeSlides.length) + activeSlides.length) % activeSlides.length);
    },
    [activeSlides.length],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
      if (e.key === 'Home') goTo(0);
      if (e.key === 'End') goTo(activeSlides.length - 1);
    },
    [goTo, index, activeSlides.length],
  );

  if (activeSlides.length === 0) {
    return (
      <div className="carousel-empty empty-state" role="region" aria-label="Featured destinations">
        <h1 className="madia-brand">MADIA sa Partido</h1>
        <p>Featured destinations will appear here once published records are imported.</p>
      </div>
    );
  }

  const slide = activeSlides[index];

  return (
    <section
      className="destination-carousel"
      aria-roledescription="carousel"
      aria-label="Featured Partido destinations"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div className="carousel-stage">
        <MadiaImage
          src={slide.image_url || '/images/provincial-fallback.svg'}
          alt={slide.destination_name}
          fill
          priority={index === 0}
          sizes="100vw"
          className="carousel-image"
          frameClassName="carousel-image-frame"
        />
        <div className="carousel-gradient" aria-hidden="true" />
        <div className="carousel-content madia-glass">
          <p className="carousel-kicker">{slide.experience_type}</p>
          <h1 className="madia-brand carousel-title">{slide.destination_name}</h1>
          <p className="carousel-meta">
            {slide.municipality_name}
            {slide.barangay_name ? ` · ${slide.barangay_name}` : ''}
          </p>
          {slide.short_caption && <p className="carousel-caption">{slide.short_caption}</p>}
          <div className="carousel-actions">
            <Link href={slide.destination_page_route} className="button button-primary">
              Explore
            </Link>
            <SaveFavoriteButton
              recordId={slide.destination_record_id}
              placeName={slide.destination_name}
              route={slide.destination_page_route}
            />
            <Link
              href={`/trips?add=${encodeURIComponent(slide.destination_record_id)}`}
              className="button button-secondary"
            >
              Add to trip
            </Link>
          </div>
        </div>
      </div>

      <div className="carousel-controls madia-glass" aria-label="Carousel controls">
        <button type="button" className="button button-secondary" onClick={() => goTo(index - 1)} aria-label="Previous destination">
          ‹
        </button>
        <div className="carousel-dots" role="tablist" aria-label="Select slide">
          {activeSlides.map((s, i) => (
            <button
              key={s.featured_slide_id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${s.destination_name}, slide ${i + 1} of ${activeSlides.length}`}
              className={i === index ? 'dot active' : 'dot'}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="button button-secondary" onClick={() => goTo(index + 1)} aria-label="Next destination">
          ›
        </button>
      </div>

      <div
        className="carousel-swipe-layer"
        onTouchStart={(e) => {
          touchStart.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current;
          if (Math.abs(delta) > 48) goTo(delta < 0 ? index + 1 : index - 1);
          touchStart.current = null;
        }}
        aria-hidden="true"
      />

      <p className="sr-only" aria-live="polite">
        Showing {slide.destination_name} in {slide.municipality_name}, slide {index + 1} of{' '}
        {activeSlides.length}
      </p>
    </section>
  );
}
