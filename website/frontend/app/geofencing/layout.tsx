import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Geofencing Alerts | Virtual Safety Zones — Gravity',
  description:
    'Create unlimited safe zones around home, school, office. Get instant alerts when family members enter or leave. Smart geofencing for Indian families.',
  keywords: [
    'geofencing app India',
    'virtual safety zone',
    'school zone alerts',
  ],
  openGraph: {
    title: 'Geofencing Alerts | Virtual Safety Zones — Gravity',
    description:
      'Create unlimited safe zones around home, school, office. Get instant alerts when family members enter or leave. Smart geofencing for Indian families.',
    url: 'https://gravity.trackalways.com/geofencing',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity Geofencing Alerts',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geofencing Alerts | Virtual Safety Zones — Gravity',
    description:
      'Create unlimited safe zones around home, school, office. Get instant alerts when family members enter or leave. Smart geofencing for Indian families.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/geofencing' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
