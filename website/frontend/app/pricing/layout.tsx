import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans | Gravity Family Safety App',
  description:
    'Choose the perfect Gravity plan for your family. Free forever plan + Pro at ₹499/mo + Family at ₹999/mo + Enterprise. 30-day money-back guarantee.',
  keywords: [
    'family safety app price',
    'GPS tracker subscription India',
    'family tracking app cost',
  ],
  openGraph: {
    title: 'Pricing Plans | Gravity Family Safety App',
    description:
      'Choose the perfect Gravity plan for your family. Free forever plan + Pro at ₹499/mo + Family at ₹999/mo + Enterprise. 30-day money-back guarantee.',
    url: 'https://gravity.trackalways.com/pricing',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity Pricing Plans',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans | Gravity Family Safety App',
    description:
      'Choose the perfect Gravity plan for your family. Free forever plan + Pro at ₹499/mo + Family at ₹999/mo + Enterprise. 30-day money-back guarantee.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/pricing' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
