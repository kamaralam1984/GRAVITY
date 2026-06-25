import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SOS Emergency App — KVL Track | One-Tap Emergency Alert with GPS',
  description:
    'Instant SOS emergency alerts with GPS location. One tap sends your location to family + emergency services. Download the fastest SOS app.',
  keywords: [
    'SOS emergency app',
    'personal safety SOS app',
    'emergency alert app',
    'panic button app',
  ],
  openGraph: {
    title: 'SOS Emergency App — KVL Track | One-Tap Emergency Alert with GPS',
    description:
      'Instant SOS emergency alerts with GPS location. One tap sends your location to family + emergency services. Download the fastest SOS app.',
    url: 'https://gravity.trackalways.com/sos-emergency-app',
    siteName: 'KVL Track by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'SOS Emergency App — KVL Track',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOS Emergency App — KVL Track | One-Tap Emergency Alert with GPS',
    description:
      'Instant SOS emergency alerts with GPS location. One tap sends your location to family + emergency services. Download the fastest SOS app.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/sos-emergency-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
