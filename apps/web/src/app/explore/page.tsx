import { Suspense } from 'react';
import ExplorePageClient from './ExplorePageClient';

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="empty-state">Loading search…</div>}>
      <ExplorePageClient />
    </Suspense>
  );
}
