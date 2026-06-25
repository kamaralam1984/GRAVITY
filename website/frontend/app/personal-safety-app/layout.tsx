import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personal Safety App — KVL Track | Solo Travel & Emergency Protection',
  description:
    'Stay safe alone with KVL Track. Journey sharing, SOS alerts, check-in reminders, fake call feature. The #1 personal safety app for solo travelers.',
  keywords: [
    'personal safety app',
    'solo travel safety app',
    'women safety app',
    'personal security app',
  ],
  openGraph: {
    title: 'Personal Safety App — KVL Track | Solo Travel & Emergency Protection',
    description:
      'Stay safe alone with KVL Track. Journey sharing, SOS alerts, check-in reminders, fake call feature. The #1 personal safety app for solo travelers.',
    url: 'https://gravity.trackalways.com/personal-safety-app',
    siteName: 'KVL Track by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Personal Safety App — KVL Track',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personal Safety App — KVL Track | Solo Travel & Emergency Protection',
    description:
      'Stay safe alone with KVL Track. Journey sharing, SOS alerts, check-in reminders, fake call feature. The #1 personal safety app for solo travelers.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/personal-safety-app' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
