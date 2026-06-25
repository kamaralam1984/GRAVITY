import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Child Safety App — KVL Track | School Tracking, SOS & AI Protection',
  description:
    "Protect your children with KVL Track's AI-powered child safety app. School route monitoring, geofencing, instant alerts, pickup verification. Download free.",
  keywords: [
    'child safety app',
    'child tracking app',
    'kids safety app',
    'child protection app',
  ],
  openGraph: {
    title: 'Child Safety App — KVL Track | School Tracking, SOS & AI Protection',
    description:
      "Protect your children with KVL Track's AI-powered child safety app. School route monitoring, geofencing, instant alerts, pickup verification. Download free.",
    url: 'https://gravity.kvlbusinesssolutions.com/child-safety-app',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Child Safety App — KVL Track',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Child Safety App — KVL Track | School Tracking, SOS & AI Protection',
    description:
      "Protect your children with KVL Track's AI-powered child safety app. School route monitoring, geofencing, instant alerts, pickup verification. Download free.",
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/child-safety-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
