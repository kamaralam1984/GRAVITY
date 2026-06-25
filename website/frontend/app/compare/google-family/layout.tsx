import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVL Track vs Google Family Link — Which is Better for Indian Families?',
  description:
    'Compare KVL Track and Google Family Link. KVL Track offers SOS alerts, elderly care, geofencing, and more — features Google Family Link lacks.',
  keywords: [
    'KVL Track vs Google Family Link',
    'Google Family Link alternative',
    'best parental control app India',
  ],
  openGraph: {
    title: 'KVL Track vs Google Family Link — Which is Better for Indian Families?',
    description:
      'Compare KVL Track and Google Family Link. KVL Track offers SOS alerts, elderly care, geofencing, and more — features Google Family Link lacks.',
    url: 'https://gravity.kvlbusinesssolutions.com/compare/google-family',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track vs Google Family Link Comparison',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KVL Track vs Google Family Link — Which is Better for Indian Families?',
    description:
      'Compare KVL Track and Google Family Link. KVL Track offers SOS alerts, elderly care, geofencing, and more — features Google Family Link lacks.',
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/compare/google-family' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
