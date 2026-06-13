import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Child Safety App — Gravity | School Tracking, SOS & AI Protection',
  description:
    "Protect your children with Gravity's AI-powered child safety app. School route monitoring, geofencing, instant alerts, pickup verification. Download free.",
  keywords: [
    'child safety app',
    'child tracking app',
    'kids safety app',
    'child protection app',
  ],
  openGraph: {
    title: 'Child Safety App — Gravity | School Tracking, SOS & AI Protection',
    description:
      "Protect your children with Gravity's AI-powered child safety app. School route monitoring, geofencing, instant alerts, pickup verification. Download free.",
    url: 'https://gravity.trackalways.com/child-safety-app',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Child Safety App — Gravity',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Child Safety App — Gravity | School Tracking, SOS & AI Protection',
    description:
      "Protect your children with Gravity's AI-powered child safety app. School route monitoring, geofencing, instant alerts, pickup verification. Download free.",
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/child-safety-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
