export function SourceMeta({
  source,
  lastUpdated,
  priceNote,
}: {
  source?: string;
  lastUpdated?: string;
  priceNote?: string;
}) {
  return (
    <ul className="source-meta">
      {lastUpdated && (
        <li>
          <strong>Last updated:</strong> {lastUpdated}
        </li>
      )}
      {source && (
        <li>
          <strong>Source:</strong>{' '}
          {source.startsWith('http') ? (
            <a href={source} rel="noopener noreferrer" target="_blank">
              View source
            </a>
          ) : (
            source
          )}
        </li>
      )}
      {priceNote && <li>{priceNote}</li>}
    </ul>
  );
}
