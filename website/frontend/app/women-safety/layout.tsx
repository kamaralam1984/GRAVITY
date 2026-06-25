import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Women Safety App India — KVL Track | Panic SOS, Safe Walk, Live Location',
  description:
    'KVL Track Women Safety: Shake-to-SOS, live location sharing for 2 hours, fake call feature, Safe Walk mode with auto check-in. Free women safety app available in Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Pune. Download free on Android & iOS.',
  keywords: [
    'women safety app India',
    'women safety app Delhi',
    'women safety app Mumbai',
    'panic SOS app',
    'safe walk app',
    'live location sharing women',
    'fake call app women safety',
    'emergency SOS women India',
    'gravity women safety',
    'personal safety app India',
    'women security app',
    'she safety app',
    'women safety app free',
    'women safety Bengaluru',
    'women safety app Android iOS',
  ],
  openGraph: {
    title: 'KVL Track Women Safety — Because Every Woman Deserves to Feel Safe',
    description:
      'Panic SOS, Safe Walk, live location sharing, fake call — free women safety app for India. Available on Android & iOS.',
    type: 'website',
    url: 'https://gravity.kvlbusinesssolutions.com/women-safety',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og/women-safety.png',
        width: 1200,
        height: 630,
        alt: 'KVL Track Women Safety App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KVL Track Women Safety — Because Every Woman Deserves to Feel Safe',
    description:
      'Panic SOS, Safe Walk, live location sharing, fake call — free women safety app. Download free on Android & iOS.',
    images: ['https://gravity.kvlbusinesssolutions.com/og/women-safety.png'],
  },
  alternates: {
    canonical: 'https://gravity.kvlbusinesssolutions.com/women-safety',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function WomenSafetyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
