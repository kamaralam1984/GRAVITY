import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Trackalways | Gravity Family Safety App',
  description:
    'Trackalways Technologies — building India\'s most trusted family safety platform since 2022. 50,000+ families protected across 30+ cities.',
  keywords: [
    'Trackalways Technologies',
    'Gravity app about',
    'family safety company India',
  ],
  openGraph: {
    title: 'About Trackalways | Gravity Family Safety App',
    description:
      'Trackalways Technologies — building India\'s most trusted family safety platform since 2022. 50,000+ families protected across 30+ cities.',
    url: 'https://gravity.trackalways.com/about',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'About Trackalways — Gravity Family Safety App',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Trackalways | Gravity Family Safety App',
    description:
      'Trackalways Technologies — building India\'s most trusted family safety platform since 2022. 50,000+ families protected across 30+ cities.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/about' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
