import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Geofencing Alerts | Virtual Safety Zones — KVL Track',
  description:
    'Create unlimited safe zones around home, school, office. Get instant alerts when family members enter or leave. Smart geofencing for Indian families.',
  keywords: [
    'geofencing app India',
    'virtual safety zone',
    'school zone alerts',
  ],
  openGraph: {
    title: 'Geofencing Alerts | Virtual Safety Zones — KVL Track',
    description:
      'Create unlimited safe zones around home, school, office. Get instant alerts when family members enter or leave. Smart geofencing for Indian families.',
    url: 'https://gravity.kvlbusinesssolutions.com/geofencing',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track Geofencing Alerts',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geofencing Alerts | Virtual Safety Zones — KVL Track',
    description:
      'Create unlimited safe zones around home, school, office. Get instant alerts when family members enter or leave. Smart geofencing for Indian families.',
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/geofencing' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
