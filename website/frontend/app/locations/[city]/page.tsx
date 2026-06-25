import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import JsonLd from '@/components/seo/JsonLd'

// ─── City Data ───────────────────────────────────────────────────────────────

type CityData = {
  name: string
  state: string
  population: string
  altName?: string
  safetyContext: string
  localFeature: string
}

const CITIES: Record<string, CityData> = {
  mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    population: '20M+',
    altName: 'Bombay',
    safetyContext:
      "Mumbai's fast-paced lifestyle and late commutes make real-time family tracking essential for peace of mind.",
    localFeature:
      "Track family members across Mumbai's vast local train network and suburban areas",
  },
  delhi: {
    name: 'Delhi',
    state: 'Delhi NCR',
    population: '30M+',
    safetyContext:
      "Delhi's large geography and dense traffic make knowing your family's location a daily necessity.",
    localFeature:
      "Smart geofencing for schools, colonies, and metro stations across Delhi NCR",
  },
  bangalore: {
    name: 'Bangalore',
    state: 'Karnataka',
    population: '12M+',
    safetyContext:
      "Bangalore's IT corridor and late-night work culture mean families often commute at odd hours.",
    localFeature:
      "Driving safety scores for Bangalore's notorious traffic — Electronic City to Whitefield",
  },
  chennai: {
    name: 'Chennai',
    state: 'Tamil Nadu',
    population: '10M+',
    safetyContext:
      'Chennai families rely on KVL Track for school tracking, beach safety zones, and elderly parent monitoring.',
    localFeature:
      "Geofence Chennai's iconic landmarks: Marina Beach zone, school campuses, IT parks",
  },
  hyderabad: {
    name: 'Hyderabad',
    state: 'Telangana',
    population: '10M+',
    safetyContext:
      "Hyderabad's twin-city spread (Secunderabad + Hyderabad) requires reliable cross-city family tracking.",
    localFeature:
      "Track family across Hyderabad's HITEC City, Old City, and Cyberabad in one view",
  },
  pune: {
    name: 'Pune',
    state: 'Maharashtra',
    population: '7M+',
    safetyContext:
      "Pune's student population and working professionals make family safety a top priority.",
    localFeature:
      "Safe zone alerts for Pune's campuses, IT parks at Hinjewadi, and residential areas",
  },
  kolkata: {
    name: 'Kolkata',
    state: 'West Bengal',
    population: '15M+',
    safetyContext:
      "Kolkata's dense lanes and festivals make continuous family visibility important for residents.",
    localFeature:
      "Real-time tracking through Kolkata's trams, metro, and narrow north Kolkata streets",
  },
  ahmedabad: {
    name: 'Ahmedabad',
    state: 'Gujarat',
    population: '8M+',
    safetyContext:
      "Ahmedabad's growing urban sprawl and student migration make family location sharing vital.",
    localFeature:
      "Track family across Ahmedabad's BRTS corridors and new satellite townships",
  },
  jaipur: {
    name: 'Jaipur',
    state: 'Rajasthan',
    population: '4M+',
    safetyContext:
      "Jaipur families use KVL Track to keep track of children in tourist-heavy areas and during festivals.",
    localFeature:
      "Geofence around Jaipur's schools, Walled City, and new residential colonies",
  },
  surat: {
    name: 'Surat',
    state: 'Gujarat',
    population: '7M+',
    safetyContext:
      "Surat's diamond industry workers and textile traders have families spread across the growing city.",
    localFeature: "Route tracking for Surat's rapid expansion — from Adajan to Dumas",
  },
  lucknow: {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    population: '4M+',
    safetyContext:
      "Lucknow families prioritise child safety and elderly care tracking with KVL Track's India-first features.",
    localFeature: "Smart alerts for Lucknow's schools, Gomti Nagar, and Hazratganj area",
  },
  chandigarh: {
    name: 'Chandigarh',
    state: 'Punjab/Haryana',
    population: '1.2M+',
    safetyContext:
      "Chandigarh's planned sectors make KVL Track's geofencing especially effective for precise zone alerts.",
    localFeature:
      "Sector-by-sector geofencing in Chandigarh — the city built for smart safety zones",
  },
  bhopal: {
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    population: '2.5M+',
    safetyContext:
      "Bhopal families use KVL Track to stay connected across the lake city's spread-out neighbourhoods.",
    localFeature: "Family tracking across Bhopal's two zones — old city and new Bhopal",
  },
  nagpur: {
    name: 'Nagpur',
    state: 'Maharashtra',
    population: '3M+',
    safetyContext:
      "Nagpur, India's geographic center, is a growing tech hub where families rely on smart safety tools.",
    localFeature: "Driving safety and family tracking across Nagpur's expanding ring roads",
  },
  indore: {
    name: 'Indore',
    state: 'Madhya Pradesh',
    population: '3.5M+',
    safetyContext:
      "Indore's boom as India's cleanest city has brought growth — and new family safety needs.",
    localFeature:
      "Live tracking for students in Indore's education hub and working families across IDA areas",
  },
}

