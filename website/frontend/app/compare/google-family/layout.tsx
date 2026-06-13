import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gravity vs Google Family Link — Which is Better for Indian Families?',
  description:
    'Compare Gravity and Google Family Link. Gravity offers SOS alerts, elderly care, geofencing, and more — features Google Family Link lacks.',
  keywords: [
    'Gravity vs Google Family Link',
    'Google Family Link alternative',
    'best parental control app India',
  ],
  openGraph: {
    title: 'Gravity vs Google Family Link — Which is Better for Indian Families?',
    description:
      'Compare Gravity and Google Family Link. Gravity offers SOS alerts, elderly care, geofencing, and more — features Google Family Link lacks.',
    url: 'https://gravity.trackalways.com/compare/google-family',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity vs Google Family Link Comparison',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gravity vs Google Family Link — Which is Better for Indian Families?',
    description:
      'Compare Gravity and Google Family Link. Gravity offers SOS alerts, elderly care, geofencing, and more — features Google Family Link lacks.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/compare/google-family' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
