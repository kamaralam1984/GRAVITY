import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans | KVL Track Family Safety App',
  description:
    'Choose the perfect KVL Track plan for your family. Free forever plan + Pro at ₹499/mo + Family at ₹999/mo + Enterprise. 30-day money-back guarantee.',
  keywords: [
    'family safety app price',
    'GPS tracker subscription India',
    'family tracking app cost',
  ],
  openGraph: {
    title: 'Pricing Plans | KVL Track Family Safety App',
    description:
      'Choose the perfect KVL Track plan for your family. Free forever plan + Pro at ₹499/mo + Family at ₹999/mo + Enterprise. 30-day money-back guarantee.',
    url: 'https://gravity.kvlbusinesssolutions.com/pricing',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track Pricing Plans',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans | KVL Track Family Safety App',
    description:
      'Choose the perfect KVL Track plan for your family. Free forever plan + Pro at ₹499/mo + Family at ₹999/mo + Enterprise. 30-day money-back guarantee.',
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/pricing' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
