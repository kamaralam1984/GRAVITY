import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'Live Location Tracking | Real-Time Family GPS — KVL Track',
  description:
    "See your family's live location on a map updated every 30 seconds. Works on Android & iOS without draining battery. India's most accurate family tracker.",
  keywords: [
    'live location tracking family',
    'real time GPS tracker India',
  ],
  openGraph: {
    title: 'Live Location Tracking | Real-Time Family GPS — KVL Track',
    description:
      "See your family's live location on a map updated every 30 seconds. Works on Android & iOS without draining battery. India's most accurate family tracker.",
    url: 'https://gravity.kvlbusinesssolutions.com/live-tracking',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track Live Location Tracking',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Location Tracking | Real-Time Family GPS — KVL Track',
    description:
      "See your family's live location on a map updated every 30 seconds. Works on Android & iOS without draining battery. India's most accurate family tracker.",
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/live-tracking' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
