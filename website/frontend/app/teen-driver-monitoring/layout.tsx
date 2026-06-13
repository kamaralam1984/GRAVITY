import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teen Driver Monitoring App — Gravity | Speed & Safety Alerts for Parents',
  description:
    'Monitor your teen driver with Gravity. Get real-time speed alerts, harsh braking detection, phone usage warnings, and driving safety scores.',
  keywords: [
    'teen driver monitoring',
    'teenage driver app',
    'teen driving safety',
    'parent teen driver tracking',
  ],
  openGraph: {
    title: 'Teen Driver Monitoring App — Gravity | Speed & Safety Alerts for Parents',
    description:
      'Monitor your teen driver with Gravity. Get real-time speed alerts, harsh braking detection, phone usage warnings, and driving safety scores.',
    url: 'https://gravity.trackalways.com/teen-driver-monitoring',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Teen Driver Monitoring — Gravity',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teen Driver Monitoring App — Gravity | Speed & Safety Alerts for Parents',
    description:
      'Monitor your teen driver with Gravity. Get real-time speed alerts, harsh braking detection, phone usage warnings, and driving safety scores.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/teen-driver-monitoring' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
