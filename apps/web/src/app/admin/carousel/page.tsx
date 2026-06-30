'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Slide {
  destination_record_id: string;
  destination_name: string;
  municipality_name: string;
  display_order: number;
  is_active: boolean;
}

export default function AdminCarouselPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch('/api/admin/carousel')
      .then((r) => r.json())
      .then((data) => setSlides(data.slides || []));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateSlide(recordId: string, displayOrder: number, isActive: boolean) {
    await fetch('/api/admin/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record_id: recordId, display_order: displayOrder, is_active: isActive }),
    });
    setMessage(`Updated ${recordId}`);
    load();
  }

  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
      <Link href="/admin" className="button button-secondary">Back to admin</Link>
      <h1 className="madia-brand">Carousel curation</h1>
      <p>Reorder, activate, or deactivate homepage carousel slides.</p>

      <ul className="audit-list">
        {slides.map((slide) => (
          <li key={slide.destination_record_id} className="madia-glass">
            <strong>{slide.destination_name}</strong> — {slide.municipality_name}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <label>
                Order
                <input
                  type="number"
                  defaultValue={slide.display_order}
                  min={1}
                  style={{ width: '4rem', marginLeft: '0.35rem' }}
                  onBlur={(e) =>
                    updateSlide(
                      slide.destination_record_id,
                      Number(e.target.value),
                      slide.is_active,
                    )
                  }
                />
              </label>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  updateSlide(slide.destination_record_id, slide.display_order, !slide.is_active)
                }
              >
                {slide.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
