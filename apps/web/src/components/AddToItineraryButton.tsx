'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSampleItinerary } from '@madia/domain';
import { useSavedTrips } from '@/lib/client-storage';

export function AddToItineraryButton({
  placeId,
  placeName,
  municipalitySlug,
  municipalityName,
  latitude,
  longitude,
  address,
  className = 'button button-glass',
}: {
  placeId: string;
  placeName: string;
  municipalitySlug: string;
  municipalityName: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  className?: string;
}) {
  const router = useRouter();
  const { saveTrip } = useSavedTrips();
  const [message, setMessage] = useState<string | null>(null);

  function handleAdd() {
    const itinerary = createSampleItinerary({
      title: `${placeName} — ${municipalityName}`,
      municipalitySlug,
      places: [
        {
          record_id: placeId,
          official_name: placeName,
          verification_status: 'verified',
          latitude,
          longitude,
          address,
        },
      ],
      travelerCount: 2,
    });

    saveTrip({
      id: itinerary.id,
      title: itinerary.title,
      municipality_slugs: [municipalitySlug],
      traveler_count: itinerary.traveler_count,
      updated_at: new Date().toISOString(),
      payload: { itinerary },
    });

    setMessage('Added to your itinerary');
    window.setTimeout(() => router.push('/trips'), 600);
  }

  return (
    <span className="add-to-itinerary">
      <button type="button" className={className} onClick={handleAdd}>
        Add to an itinerary
      </button>
      {message && (
        <span className="add-to-itinerary__status" role="status">
          {message}
        </span>
      )}
    </span>
  );
}