// ─── generateStaticParams ─────────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }))
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { city: string }
}): Promise<Metadata> {
  const city = CITIES[params.city]
  if (!city) return { title: 'Not Found' }

  return {
    title: `Family Safety App in ${city.name} | GPS Tracker — KVL Track`,
    description: `KVL Track keeps ${city.name} families safe with real-time GPS tracking, SOS alerts, and smart geofencing. 50,000+ Indian families trust KVL Track. Free to download.`,
    keywords: [
      `family safety app ${city.name.toLowerCase()}`,
      `GPS tracker ${city.name.toLowerCase()}`,
      `child tracking app ${city.name.toLowerCase()}`,
      `family location sharing ${city.name.toLowerCase()}`,
    ],
    openGraph: {
      title: `Family Safety App in ${city.name} — KVL Track`,
      description: `Join families in ${city.name}, ${city.state} staying safe with KVL Track's real-time GPS tracking, SOS alerts, and smart geofencing.`,
      url: `https://gravity.kvlbusinesssolutions.com/locations/${params.city}`,
      siteName: 'KVL Track by KVL Business Solutions',
      images: [
        {
          url: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
          width: 1200,
          height: 630,
          alt: `KVL Track Family Safety App ${city.name}`,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `KVL Track Family Safety App — ${city.name}`,
      description: `GPS tracking & SOS alerts for ${city.name} families.`,
      images: ['https://gravity.kvlbusinesssolutions.com/og-image.svg'],
    },
    alternates: {
      canonical: `https://gravity.kvlbusinesssolutions.com/locations/${params.city}`,
    },
  }
}

// ─── JSON-LD helpers ──────────────────────────────────────────────────────────

function buildLocalBusinessSchema(city: CityData, citySlug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `KVL Track by KVL Business Solutions — ${city.name}`,
    description: `Family safety app serving ${city.name}, ${city.state}. Real-time GPS tracking, SOS alerts, and smart geofencing for ${city.population} residents.`,
    url: `https://gravity.kvlbusinesssolutions.com/locations/${citySlug}`,
    logo: 'https://gravity.kvlbusinesssolutions.com/logo.svg',
    image: 'https://gravity.kvlbusinesssolutions.com/og-image.svg',
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'State',
        name: city.state,
        containedInPlace: { '@type': 'Country', name: 'India' },
      },
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'KVL Business Solutions Technologies Pvt Ltd',
      url: 'https://gravity.kvlbusinesssolutions.com',
    },
  }
}

function buildBreadcrumbSchema(city: CityData, citySlug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gravity.kvlbusinesssolutions.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Locations',
        item: 'https://gravity.kvlbusinesssolutions.com/locations',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: `https://gravity.kvlbusinesssolutions.com/locations/${citySlug}`,
      },
    ],
  }
}

// ─── Feature card data ────────────────────────────────────────────────────────

