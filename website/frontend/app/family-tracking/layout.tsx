import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Family Location Sharing App | Track Loved Ones — KVL Track',
  description:
    'Share live location with family. See everyone on one map, get arrival alerts, and stay connected without constant calls. Free family tracking app India.',
  keywords: [
    'family location sharing app India',
    'family tracker free',
    'live GPS family map',
  ],
  openGraph: {
    title: 'Family Location Sharing App | Track Loved Ones — KVL Track',
    description:
      'Share live location with family. See everyone on one map, get arrival alerts, and stay connected without constant calls. Free family tracking app India.',
    url: 'https://gravity.kvlbusinesssolutions.com/family-tracking',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track Family Location Sharing',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Location Sharing App | Track Loved Ones — KVL Track',
    description:
      'Share live location with family. See everyone on one map, get arrival alerts, and stay connected without constant calls. Free family tracking app India.',
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/family-tracking' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
