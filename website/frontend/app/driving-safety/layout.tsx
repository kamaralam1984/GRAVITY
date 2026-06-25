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
    url: 'https://gravity.kvlbusinesssolutions.com/driving-safety',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
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
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/driving-safety' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
