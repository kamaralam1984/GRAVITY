import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Child Safety App | School Tracking & Geofencing — Gravity',
  description:
    'Know when your child reaches school, leaves tuition, or enters unsafe zones. Real-time alerts, route history, and panic button for kids.',
  keywords: [
    'child safety app India',
    'school tracking app',
    'kids GPS tracker',
  ],
  openGraph: {
    title: 'Child Safety App | School Tracking & Geofencing — Gravity',
    description:
      'Know when your child reaches school, leaves tuition, or enters unsafe zones. Real-time alerts, route history, and panic button for kids.',
    url: 'https://gravity.trackalways.com/child-safety',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity Child Safety App',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Child Safety App | School Tracking & Geofencing — Gravity',
    description:
      'Know when your child reaches school, leaves tuition, or enters unsafe zones. Real-time alerts, route history, and panic button for kids.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/child-safety' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