function getFeatureCards(city: CityData) {
  return [
    {
      icon: '📍',
      title: 'Live Location Sharing',
      description: `See every family member's exact position on the map in real time — updated every 10 seconds. Works seamlessly across ${city.name}'s diverse neighbourhoods, from busy commercial zones to quiet residential areas.`,
    },
    {
      icon: '🆘',
      title: 'One-Tap SOS Emergency',
      description: `When seconds matter, KVL Track's SOS sends an immediate alert with live GPS coordinates to all family members and emergency contacts. Designed for ${city.name}'s fast-paced environment where help needs to arrive fast.`,
    },
    {
      icon: '🔔',
      title: 'Smart Geofencing',
      description: `Draw custom safe zones around your home, school, office, or any landmark — and get instant notifications when family members arrive or leave. ${city.localFeature}.`,
    },
    {
      icon: '🤖',
      title: 'AI Safety Insights',
      description: `KVL Track's AI analyses movement patterns, driving behaviour, and location history to surface personalised safety insights for your family in ${city.name}, ${city.state}.`,
    },
  ]
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function getTestimonials(city: CityData) {
  return [
    {
      quote: `Since moving to ${city.name} for work, KVL Track has been the one app my wife and I both agreed we can't live without. Knowing the kids are home from school without having to call — priceless.`,
      name: 'Ramesh P.',
      role: `Working parent, ${city.name}`,
      rating: 5,
    },
    {
      quote: `My elderly mother lives alone in ${city.name}. KVL Track's geofencing alerts me the moment she steps out — and the SOS button gives her independence without us worrying all day.`,
      name: 'Priya S.',
      role: `Daughter & caregiver, ${city.state}`,
      rating: 5,
    },
    {
      quote: `The driving safety scores changed how I drive in ${city.name}'s traffic. My family can see my trip history and I've genuinely become a safer driver.`,
      name: 'Arjun M.',
      role: `Daily commuter, ${city.name}`,
      rating: 5,
    },
  ]
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CityPage({ params }: { params: { city: string } }) {
  const city = CITIES[params.city]

  if (!city) {
    return (
      <main style={{ background: '#0B0D13' }} className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-4xl font-bold text-white mb-4">City Not Found</h1>
          <p className="text-gray-400 mb-8">
            We don&apos;t have a dedicated page for this city yet, but KVL Track works
            across India.
          </p>
          <Link
            href="/locations"
            className="px-6 py-3 rounded-full text-[#0B0D13] font-semibold bg-[#D4A853] hover:bg-[#e0b86a] transition-colors"
          >
            View All Cities
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const featureCards = getFeatureCards(city)
  const testimonials = getTestimonials(city)

  return (
    <main style={{ background: '#0B0D13' }} className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <JsonLd data={buildLocalBusinessSchema(city, params.city)} />
      <JsonLd data={buildBreadcrumbSchema(city, params.city)} />

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
          <li>
            <Link
              href="/locations"
              className="hover:text-[#D4A853] transition-colors"
            >
              Locations
            </Link>
          </li>
          <li className="text-gray-600">/</li>
          <li className="text-[#D4A853] font-medium">{city.name}</li>
        </ol>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,168,83,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Location badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4A853]/30 bg-[#D4A853]/10 text-[#D4A853] text-sm font-medium mb-6">
            <span>📍</span>
            <span>
              {city.name}, {city.state}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Family Safety App{' '}
            <span className="text-[#D4A853]">in {city.name}</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-4 leading-relaxed">
            {city.safetyContext}
          </p>
          <p className="text-base text-gray-400 max-w-2xl mx-auto mb-10">
            Join thousands of {city.name} families using KVL Track for real-time GPS
            tracking, one-tap SOS, and smart geofencing — all in one app, free to
            download.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#D4A853] text-[#0B0D13] font-bold text-base hover:bg-[#e0b86a] transition-all duration-200 shadow-lg shadow-[#D4A853]/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76a2 2 0 0 0 2.18-.22l12.54-7.24-2.9-2.9L3.18 23.76zm16.53-9.54L16.84 12l2.87-2.22L6.99.47a2 2 0 0 0-2.18-.23L14.9 10.1l-2.72 2.72L16.1 16.6 3.18.23l-.01.01C2.45.61 2 1.35 2 2.2v19.6c0 .85.45 1.59 1.18 1.97l13.53-9.55z" />
              </svg>
              Download Free on Android
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-full border border-[#D4A853]/50 text-[#D4A853] font-semibold text-base hover:bg-[#D4A853]/10 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Download Free on iOS
            </a>
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-base hover:border-white/40 hover:bg-white/5 transition-all duration-200"
            >
              See Plans →
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ──────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-[#111420] py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              {
                value: '50,000+',
                label: 'Families Protected',
                sub: 'across India',
              },
              { value: '4.8★', label: 'App Rating', sub: '10,000+ reviews' },
              { value: '30+', label: 'Cities Covered', sub: 'and growing' },
              { value: '99.9%', label: 'Uptime', sub: 'always reliable' },
              {
                value: city.population,
                label: `${city.name} Residents`,
                sub: `we serve ${city.name}`,
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-3xl md:text-4xl font-extrabold text-[#D4A853]">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-white">{stat.label}</span>
                <span className="text-xs text-gray-500">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ───────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Built for {city.name} Families
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
              Every feature in KVL Track is designed for Indian conditions — low
              bandwidth, diverse commute patterns, multigenerational households, and
              the unique safety landscape of cities like {city.name}.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="bg-[#111420] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:border-[#D4A853]/30 transition-colors duration-200"
              >
                <div className="text-3xl">{card.icon}</div>
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITY-SPECIFIC SECTION ──────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-[#111420]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A853]/15 text-[#D4A853] text-sm font-medium mb-5">
                <span>🏙️</span>
                <span>Made for {city.name}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
                Why {city.name} Families Choose KVL Track
              </h2>
              <p className="text-gray-300 text-base leading-relaxed mb-6">
                {city.safetyContext}
              </p>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                {city.localFeature}. Whether you&apos;re tracking your child&apos;s
                school commute, ensuring an elderly parent&apos;s daily walk, or
                simply staying connected with your spouse on a late shift, KVL Track
                works quietly in the background — notifying you only when it
                matters.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  `Works on 2G/3G/4G networks across ${city.name}`,
                  'Hindi, English & regional language support',
                  'Battery-optimised — less than 2% drain per day',
                  'No subscription needed to get started',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="text-[#D4A853] mt-0.5 shrink-0">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature highlight card */}
            <div className="bg-[#0B0D13] border border-[#D4A853]/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D4A853]/15 flex items-center justify-center text-lg">
                  🗺️
                </div>
                <h3 className="text-white font-bold text-lg">
                  {city.name} Local Feature
                </h3>
              </div>
              <p className="text-gray-300 text-base leading-relaxed mb-6">
                {city.localFeature}
              </p>
              <div className="border-t border-white/5 pt-6">
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                  Popular Use Cases in {city.name}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🎒', label: 'School Tracking' },
                    { icon: '👴', label: 'Elderly Care' },
                    { icon: '🚗', label: 'Driving Safety' },
                    { icon: '🏠', label: 'Home Geofence' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 bg-[#111420] rounded-lg px-3 py-2"
                    >
                      <span>{item.icon}</span>
                      <span className="text-gray-400 text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Get Your {city.name} Family Protected in 3 Steps
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base">
              No complex setup. No hardware needed. KVL Track works on any Android or
              iPhone already in your family&apos;s hands.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Download & Sign Up',
                description:
                  'Install KVL Track free from Google Play or the App Store. Create a family account with your phone number — takes under 2 minutes.',
              },
              {
                step: '02',
                title: 'Invite Family Members',
                description:
                  'Send a simple invite link to your spouse, parents, or children. Each person installs the app and joins your family circle.',
              },
              {
                step: '03',
                title: 'Set Your Safe Zones',
                description: `Draw geofences around your home, your children's school, or any important location in ${city.name}. KVL Track handles the rest.`,
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-[#111420] border border-white/5 rounded-2xl p-8">
                <div className="text-5xl font-extrabold text-[#D4A853]/15 mb-4 leading-none">
                  {item.step}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / TESTIMONIALS ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-[#111420]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              {city.name} Families Love KVL Track
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base">
              Join thousands of families in {city.name}, {city.state} who sleep
              better knowing KVL Track is watching over the people they love.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-[#0B0D13] border border-white/5 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-[#D4A853] text-base">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto">
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON / WHY NOT ALTERNATIVES ─────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Why KVL Track over WhatsApp Location Sharing?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base">
              WhatsApp live location expires. KVL Track doesn&apos;t — and it does
              much more.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#111420]">
                  <th className="text-left text-gray-400 font-semibold px-6 py-4">
                    Feature
                  </th>
                  <th className="text-center text-[#D4A853] font-bold px-6 py-4">
                    KVL Track
                  </th>
                  <th className="text-center text-gray-500 font-semibold px-6 py-4">
                    WhatsApp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['Always-on location', true, false],
                  ['SOS emergency alert', true, false],
                  ['Custom geofence zones', true, false],
                  ['Location history & timeline', true, false],
                  ['Driving safety scores', true, false],
                  ['Elderly care alerts', true, false],
                  ['Works without internet (SMS fallback)', true, false],
                  ['Free to start', true, true],
                ].map(([feature, gravity, whatsapp]) => (
                  <tr key={String(feature)} className="bg-[#0B0D13] hover:bg-[#111420] transition-colors">
                    <td className="text-gray-300 px-6 py-3">{feature}</td>
                    <td className="text-center px-6 py-3">
                      <span className="text-[#D4A853]">{gravity ? '✓' : '✗'}</span>
                    </td>
                    <td className="text-center px-6 py-3">
                      <span className="text-gray-500">{whatsapp ? '✓' : '✗'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-[#111420]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-12">
            Frequently Asked Questions — {city.name}
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                q: `Does KVL Track work across all areas of ${city.name}?`,
                a: `Yes. KVL Track works wherever there is cellular network coverage. ${city.name}'s network density means KVL Track functions reliably across the city, including in areas with older 3G infrastructure.`,
              },
              {
                q: 'Is location tracking always-on? Can family members opt out?',
                a: "Each family member has full control over their own location sharing. They can pause sharing at any time from the app. KVL Track is built on consent — every member must accept an invitation and can leave a family circle at any moment.",
              },
              {
                q: 'How much battery does KVL Track use?',
                a: "KVL Track is engineered to use less than 2% battery per day on most Android and iOS devices. Our adaptive tracking algorithm reduces GPS polling when the device is stationary, extending battery life significantly.",
              },
              {
                q: `Is my family's location data stored securely?`,
                a: 'All location data is encrypted end-to-end and stored on servers within India, in compliance with Indian data protection standards. We never sell data to third parties. Your family data is yours alone.',
              },
              {
                q: 'What is the cost? Is there a free plan?',
                a: `KVL Track offers a free plan that covers core location sharing and SOS for up to 4 family members — ideal for most ${city.name} households. Premium plans unlock driving safety, unlimited history, and advanced geofencing. See our pricing page for details.`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#0B0D13] border border-white/5 rounded-xl p-6"
              >
                <h3 className="text-white font-semibold text-base mb-3">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
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
            Keep Your {city.name} Family{' '}
            <span className="text-[#D4A853]">Safe, Always</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Download KVL Track free today. No credit card, no hardware, no complexity
            — just the peace of mind every {city.name} family deserves.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#D4A853] text-[#0B0D13] font-bold text-base hover:bg-[#e0b86a] transition-all duration-200 shadow-lg shadow-[#D4A853]/20 w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76a2 2 0 0 0 2.18-.22l12.54-7.24-2.9-2.9L3.18 23.76zm16.53-9.54L16.84 12l2.87-2.22L6.99.47a2 2 0 0 0-2.18-.23L14.9 10.1l-2.72 2.72L16.1 16.6 3.18.23l-.01.01C2.45.61 2 1.35 2 2.2v19.6c0 .85.45 1.59 1.18 1.97l13.53-9.55z" />
              </svg>
              Google Play — Free
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-full border border-[#D4A853]/50 text-[#D4A853] font-semibold text-base hover:bg-[#D4A853]/10 transition-all duration-200 w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store — Free
            </a>
          </div>

          <p className="text-gray-600 text-xs">
            Available for Android 6.0+ and iOS 13+. Location data stored in India.
          </p>
        </div>
      </section>

      {/* ── NEARBY CITIES ──────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-400 mb-5 text-center">
            KVL Track is available across India — explore other cities
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(CITIES)
              .filter(([slug]) => slug !== params.city)
              .map(([slug, c]) => (
                <Link
                  key={slug}
                  href={`/locations/${slug}`}
                  className="px-4 py-2 rounded-full border border-white/10 text-gray-400 text-sm hover:border-[#D4A853]/40 hover:text-[#D4A853] transition-colors"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
