import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/AppShell';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'MADIA sa Partido',
    template: '%s | MADIA sa Partido',
  },
  description:
    'Explore attractions and create personalized itineraries across the Partido Area of Camarines Sur.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'MADIA sa Partido',
    description:
      'Explore attractions and create personalized itineraries across the Partido Area of Camarines Sur.',
    images: [{ url: '/images/madia-logo.png', width: 1024, height: 341, alt: 'MADIA sa Partido logo' }],
    type: 'website',
    locale: 'en_PH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MADIA sa Partido',
    description:
      'Explore attractions and create personalized itineraries across the Partido Area of Camarines Sur.',
    images: ['/images/madia-logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B3D5E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${display.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
