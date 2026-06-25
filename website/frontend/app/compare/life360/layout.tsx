import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVL Track vs Life360 — Which Family Tracker is Better?',
  description:
    'Detailed comparison of KVL Track and Life360. See why Indian families choose KVL Track for better accuracy, lower cost, and India-first features.',
  keywords: [
    'KVL Track vs Life360',
    'Life360 alternative India',
    'best family tracker app',
  ],
  openGraph: {
    title: 'KVL Track vs Life360 — Which Family Tracker is Better?',
    description:
      'Detailed comparison of KVL Track and Life360. See why Indian families choose KVL Track for better accuracy, lower cost, and India-first features.',
    url: 'https://gravity.trackalways.com/compare/life360',
    siteName: 'KVL Track by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track vs Life360 Comparison',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KVL Track vs Life360 — Which Family Tracker is Better?',
    description:
      'Detailed comparison of KVL Track and Life360. See why Indian families choose KVL Track for better accuracy, lower cost, and India-first features.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/compare/life360' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
