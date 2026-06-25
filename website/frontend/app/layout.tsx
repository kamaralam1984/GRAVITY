import './globals.css'
import 'leaflet/dist/leaflet.css'
import LoaderProvider from '@/components/effects/LoaderProvider'

// Using system font fallbacks to avoid Google Fonts network dependency
const inter = { variable: '--font-inter' }
const plusJakartaSans = { variable: '--font-display' }

export const metadata = {
  metadataBase: new URL('https://gravity.trackalways.com'),
  title: {
    default: "KVL Track — What Pulls You Together | Family Safety App",
    template: "%s | KVL Track by Trackalways",
  },
  description: "KVL Track is the family safety platform that keeps your loved ones connected with real-time location sharing, SOS alerts, geofence zones, and AI-powered insights. Stay safe, stay together.",
  keywords: ["family safety", "GPS tracking", "location sharing", "SOS alert", "geofence", "elderly care", "Trackalways", "KVL Track app"],
  authors: [{ name: "Trackalways Technologies" }],
  creator: "Trackalways Technologies Pvt Ltd",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://gravity.trackalways.com",
    siteName: "KVL Track by Trackalways",
    title: "KVL Track — What Pulls You Together",
    description: "Real-time family location sharing, SOS alerts, and smart geofencing. Know your family is safe, always.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "KVL Track Family Safety" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KVL Track — Family Safety App",
    description: "Real-time family location sharing, SOS alerts, and smart geofencing.",
    images: ["/og-image.svg"],
    creator: "@trackalways",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        {/* DNS prefetch + preconnect for critical origins */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'} />
        {/* Prevent flash: apply stored theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('gravity-theme');var p=(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':(t||'dark');document.documentElement.classList.toggle('dark',p==='dark')}catch(e){}` }} />
      </head>
      <body className="font-body antialiased" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
        <LoaderProvider>
          {children}
        </LoaderProvider>
      </body>
    </html>
  )
}
