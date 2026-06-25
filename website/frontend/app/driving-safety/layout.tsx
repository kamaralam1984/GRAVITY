import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Driving Safety Score & Trip Tracking — KVL Track',
  description:
    'Monitor driving behaviour, get harsh braking alerts, track routes, and receive notifications when family members arrive safely. India road safety app.',
  keywords: [
    'driving safety app India',
    'family driving tracker',
    'trip tracking app',
  ],
  openGraph: {
    title: 'Driving Safety Score & Trip Tracking — KVL Track',
    description:
      'Monitor driving behaviour, get harsh braking alerts, track routes, and receive notifications when family members arrive safely. India road safety app.',
    url: 'https://gravity.trackalways.com/driving-safety',
    siteName: 'KVL Track by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track Driving Safety Score',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Driving Safety Score & Trip Tracking — KVL Track',
    description:
      'Monitor driving behaviour, get harsh braking alerts, track routes, and receive notifications when family members arrive safely. India road safety app.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/driving-safety' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
