import Link from 'next/link';
import type { MunicipalityMapSummary } from '@madia/domain';
import { MadiaImage } from './MadiaImage';
import { VerificationBadge } from './VerificationBadge';

export function MunicipalitySummaryPanel({
  summary,
  imageUrl,
  imageAttribution,
}: {
  summary: MunicipalityMapSummary;
  imageUrl?: string;
  imageAttribution?: string;
}) {
  return (
    <div className="madia-glass municipality-summary-panel" aria-live="polite">
      {imageUrl && (
        <MadiaImage
          src={imageUrl}
          alt={summary.municipality_name}
          fill
          sizes="360px"
          frameClassName="madia-image-frame summary-image-frame"
        />
      )}
      <div className="municipality-summary-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h2 className="madia-brand" style={{ margin: 0 }}>
            {summary.municipality_name}
          </h2>
          <VerificationBadge status={summary.overall_data_verification_status} />
        </div>
        {imageAttribution && <p className="photo-attribution">{imageAttribution}</p>}
        <p style={{ marginTop: '0.5rem' }}>
          {summary.short_description || 'Information not yet available'}
        </p>
        <dl className="municipality-summary-stats">
          <div>
            <dt>Featured</dt>
            <dd>{summary.featured_attraction || 'Not yet available'}</dd>
          </div>
          <div>
            <dt>Places to visit</dt>
            <dd>{summary.attraction_count}</dd>
          </div>
          <div>
            <dt>Where to stay</dt>
            <dd>{summary.accommodation_count}</dd>
          </div>
          <div>
            <dt>Food and dining</dt>
            <dd>{summary.restaurant_count}</dd>
          </div>
          <div>
            <dt>Getting around (verified)</dt>
            <dd>{summary.verified_transportation_route_count}</dd>
          </div>
          <div>
            <dt>Tourism services</dt>
            <dd>{summary.tourism_service_count}</dd>
          </div>
        </dl>
        <Link
          href={summary.municipality_page_route}
          className="button button-primary"
          style={{ width: '100%' }}
        >
          Explore Municipality
        </Link>
      </div>
    </div>
  );
}
