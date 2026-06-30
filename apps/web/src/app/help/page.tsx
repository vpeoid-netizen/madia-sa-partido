export default function HelpPage() {
  return (
    <div style={{ padding: '0.75rem 1rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="madia-brand">Help</h1>
      <section className="madia-glass" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
        <h2>Using the map</h2>
        <p>
          Tap a municipality on the map or choose one from the list. On mobile, the first tap selects
          the municipality and opens its summary. Use Explore Municipality to continue.
        </p>
      </section>
      <section className="madia-glass" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
        <h2>Verification labels</h2>
        <p>
          Verified and partially verified labels show how much MADIA has confirmed. Always check
          source and last confirmation dates on place pages.
        </p>
      </section>
      <section className="madia-glass" style={{ padding: '1rem' }}>
        <h2>Accessibility</h2>
        <p>
          You can use the municipality list without the map. Simplified mode and high contrast can
          be enabled from your browser settings and will be expanded in profile settings.
        </p>
      </section>
    </div>
  );
}
