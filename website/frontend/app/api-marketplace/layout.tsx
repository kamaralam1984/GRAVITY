import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gravity Developer API — Location, Safety & Notification APIs | Trackalways',
  description:
    'Gravity Developer Platform: 50+ REST + WebSocket endpoints for real-time location, SOS safety events, push notifications, and analytics. 99.9% uptime, <100ms response. First 1,000 API calls free. Build on safety.',
  keywords: [
    'family safety API',
    'location tracking API India',
    'real-time location API',
    'SOS alert API',
    'geofencing API',
    'gravity API',
    'trackalways developer API',
    'safety platform API',
    'webhook safety events',
    'IoT location API',
    'REST API location tracking',
    'WebSocket location streaming',
    'developer safety platform',
    'enterprise safety API',
    'family safety developer',
  ],
  openGraph: {
    title: 'Gravity Developer Platform — Build on Safety',
    description:
      '50+ REST + WebSocket endpoints. Location, Safety, Notifications, Analytics. 99.9% uptime, <100ms. First 1,000 calls free.',
    type: 'website',
    url: 'https://gravity.trackalways.com/api-marketplace',
    images: [
      {
        url: 'https://gravity.trackalways.com/og/api-marketplace.png',
        width: 1200,
        height: 630,
        alt: 'Gravity Developer API Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gravity Developer Platform — Build on Safety',
    description:
      '50+ REST + WebSocket endpoints. 99.9% uptime, <100ms response. First 1,000 API calls free — no credit card.',
    images: ['https://gravity.trackalways.com/og/api-marketplace.png'],
  },
  alternates: {
    canonical: 'https://gravity.trackalways.com/api-marketplace',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function APIMarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
