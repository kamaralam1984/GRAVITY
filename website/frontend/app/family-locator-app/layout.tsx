import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Family Locator App — KVL Track | Find Any Family Member Instantly',
  description:
    "Find any family member's real-time location instantly with KVL Track Family Locator. GPS accuracy within 3 meters. Works in 127 countries.",
  keywords: [
    'family locator app',
    'find my family app',
    'family location tracker',
    'family finder app',
  ],
  openGraph: {
    title: 'Family Locator App — KVL Track | Find Any Family Member Instantly',
    description:
      "Find any family member's real-time location instantly with KVL Track Family Locator. GPS accuracy within 3 meters. Works in 127 countries.",
    url: 'https://gravity.trackalways.com/family-locator-app',
    siteName: 'KVL Track by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Family Locator App — KVL Track',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Locator App — KVL Track | Find Any Family Member Instantly',
    description:
      "Find any family member's real-time location instantly with KVL Track Family Locator. GPS accuracy within 3 meters. Works in 127 countries.",
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/family-locator-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
