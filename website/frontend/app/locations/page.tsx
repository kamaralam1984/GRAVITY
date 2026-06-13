import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import JsonLd from '@/components/seo/JsonLd'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Family Safety App in India | Cities We Serve — Gravity',
  description:
    'Gravity family safety app is trusted by families in 30+ Indian cities. Find your city for local GPS tracking, SOS alerts, and smart geofencing.',
  keywords: [
    'family safety app india',
    'GPS tracker india',
    'child tracking app india',
    'family location sharing india',
    'best family safety app india',
  ],
  openGraph: {
    title: 'Family Safety App in India | Cities We Serve — Gravity',
    description:
      'Gravity family safety app is trusted by families in 30+ Indian cities. Find your city for local GPS tracking, SOS alerts, and smart geofencing.',
    url: 'https://gravity.trackalways.com/locations',
    siteName: 'Gravity by Trackalways',
    images: [
      {
        url: 'https://gravity.trackalways.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Gravity Family Safety App — Cities in India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Safety App in India | Cities We Serve — Gravity',
    description:
      'Real-time GPS tracking, SOS alerts & geofencing for families in 30+ Indian cities.',
    images: ['https://gravity.trackalways.com/og-image.svg'],
  },
  alternates: {
    canonical: 'https://gravity.trackalways.com/locations',
  },
}

// ─── City Data ────────────────────────────────────────────────────────────────

const CITIES = [
  {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    population: '20M+',
    highlight: 'Local train & suburban tracking',
  },
  {
    slug: 'delhi',
    name: 'Delhi',
    state: 'Delhi NCR',
    population: '30M+',
    highlight: 'Metro stations & colony geofencing',
  },
  {
    slug: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    population: '12M+',
    highlight: 'IT corridor driving safety scores',
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    population: '10M+',
    highlight: 'Beach zones & school campus alerts',
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    population: '10M+',
    highlight: 'HITEC City to Old City tracking',
  },
  {
    slug: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    population: '7M+',
    highlight: 'Campus & Hinjewadi IT park alerts',
  },
  {
    slug: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    population: '15M+',
    highlight: 'Trams, metro & north Kolkata lanes',
  },
  {
    slug: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    population: '8M+',
    highlight: 'BRTS corridors & satellite townships',
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    population: '4M+',
    highlight: 'Walled City & festival-time safety',
  },
  {
    slug: 'surat',
    name: 'Surat',
    state: 'Gujarat',
    population: '7M+',
    highlight: 'Route tracking from Adajan to Dumas',
  },
  {
    slug: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    population: '4M+',
    highlight: 'Gomti Nagar & Hazratganj alerts',
  },
  {
    slug: 'chandigarh',
    name: 'Chandigarh',
    state: 'Punjab/Haryana',
    population: '1.2M+',
    highlight: 'Sector-by-sector precise geofencing',
  },
  {
    slug: 'bhopal',
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    population: '2.5M+',
    highlight: 'Old city & new Bhopal family tracking',
  },
  {
    slug: 'nagpur',
    name: 'Nagpur',
    state: 'Maharashtra',
    population: '3M+',
    highlight: "Ring road driving safety",
  },
  {
    slug: 'indore',
    name: 'Indore',
    state: 'Madhya Pradesh',
    population: '3.5M+',
    highlight: 'Education hub & IDA area tracking',
  },
]

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://gravity.trackalways.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Locations',
      item: 'https://gravity.trackalways.com/locations',
    },
  ],
}

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Gravity Family Safety App — Indian Cities',
  description:
    'Cities in India where Gravity family safety app provides GPS tracking, SOS alerts, and geofencing.',
  numberOfItems: CITIES.length,
  itemListElement: CITIES.map((city, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `Family Safety App in ${city.name}`,
    url: `https://gravity.trackalways.com/locations/${city.slug}`,
  })),
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function LocationsIndexPage() {
  return (
    <main style={{ background: '#0B0D13' }} className="min-h-screen">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />

      <Navbar />

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2"
      >
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-[#D4A853] transition-colors">
              Home
            </Link>
          </li>
          <li className="text-gray-600">/</li>
          <li className="text-[#D4A853] font-medium">Locations</li>
        </ol>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-28 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,168,83,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4A853]/30 bg-[#D4A853]/10 text-[#D4A853] text-sm font-medium mb-6">
            <span>🇮🇳</span>
            <span>30+ Cities Across India</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Family Safety App{' '}
            <span className="text-[#D4A853]">in India</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Gravity is India&apos;s family safety platform — real-time GPS
            tracking, one-tap SOS, and smart geofencing trusted by 50,000+
            families across the country.
          </p>
          <p className="text-base text-gray-400 max-w-xl mx-auto mb-10">
            Select your city below to see how Gravity works in your local area,
            with features and context built specifically for your city.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-[#D4A853] text-[#0B0D13] font-bold text-base hover:bg-[#e0b86a] transition-all duration-200 shadow-lg shadow-[#D4A853]/20"
            >
              Download Free on Android
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border border-[#D4A853]/50 text-[#D4A853] font-semibold text-base hover:bg-[#D4A853]/10 transition-all duration-200"
            >
              Download Free on iOS
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-[#111420] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '50,000+', label: 'Families Protected' },
              { value: '30+', label: 'Cities Covered' },
              { value: '4.8★', label: 'App Store Rating' },
              { value: '99.9%', label: 'Uptime Reliability' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-3xl md:text-4xl font-extrabold text-[#D4A853]">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-white">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── City Grid ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Find Gravity in Your City
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base">
              Each city page includes local context, city-specific features, and
              tips for getting the most out of Gravity where you live.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/locations/${city.slug}`}
                className="group bg-[#111420] border border-white/5 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#D4A853]/40 hover:bg-[#111420] transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold text-xl group-hover:text-[#D4A853] transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{city.state}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#D4A853] font-bold text-sm">
                      {city.population}
                    </span>
                    <p className="text-gray-600 text-xs">population</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {city.highlight}
                </p>
                <div className="flex items-center gap-1.5 text-[#D4A853] text-sm font-medium mt-auto pt-1">
                  <span>See {city.name} details</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why City Pages ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-[#111420]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              One App, Every Indian City
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
              Gravity is built from the ground up for Indian conditions — variable
              network quality, mixed device types, multigenerational households,
              and the unique commute patterns of Indian cities. Whether
              you&apos;re in a Tier-1 metro or a fast-growing Tier-2 city, Gravity
              works reliably.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: '📶',
                title: 'Works on 2G, 3G & 4G',
                body: 'Gravity adapts its data usage to your network conditions — no dropped tracking in low-signal areas.',
              },
              {
                icon: '🔋',
                title: 'Battery Optimised',
                body: 'Our adaptive algorithm uses less than 2% battery per day on most devices, so tracking never drains your phone.',
              },
              {
                icon: '🇮🇳',
                title: 'Made in India, for India',
                body: 'Data stored in India. Hindi & regional language support. Designed with Indian family structures in mind.',
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                body: 'Every family member controls their own sharing. No data is sold or shared with advertisers. Ever.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#0B0D13] border border-white/5 rounded-2xl p-6 flex gap-4"
              >
                <div className="text-2xl shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h3 className="text-white font-semibold text-base mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,168,83,0.07) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Start Protecting Your Family{' '}
            <span className="text-[#D4A853]">Today</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-10">
            Free to download. No credit card. Works on any Android or iPhone
            your family already uses.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-[#D4A853] text-[#0B0D13] font-bold text-base hover:bg-[#e0b86a] transition-all duration-200 shadow-lg shadow-[#D4A853]/20 w-full sm:w-auto text-center"
            >
              Download on Google Play
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border border-[#D4A853]/50 text-[#D4A853] font-semibold text-base hover:bg-[#D4A853]/10 transition-all duration-200 w-full sm:w-auto text-center"
            >
              Download on App Store
            </a>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-base hover:border-white/40 hover:bg-white/5 transition-all duration-200 w-full sm:w-auto text-center"
            >
              See Plans →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
