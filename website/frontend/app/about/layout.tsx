import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About KVL Business Solutions | KVL Track Family Safety App',
  description:
    'KVL Business Solutions Technologies — building India\'s most trusted family safety platform since 2022. 50,000+ families protected across 30+ cities.',
  keywords: [
    'KVL Business Solutions Technologies',
    'KVL Track app about',
    'family safety company India',
  ],
  openGraph: {
    title: 'About KVL Business Solutions | KVL Track Family Safety App',
    description:
      'KVL Business Solutions Technologies — building India\'s most trusted family safety platform since 2022. 50,000+ families protected across 30+ cities.',
    url: 'https://gravity.kvlbusinesssolutions.com/about',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'About KVL Business Solutions — KVL Track Family Safety App',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About KVL Business Solutions | KVL Track Family Safety App',
    description:
      'KVL Business Solutions Technologies — building India\'s most trusted family safety platform since 2022. 50,000+ families protected across 30+ cities.',
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/about' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
