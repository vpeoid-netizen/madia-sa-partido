'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/map', label: 'Map' },
  { href: '/explore', label: 'Explore' },
  { href: '/trips', label: 'Trips' },
  { href: '/ai', label: 'AI' },
  { href: '/contribute', label: 'Contribute' },
  { href: '/account', label: 'Account' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header
        className="madia-glass site-header"
        style={{
          margin: '0.75rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          position: 'sticky',
          top: '0.75rem',
          zIndex: 20,
        }}
      >
        <Link href="/" className="site-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Image
            src="/images/madia-logo.png"
            alt="MADIA sa Partido"
            width={220}
            height={73}
            priority
            className="site-logo"
          />
          <span className="sr-only">MADIA sa Partido — Mixed-Reality AI Destination and Itinerary Assistant</span>
        </Link>
        <nav aria-label="Primary" className="desktop-nav">
          <ul
            style={{
              display: 'flex',
              gap: '0.5rem',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              flexWrap: 'wrap',
            }}
          >
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className="button button-secondary"
                  style={{ minHeight: '2.5rem', padding: '0.4rem 0.75rem' }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main style={{ flex: 1, minHeight: 0 }}>{children}</main>

      <nav
        aria-label="Mobile primary"
        className="mobile-nav madia-glass"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'none',
          padding: '0.5rem',
          zIndex: 30,
        }}
      >
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '0.25rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'var(--madia-touch-min)',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontSize: '0.72rem',
                  fontWeight: pathname === item.href ? 700 : 500,
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <style jsx global>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none;
          }
          .mobile-nav {
            display: block !important;
          }
          main {
            padding-bottom: 5rem;
          }
          .site-logo {
            width: min(58vw, 200px) !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
