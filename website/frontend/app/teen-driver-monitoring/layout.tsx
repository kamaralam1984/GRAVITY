import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teen Driver Monitoring App — KVL Track | Speed & Safety Alerts for Parents',
  description:
    'Monitor your teen driver with KVL Track. Get real-time speed alerts, harsh braking detection, phone usage warnings, and driving safety scores.',
  keywords: [
    'teen driver monitoring',
    'teenage driver app',
    'teen driving safety',
    'parent teen driver tracking',
  ],
  openGraph: {
    title: 'Teen Driver Monitoring App — KVL Track | Speed & Safety Alerts for Parents',
    description:
      'Monitor your teen driver with KVL Track. Get real-time speed alerts, harsh braking detection, phone usage warnings, and driving safety scores.',
    url: 'https://gravity.kvlbusinesssolutions.com/teen-driver-monitoring',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Teen Driver Monitoring — KVL Track',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teen Driver Monitoring App — KVL Track | Speed & Safety Alerts for Parents',
    description:
      'Monitor your teen driver with KVL Track. Get real-time speed alerts, harsh braking detection, phone usage warnings, and driving safety scores.',
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/teen-driver-monitoring' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
