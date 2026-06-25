import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Elderly Monitoring App — KVL Track | Fall Detection & Caregiver Dashboard',
  description:
    "Monitor elderly parents with KVL Track's senior safety app. Fall detection, medication reminders, wellness tracking, caregiver alerts. Peace of mind 24/7.",
  keywords: [
    'elderly monitoring app',
    'senior safety app',
    'fall detection app',
    'elderly care app',
  ],
  openGraph: {
    title: 'Elderly Monitoring App — KVL Track | Fall Detection & Caregiver Dashboard',
    description:
      "Monitor elderly parents with KVL Track's senior safety app. Fall detection, medication reminders, wellness tracking, caregiver alerts. Peace of mind 24/7.",
    url: 'https://gravity.trackalways.com/elderly-monitoring-app',
    siteName: 'KVL Track by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Elderly Monitoring App — KVL Track',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elderly Monitoring App — KVL Track | Fall Detection & Caregiver Dashboard',
    description:
      "Monitor elderly parents with KVL Track's senior safety app. Fall detection, medication reminders, wellness tracking, caregiver alerts. Peace of mind 24/7.",
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/elderly-monitoring-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
