import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SOS Emergency Button | One-Press Family Alert — KVL Track',
  description:
    'In an emergency, one press sends GPS location to your entire family circle. Works offline, on 2G, anywhere in India. Life-saving SOS for the whole family.',
  keywords: [
    'SOS emergency app India',
    'panic button app',
    'emergency alert family',
  ],
  openGraph: {
    title: 'SOS Emergency Button | One-Press Family Alert — KVL Track',
    description:
      'In an emergency, one press sends GPS location to your entire family circle. Works offline, on 2G, anywhere in India. Life-saving SOS for the whole family.',
    url: 'https://gravity.trackalways.com/sos-emergency',
    siteName: 'KVL Track by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'KVL Track SOS Emergency Button',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOS Emergency Button | One-Press Family Alert — KVL Track',
    description:
      'In an emergency, one press sends GPS location to your entire family circle. Works offline, on 2G, anywhere in India. Life-saving SOS for the whole family.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
    creator: '@trackalways',
  },
  alternates: { canonical: 'https://gravity.trackalways.com/sos-emergency' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
