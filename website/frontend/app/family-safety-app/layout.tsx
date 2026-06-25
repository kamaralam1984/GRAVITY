import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Best Family Safety App 2024 — KVL Track | GPS, SOS & AI Protection',
  description:
    'Download the #1 family safety app. Real-time GPS tracking, instant SOS alerts, geofencing, AI Guardian protection. Trusted by 2.5M+ families worldwide.',
  keywords: [
    'family safety app',
    'best family safety app',
    'family protection app',
    'family tracking app 2024',
  ],
  openGraph: {
    title: 'Best Family Safety App 2024 — KVL Track | GPS, SOS & AI Protection',
    description:
      'Download the #1 family safety app. Real-time GPS tracking, instant SOS alerts, geofencing, AI Guardian protection. Trusted by 2.5M+ families worldwide.',
    url: 'https://gravity.trackalways.com/family-safety-app',
    siteName: 'KVL Track by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Best Family Safety App — KVL Track',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Family Safety App 2024 — KVL Track | GPS, SOS & AI Protection',
    description:
      'Download the #1 family safety app. Real-time GPS tracking, instant SOS alerts, geofencing, AI Guardian protection. Trusted by 2.5M+ families worldwide.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/family-safety-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
