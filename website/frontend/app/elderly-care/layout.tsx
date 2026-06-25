import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Elderly Care GPS Tracker | KVL Track — For Parents & Grandparents',
  description:
    'Keep your elderly parents safe with fall detection, medication reminders, SOS one-press alerts, and real-time location. Designed for seniors in India.',
  keywords: [
    'elderly GPS tracker India',
    'senior safety app',
    'fall detection app elderly',
  ],
  openGraph: {
    title: 'Elderly Care GPS Tracker | KVL Track — For Parents & Grandparents',
    description:
      'Keep your elderly parents safe with fall detection, medication reminders, SOS one-press alerts, and real-time location. Designed for seniors in India.',
    url: 'https://gravity.kvlbusinesssolutions.com/elderly-care',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track Elderly Care GPS Tracker',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elderly Care GPS Tracker | KVL Track — For Parents & Grandparents',
    description:
      'Keep your elderly parents safe with fall detection, medication reminders, SOS one-press alerts, and real-time location. Designed for seniors in India.',
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/elderly-care' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
