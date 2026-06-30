export function VerificationBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let className = 'badge badge-unverified';
  let label = status;
  if (normalized.includes('verified') && !normalized.includes('un') && !normalized.includes('partial')) {
    className = 'badge badge-verified';
    label = 'Verified';
  } else if (normalized.includes('partial')) {
    className = 'badge badge-partial';
    label = 'Partially verified';
  } else if (normalized.includes('manual')) {
    className = 'badge badge-partial';
    label = 'Requires review';
  }
  return <span className={className}>{label}</span>;
}
