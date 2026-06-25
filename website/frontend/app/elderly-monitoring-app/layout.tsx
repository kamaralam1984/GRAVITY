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
    url: 'https://gravity.kvlbusinesssolutions.com/elderly-monitoring-app',
    siteName: 'KVL Track by KVL Business Solutions',
    images: [
      {
        url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
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
    images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    creator: '@kvlbusinesssolutions',
  },
  alternates: { canonical: 'https://gravity.kvlbusinesssolutions.com/elderly-monitoring-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
