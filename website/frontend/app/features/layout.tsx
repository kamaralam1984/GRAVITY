import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features | Real-Time Family Safety — KVL Track',
  description:
    'GPS tracking, geofencing alerts, SOS emergency button, AI-powered insights, family chat, driving safety scores. Everything your family needs to stay safe.',
  keywords: [
    'family GPS tracker features',
    'geofence alerts',
    'SOS emergency app India',
  ],
  openGraph: {
    title: 'Features | Real-Time Family Safety — KVL Track',
    description:
      'GPS tracking, geofencing alerts, SOS emergency button, AI-powered insights, family chat, driving safety scores. Everything your family needs to stay safe.',
    url: 'https://gravity.kvlbusinesssolutions.com/features',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track Features',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features | Real-Time Family Safety — KVL Track',
    description:
      'GPS tracking, geofencing alerts, SOS emergency button, AI-powered insights, family chat, driving safety scores. Everything your family needs to stay safe.',
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/features' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
