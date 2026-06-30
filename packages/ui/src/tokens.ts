export const colors = {
  oceanDeep: '#0B3D5E',
  oceanMid: '#1F6F8B',
  seaGlass: '#7EC8C7',
  sand: '#F2E6D0',
  forest: '#2F5D3A',
  coral: '#D96C4F',
  mist: '#F7FBFC',
  ink: '#102A33',
  verified: '#1F7A4D',
  partial: '#B7791F',
  unverified: '#6B7280',
};

export const typography = {
  brand: 'var(--font-barabara, Georgia, serif)',
  body: 'var(--font-manrope, system-ui, sans-serif)',
};

export const glass = {
  surface: 'rgba(255, 255, 255, 0.72)',
  border: 'rgba(255, 255, 255, 0.45)',
  blur: '16px',
  shadow: '0 8px 32px rgba(11, 61, 94, 0.12)',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

export const radius = {
  sm: '0.5rem',
  md: '0.875rem',
  lg: '1.25rem',
};

export const motion = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
};

export const cssVariables = `
:root {
  --madia-color-ocean-deep: ${colors.oceanDeep};
  --madia-color-ocean-mid: ${colors.oceanMid};
  --madia-color-sea-glass: ${colors.seaGlass};
  --madia-color-sand: ${colors.sand};
  --madia-color-forest: ${colors.forest};
  --madia-color-ink: ${colors.ink};
  --madia-glass-surface: ${glass.surface};
  --madia-glass-border: ${glass.border};
  --madia-glass-blur: ${glass.blur};
  --madia-radius-md: ${radius.md};
  --madia-space-md: ${spacing.md};
  --madia-motion-normal: ${motion.normal};
  --font-barabara: 'BARABARA', Georgia, serif;
  --font-manrope: 'Manrope', system-ui, sans-serif;
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

.madia-glass {
  background: var(--madia-glass-surface);
  border: 1px solid var(--madia-glass-border);
  backdrop-filter: blur(var(--madia-glass-blur));
  -webkit-backdrop-filter: blur(var(--madia-glass-blur));
  box-shadow: ${glass.shadow};
  border-radius: var(--madia-radius-md);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .madia-glass { background: rgba(255, 255, 255, 0.94); }
}
`;
