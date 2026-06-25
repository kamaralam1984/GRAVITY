import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cosmo AI Safety Assistant | KVL Track Family App',
  description:
    "India's first AI-powered family safety assistant. Proactive danger predictions, anomaly detection, intelligent check-ins, and personalised safety insights.",
  keywords: [
    'AI family safety assistant India',
    'smart safety app',
    'AI location insights',
  ],
  openGraph: {
    title: 'Cosmo AI Safety Assistant | KVL Track Family App',
    description:
      "India's first AI-powered family safety assistant. Proactive danger predictions, anomaly detection, intelligent check-ins, and personalised safety insights.",
    url: 'https://gravity.kvlbusinesssolutions.com/ai-assistant',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track Cosmo AI Safety Assistant',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmo AI Safety Assistant | KVL Track Family App',
    description:
      "India's first AI-powered family safety assistant. Proactive danger predictions, anomaly detection, intelligent check-ins, and personalised safety insights.",
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/ai-assistant' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
