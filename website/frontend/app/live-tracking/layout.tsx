import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'Live Location Tracking | Real-Time Family GPS — Gravity',
  description:
    "See your family's live location on a map updated every 30 seconds. Works on Android & iOS without draining battery. India's most accurate family tracker.",
  keywords: [
    'live location tracking family',
    'real time GPS tracker India',
  ],
  openGraph: {
    title: 'Live Location Tracking | Real-Time Family GPS — Gravity',
    description:
      "See your family's live location on a map updated every 30 seconds. Works on Android & iOS without draining battery. India's most accurate family tracker.",
    url: 'https://gravity.trackalways.com/live-tracking',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity Live Location Tracking',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Location Tracking | Real-Time Family GPS — Gravity',
    description:
      "See your family's live location on a map updated every 30 seconds. Works on Android & iOS without draining battery. India's most accurate family tracker.",
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/live-tracking' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
