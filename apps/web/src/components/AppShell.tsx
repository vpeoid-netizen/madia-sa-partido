'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Destinations' },
  { href: '/#map', label: 'Map' },
  { href: '/trips', label: 'Plan a Trip' },
  { href: '/ai', label: 'AI Assistant' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="site-shell">
      <header className="site-header madia-glass">
        <Link href="/" className="site-brand" aria-label="MADIA sa Partido home">
          <span className="site-brand__logo-surface">
            <img
              src="/images/madia-logo.png"
              alt="MADIA sa Partido"
              className="site-brand__logo"
              width={1080}
              height={377}
            />
          </span>
        </Link>

        <nav aria-label="Primary" className="desktop-nav">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className={pathname === item.href ? 'nav-link nav-link--active' : 'nav-link'}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/trips" className="button button-primary site-header__cta">
          Build itinerary
        </Link>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <span className="site-footer__logo-surface">
            <img
              src="/images/madia-logo.png"
              alt="MADIA sa Partido"
              className="site-footer__logo"
              width={1080}
              height={377}
            />
          </span>
          <p>Your local guide to the destinations, culture, and communities of Partido.</p>
          <p className="site-footer__origin">
            In the Partido area, &ldquo;madia&rdquo; is a colloquial invitation meaning
            &ldquo;let&rsquo;s go,&rdquo; &ldquo;come on,&rdquo; or &ldquo;come here,&rdquo; and is
            locally explained as a contraction of the Bikol words &ldquo;ma&rdquo; and
            &ldquo;diyan.&rdquo; The name therefore carries both a functional meaning and a local
            cultural identity: it describes the technology while inviting people to discover Partido
            in a language familiar to its communities.
          </p>
        </div>
        <nav aria-label="Footer">
          <Link href="/explore">Destinations</Link>
          <Link href="/#map">Map</Link>
          <Link href="/trips">Trips</Link>
          <Link href="/ai">AI Assistant</Link>
        </nav>
      </footer>

      <nav aria-label="Mobile primary" className="mobile-nav madia-glass">
        <ul>
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
