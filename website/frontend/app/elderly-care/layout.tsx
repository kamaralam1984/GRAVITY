import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Elderly Care GPS Tracker | Gravity — For Parents & Grandparents',
  description:
    'Keep your elderly parents safe with fall detection, medication reminders, SOS one-press alerts, and real-time location. Designed for seniors in India.',
  keywords: [
    'elderly GPS tracker India',
    'senior safety app',
    'fall detection app elderly',
  ],
  openGraph: {
    title: 'Elderly Care GPS Tracker | Gravity — For Parents & Grandparents',
    description:
      'Keep your elderly parents safe with fall detection, medication reminders, SOS one-press alerts, and real-time location. Designed for seniors in India.',
    url: 'https://gravity.trackalways.com/elderly-care',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity Elderly Care GPS Tracker',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elderly Care GPS Tracker | Gravity — For Parents & Grandparents',
    description:
      'Keep your elderly parents safe with fall detection, medication reminders, SOS one-press alerts, and real-time location. Designed for seniors in India.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/elderly-care' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
