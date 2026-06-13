import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cosmo AI Safety Assistant | Gravity Family App',
  description:
    "India's first AI-powered family safety assistant. Proactive danger predictions, anomaly detection, intelligent check-ins, and personalised safety insights.",
  keywords: [
    'AI family safety assistant India',
    'smart safety app',
    'AI location insights',
  ],
  openGraph: {
    title: 'Cosmo AI Safety Assistant | Gravity Family App',
    description:
      "India's first AI-powered family safety assistant. Proactive danger predictions, anomaly detection, intelligent check-ins, and personalised safety insights.",
    url: 'https://gravity.trackalways.com/ai-assistant',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity Cosmo AI Safety Assistant',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmo AI Safety Assistant | Gravity Family App',
    description:
      "India's first AI-powered family safety assistant. Proactive danger predictions, anomaly detection, intelligent check-ins, and personalised safety insights.",
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/ai-assistant' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
