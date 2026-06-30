import Link from 'next/link';
import type { MunicipalityMapSummary } from '@madia/domain';

export function MunicipalitySummaryPanel({ summary }: { summary: MunicipalityMapSummary }) {
  return (
    <div className="madia-glass" style={{ padding: '1rem' }} aria-live="polite">
      <p className="section-kicker" style={{ marginBottom: '0.35rem' }}>Municipality</p>
      <h2 className="madia-brand" style={{ margin: 0, fontSize: '2rem' }}>
        {summary.municipality_name}
      </h2>
      {summary.short_description && (
        <p style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>{summary.short_description}</p>
      )}
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.65rem 0.75rem',
          margin: '1rem 0',
          fontSize: '0.9rem',
        }}
      >
        {summary.featured_attraction && (
          <div style={{ gridColumn: '1 / -1' }}>
            <dt style={{ color: 'var(--madia-muted)' }}>Featured destination</dt>
            <dd style={{ margin: 0, fontWeight: 750 }}>{summary.featured_attraction}</dd>
          </div>
        )}
        <div>
          <dt style={{ color: 'var(--madia-muted)' }}>Places to visit</dt>
          <dd style={{ margin: 0, fontWeight: 750 }}>{summary.attraction_count}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--madia-muted)' }}>Places to stay</dt>
          <dd style={{ margin: 0, fontWeight: 750 }}>{summary.accommodation_count}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--madia-muted)' }}>Food and dining</dt>
          <dd style={{ margin: 0, fontWeight: 750 }}>{summary.restaurant_count}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--madia-muted)' }}>Tourism services</dt>
          <dd style={{ margin: 0, fontWeight: 750 }}>{summary.tourism_service_count}</dd>
        </div>
      </dl>
      <Link href={summary.municipality_page_route} className="button button-primary" style={{ width: '100%' }}>
        Explore {summary.municipality_name}
      </Link>
    </div>
  );
}
