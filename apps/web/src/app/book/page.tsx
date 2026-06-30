'use client';

import { Suspense } from 'react';
import BookPage from './BookPageClient';

export default function BookPageWrapper() {
  return (
    <Suspense fallback={<div className="empty-state">Loading booking form…</div>}>
      <BookPage />
    </Suspense>
  );
}
