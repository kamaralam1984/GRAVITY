import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'School Bus Tracking App — KVL Track | Real-Time Bus GPS for Parents',
  description:
    "Track your child's school bus in real-time with KVL Track. Live GPS, arrival notifications, route monitoring, driver verification. Download free.",
  keywords: [
    'school bus tracking app',
    'school bus GPS',
    'bus tracking parents',
    'school bus location app',
  ],
  openGraph: {
    title: 'School Bus Tracking App — KVL Track | Real-Time Bus GPS for Parents',
    description:
      "Track your child's school bus in real-time with KVL Track. Live GPS, arrival notifications, route monitoring, driver verification. Download free.",
    url: 'https://gravity.kvlbusinesssolutions.com/school-bus-tracking',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'School Bus Tracking — KVL Track',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'School Bus Tracking App — KVL Track | Real-Time Bus GPS for Parents',
    description:
      "Track your child's school bus in real-time with KVL Track. Live GPS, arrival notifications, route monitoring, driver verification. Download free.",
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/school-bus-tracking' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
