import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features | Real-Time Family Safety — Gravity',
  description:
    'GPS tracking, geofencing alerts, SOS emergency button, AI-powered insights, family chat, driving safety scores. Everything your family needs to stay safe.',
  keywords: [
    'family GPS tracker features',
    'geofence alerts',
    'SOS emergency app India',
  ],
  openGraph: {
    title: 'Features | Real-Time Family Safety — Gravity',
    description:
      'GPS tracking, geofencing alerts, SOS emergency button, AI-powered insights, family chat, driving safety scores. Everything your family needs to stay safe.',
    url: 'https://gravity.trackalways.com/features',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity Features',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features | Real-Time Family Safety — Gravity',
    description:
      'GPS tracking, geofencing alerts, SOS emergency button, AI-powered insights, family chat, driving safety scores. Everything your family needs to stay safe.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/features' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
