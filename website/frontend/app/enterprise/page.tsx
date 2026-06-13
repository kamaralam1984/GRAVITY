'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ─────────────────────────────────────────────────────────────
   Animation helpers
───────────────────────────────────────────────────────────── */
function fadeUp(delay = 0, duration = 0.7) {
  return {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay,
    },
  }
}

function useSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const TRUST_STATS = [
  { value: '5,600+', label: 'Enterprise Clients' },
  { value: '127', label: 'Countries' },
  { value: '99.9%', label: 'SLA Uptime' },
  { value: '24/7', label: 'Priority Support' },
]

const TARGET_MARKETS = [
  {
    icon: '🎓',
    title: 'Schools & Universities',
    desc: 'Student safety at scale — bus tracking, campus geofencing, parent notifications, and emergency evacuation coordination.',
    color: '#4B80F0',
    rgb: '75,128,240',
  },
  {
    icon: '🤝',
    title: 'NGOs & Nonprofits',
    desc: 'Field worker safety in remote or high-risk areas. Satellite fallback, multi-country deployment, and offline SOS.',
    color: '#10B981',
    rgb: '16,185,129',
  },
  {
    icon: '🏥',
    title: 'Hospitals & Clinics',
    desc: 'HIPAA-ready staff and patient family safety. Asset tracking, emergency response, and shift-based monitoring.',
    color: '#EF4444',
    rgb: '239,68,68',
  },
  {
    icon: '🏢',
    title: 'Corporate Companies',
    desc: 'Duty of care for every employee — business travel safety, remote worker monitoring, and crisis management.',
    color: '#8B5CF6',
    rgb: '139,92,246',
  },
  {
    icon: '🛡️',
    title: 'Security Agencies',
    desc: 'Real-time team coordination, incident management, and full API integration for security operations centers.',
    color: '#64748B',
    rgb: '100,116,139',
  },
  {
    icon: '🏛️',
    title: 'Government Institutions',
    desc: 'Sovereign data hosting, on-premise deployment options, and compliance with national security standards.',
    color: '#D4A853',
    rgb: '212,168,83',
  },
]

const KEY_FEATURES = [
  {
    icon: '🏗️',
    title: 'Multi-Tenant Architecture',
    desc: 'Manage hundreds of organizations from a single control plane. Fully isolated data per tenant.',
    color: '#4B80F0',
    rgb: '75,128,240',
  },
  {
    icon: '🎨',
    title: 'White Label System',
    desc: 'Custom branding, domain, colors, app name, and splash screen. Your identity, our engine.',
    color: '#D4A853',
    rgb: '212,168,83',
  },
  {
    icon: '🔑',
    title: 'SSO Integration',
    desc: 'SAML 2.0, LDAP, Active Directory, and OAuth 2.0 out of the box — no custom dev required.',
    color: '#10B981',
    rgb: '16,185,129',
  },
  {
    icon: '👥',
    title: 'Role-Based Access Control',
    desc: '8 granular permission levels from Super Admin to Read-Only. Fine-grained data access policies.',
    color: '#8B5CF6',
    rgb: '139,92,246',
  },
  {
    icon: '📋',
    title: 'Audit Logs',
    desc: 'Complete immutable activity trail. Who accessed what, when, from where. 365-day retention.',
    color: '#F59E0B',
    rgb: '245,158,11',
  },
  {
    icon: '✅',
    title: 'Compliance Dashboard',
    desc: 'Live GDPR / ISO 27001 / SOC 2 status board. Automated compliance scoring and gap reports.',
    color: '#EF4444',
    rgb: '239,68,68',
  },
  {
    icon: '⚡',
    title: 'SLA Monitoring',
    desc: '99.9% uptime guarantee with financial penalties for breach. Real-time status at status.gravity.app.',
    color: '#06B6D4',
    rgb: '6,182,212',
  },
  {
    icon: '📊',
    title: 'Advanced Reporting',
    desc: 'Custom report builder with scheduled delivery. Export to PDF, CSV, or push to BI tools via API.',
    color: '#64748B',
    rgb: '100,116,139',
  },
]

const WHITE_LABEL_MOCKUPS = [
  {
    title: 'Custom Logo & Identity',
    desc: 'Upload your org logo, icon, and splash screen. App Store listing under your brand name.',
    icon: '🖼️',
    preview: null,
  },
  {
    title: 'Custom Colors & Theme',
    desc: 'Full CSS variable system — primary, accent, surface, and text colors all configurable.',
    icon: '🎨',
    preview: null,
  },
  {
    title: 'Custom Domain & URL',
    desc: 'Serve the dashboard from your own subdomain with SSL.',
    icon: '🌐',
    urlPreview: 'gravity.yourschool.edu',
    preview: null,
  },
]

const WHITE_LABEL_AVAILABLE = [
  'Custom app name',
  'App icon & splash screen',
  'Brand color palette',
  'Custom email templates',
  'Branded PDF reports',
  'White-labeled App Store listing',
  'Custom onboarding flow',
  'Domain & SSL certificate',
]

const API_INTEGRATIONS = [
  {
    name: 'School Management System',
    desc: 'Sync student rosters, class schedules, and bus routes from your existing SIS.',
    icon: '🎓',
    color: '#4B80F0',
  },
  {
    name: 'HR Platform',
    desc: 'Auto-provision and deprovision employees from Workday, BambooHR, or SAP.',
    icon: '👔',
    color: '#8B5CF6',
  },
  {
    name: 'Hospital System',
    desc: 'Integrate with Epic, Cerner, or any FHIR-compliant EHR for staff safety data.',
    icon: '🏥',
    color: '#EF4444',
  },
  {
    name: 'Security Dashboard',
    desc: 'Push incidents to SIEM platforms — Splunk, Datadog, PagerDuty, and more.',
    icon: '🛡️',
    color: '#D4A853',
  },
]

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '₹25,000',
    period: '/month',
    users: 'Up to 500 users',
    highlight: false,
    features: [
      'Core safety platform',
      'Up to 5 admin seats',
      'Standard mobile app',
      'Email & chat support',
      'Basic reporting',
      '99.9% SLA',
      'GDPR compliant',
    ],
    cta: 'Request Demo',
    color: '#4B80F0',
    rgb: '75,128,240',
  },
  {
    name: 'Business',
    price: '₹75,000',
    period: '/month',
    users: 'Up to 5,000 users',
    highlight: true,
    features: [
      'Everything in Starter',
      'White label branding',
      'SSO (SAML 2.0 / LDAP)',
      'Role-based access control',
      'Audit logs (365 days)',
      'API access + webhooks',
      'Dedicated CSM',
      'Custom report builder',
      'Priority support (1h SLA)',
    ],
    cta: 'Most Popular — Request Demo',
    color: '#D4A853',
    rgb: '212,168,83',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    users: 'Unlimited users',
    highlight: false,
    features: [
      'Everything in Business',
      'Multi-tenant management',
      'On-premise deployment',
      'Custom integrations',
      'Dedicated infrastructure',
      '99.95% SLA',
      'SOC 2 Type II report',
      'HIPAA / ISO 27001',
      '24/7 phone support',
      'Quarterly pen testing',
    ],
    cta: 'Contact Enterprise Sales',
    color: '#10B981',
    rgb: '16,185,129',
  },
]

const TRUST_BADGES = [
  { label: 'ISO 27001', icon: '📋', sub: 'Certified' },
  { label: 'SOC 2 Type II', icon: '🛡️', sub: 'Compliant' },
  { label: 'GDPR', icon: '🇪🇺', sub: 'Compliant' },
  { label: '99.9% SLA', icon: '⚡', sub: 'Guaranteed' },
]

const ENTERPRISE_LOGOS = [
  { name: 'DPS Schools', abbr: 'DPS', flag: '🇮🇳' },
  { name: 'Gulf Petrol Corp', abbr: 'GPC', flag: '🇦🇪' },
  { name: 'MSF Field Ops', abbr: 'MSF', flag: '🌍' },
  { name: 'CitiSecure', abbr: 'CSC', flag: '🇸🇬' },
  { name: 'MedCare Group', abbr: 'MCG', flag: '🇬🇧' },
  { name: 'SafeGov', abbr: 'SGV', flag: '🇮🇳' },
]

const FAQ_ITEMS = [
  {
    q: 'What is the minimum contract size?',
    a: 'Enterprise plans start at 100 users with annual contracts. We also offer 30-day pilot programs for organizations that want to validate Gravity before committing.',
  },
  {
    q: 'Can we white-label the app?',
    a: 'Yes, full white-labeling including custom domain, App Store listings under your brand, custom UI themes, and branded onboarding flow. Our design team assists with brand alignment at no extra cost.',
  },
  {
    q: 'Is Gravity GDPR compliant?',
    a: 'Yes. We offer Data Processing Agreements (DPAs), right to erasure, data portability, and EU-based data hosting options. Our DPO is available for compliance discussions.',
  },
  {
    q: 'How long does implementation take?',
    a: 'Standard enterprise deployment takes 5–10 business days. White-label deployment including custom App Store listing takes 4–6 weeks. Our CSM guides every step.',
  },
  {
    q: 'Do you offer an SLA?',
    a: 'Enterprise clients receive a 99.9% uptime SLA with financial penalties for breaches. Mission-critical deployments can negotiate 99.95% with dedicated infrastructure.',
  },
  {
    q: 'What SSO protocols are supported?',
    a: 'We support SAML 2.0, OAuth 2.0, OpenID Connect, LDAP, and Active Directory. Custom IdP configurations are available for Business and Enterprise tiers.',
  },
]

/* ─────────────────────────────────────────────────────────────
   FLOATING BUILDING ICONS
───────────────────────────────────────────────────────────── */
function FloatingBuildings() {
  const buildings = [
    { icon: '🏢', x: 8, y: 20, size: 32, delay: 0 },
    { icon: '🏛️', x: 85, y: 15, size: 28, delay: 0.4 },
    { icon: '🏥', x: 5, y: 65, size: 26, delay: 0.8 },
    { icon: '🎓', x: 90, y: 60, size: 30, delay: 0.2 },
    { icon: '🏗️', x: 15, y: 80, size: 22, delay: 1.0 },
    { icon: '🛡️', x: 82, y: 82, size: 24, delay: 0.6 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {buildings.map((b, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{ left: `${b.x}%`, top: `${b.y}%`, fontSize: b.size, opacity: 0.12 }}
          animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
          transition={{
            duration: 5 + i * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: b.delay,
          }}
        >
          {b.icon}
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />
      {/* Radial glow top */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          width: '1100px',
          height: '650px',
          background:
            'radial-gradient(ellipse, rgba(75,128,240,0.16) 0%, rgba(212,168,83,0.07) 50%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      {/* Radial glow bottom */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '320px',
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <FloatingBuildings />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{
              color: '#4B80F0',
              border: '1px solid rgba(75,128,240,0.4)',
              background: 'rgba(75,128,240,0.08)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4B80F0' }} />
            GRAVITY ENTERPRISE
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.04] tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
        >
          Safety Intelligence{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #D4A853, #F5C842)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            for Organizations
          </span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 max-w-2xl mx-auto text-xl leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)' }}
        >
          Deploy Gravity across your entire organization — schools, hospitals, NGOs, or corporations.
          Multi-tenant architecture, white-label ready, SOC 2 certified, and 99.9% SLA guaranteed.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.3)} className="flex flex-wrap justify-center gap-4 mt-10">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #F5C842)',
              color: '#1A0F05',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 24px rgba(212,168,83,0.35)',
            }}
          >
            Book Enterprise Demo <span>→</span>
          </a>
          <a
            href="#brochure"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(12px)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Download Enterprise Brochure <span style={{ fontSize: '12px' }}>↓</span>
          </a>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          {...fadeUp(0.45)}
          className="flex flex-wrap justify-center gap-x-10 gap-y-6 mt-14"
        >
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span
                className="text-3xl font-extrabold"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: 'linear-gradient(90deg, #D4A853, #F5C842)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Trust badges row */}
        <motion.div
          {...fadeUp(0.55)}
          className="flex flex-wrap justify-center gap-3 mt-10"
        >
          {TRUST_BADGES.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   TARGET MARKETS — 6 cards with Request Demo button
───────────────────────────────────────────────────────────── */
function TargetMarketsSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#4B80F0', border: '1px solid rgba(75,128,240,0.35)', background: 'rgba(75,128,240,0.07)' }}
          >
            Who Is It For
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Built for Every Organization
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            From a single school campus to a global corporation — Gravity Enterprise adapts to your structure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TARGET_MARKETS.map((market, i) => (
            <motion.div
              key={market.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 + i * 0.09 }}
              className="rounded-2xl p-7 flex flex-col gap-5 group cursor-pointer"
              style={{
                background: 'var(--bg-surface2)',
                border: `1px solid rgba(${market.rgb},0.15)`,
                borderTop: `3px solid ${market.color}`,
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
              }}
              whileHover={{ scale: 1.015, boxShadow: `0 8px 40px rgba(${market.rgb},0.15)` }}
            >
              {/* Icon + title */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `rgba(${market.rgb},0.1)` }}
                >
                  {market.icon}
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
                >
                  {market.title}
                </h3>
              </div>

              {/* Description */}
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {market.desc}
              </p>

              {/* Request Demo button */}
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: `rgba(${market.rgb},0.12)`,
                  border: `1.5px solid rgba(${market.rgb},0.35)`,
                  color: market.color,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Request Demo →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   KEY FEATURES — 8 glassmorphism cards
───────────────────────────────────────────────────────────── */
function KeyFeaturesSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: 'var(--gold)', border: '1px solid rgba(212,168,83,0.35)', background: 'rgba(212,168,83,0.07)' }}
          >
            Platform Capabilities
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Everything You Need,{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #D4A853, #F5C842)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Nothing You Don&apos;t
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Eight core platform pillars that enterprise organizations demand — all included.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KEY_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.04 + i * 0.07 }}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(16px)',
                border: `1px solid rgba(${feat.rgb},0.18)`,
                borderTop: `3px solid ${feat.color}`,
                boxShadow: `0 4px 24px rgba(${feat.rgb},0.08)`,
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 8px 40px rgba(${feat.rgb},0.18)` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `rgba(${feat.rgb},0.1)` }}
              >
                {feat.icon}
              </div>
              <h3
                className="text-base font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {feat.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {feat.desc}
              </p>
              <div
                className="mt-auto text-xs font-bold"
                style={{ color: feat.color }}
              >
                Included ✓
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   WHITE LABEL SECTION
───────────────────────────────────────────────────────────── */
function WhiteLabelSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#D4A853', border: '1px solid rgba(212,168,83,0.35)', background: 'rgba(212,168,83,0.07)' }}
          >
            White Label
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Your Brand.{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #D4A853, #F5C842)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Our Technology.
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Deliver a fully branded safety experience — your logo, your colors, your domain. Powered by Gravity under the hood.
          </p>
        </motion.div>

        {/* 3 mockup cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {WHITE_LABEL_MOCKUPS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.1 }}
              className="rounded-2xl p-8 flex flex-col gap-5"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212,168,83,0.2)',
                boxShadow: '0 4px 30px rgba(212,168,83,0.08)',
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(212,168,83,0.1)' }}
              >
                {card.icon}
              </div>
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {card.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {card.desc}
              </p>
              {card.urlPreview && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono"
                  style={{
                    background: 'rgba(212,168,83,0.06)',
                    border: '1px solid rgba(212,168,83,0.25)',
                    color: '#D4A853',
                  }}
                >
                  <span style={{ color: '#10B981', fontSize: '10px' }}>●</span>
                  https://{card.urlPreview}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Available items */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-2xl p-8"
          style={{
            background: 'var(--bg-surface2)',
            border: '1px solid rgba(212,168,83,0.2)',
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-6"
            style={{ color: '#D4A853', fontFamily: "'Inter', sans-serif" }}
          >
            What You Can Customize
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {WHITE_LABEL_AVAILABLE.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span style={{ color: '#D4A853', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   API MARKETPLACE
───────────────────────────────────────────────────────────── */
function ApiMarketplaceSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#10B981', border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.07)' }}
          >
            Developer Platform
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Gravity{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              API Marketplace
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Connect Gravity to your existing tech stack. 50+ integrations available out of the box.
          </p>
        </motion.div>

        {/* API types row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { label: 'REST API', sub: 'Full CRUD access', icon: '⚡' },
            { label: 'WebSocket API', sub: 'Real-time streams', icon: '🔄' },
            { label: 'Webhook Events', sub: 'Push notifications', icon: '🔔' },
            { label: '50+ Integrations', sub: 'Pre-built connectors', icon: '🔌' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.12 + i * 0.07 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl"
              style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <div>
                <div
                  className="text-sm font-bold"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.label}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                >
                  {item.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 4 popular use-case cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {API_INTEGRATIONS.map((int, i) => (
            <motion.div
              key={int.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 + i * 0.09 }}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${int.color}`,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `rgba(${int.color === '#4B80F0' ? '75,128,240' : int.color === '#8B5CF6' ? '139,92,246' : int.color === '#EF4444' ? '239,68,68' : '212,168,83'},0.1)` }}
              >
                {int.icon}
              </div>
              <h3
                className="text-sm font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {int.name}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {int.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Swagger docs CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/api-docs"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1.5px solid rgba(16,185,129,0.35)',
              color: '#10B981',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            View Swagger API Docs →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   PRICING — 3 enterprise tiers
───────────────────────────────────────────────────────────── */
function PricingSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: '#D4A853', border: '1px solid rgba(212,168,83,0.35)', background: 'rgba(212,168,83,0.07)' }}
          >
            Enterprise Pricing
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Transparent. Scalable. Fair.
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Annual contracts. All plans include onboarding, training, and priority support.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.12 }}
              className="rounded-2xl p-8 flex flex-col gap-6 relative"
              style={{
                background: tier.highlight
                  ? 'linear-gradient(145deg, rgba(212,168,83,0.08) 0%, rgba(245,200,66,0.04) 100%)'
                  : 'var(--bg-surface2)',
                border: tier.highlight
                  ? '2px solid rgba(212,168,83,0.5)'
                  : `1px solid rgba(${tier.rgb},0.2)`,
                boxShadow: tier.highlight ? '0 8px 48px rgba(212,168,83,0.15)' : 'none',
              }}
            >
              {/* Popular badge */}
              {tier.highlight && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{
                    background: 'linear-gradient(90deg, #D4A853, #F5C842)',
                    color: '#1A0F05',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Tier header */}
              <div>
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: tier.color }}
                >
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-extrabold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                >
                  {tier.users}
                </p>
              </div>

              {/* Feature list */}
              <ul className="flex flex-col gap-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span style={{ color: tier.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 mt-auto"
                style={
                  tier.highlight
                    ? {
                        background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                        color: '#1A0F05',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        boxShadow: '0 4px 20px rgba(212,168,83,0.35)',
                      }
                    : {
                        background: `rgba(${tier.rgb},0.1)`,
                        border: `1.5px solid rgba(${tier.rgb},0.35)`,
                        color: tier.color,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }
                }
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   ENTERPRISE CUSTOMER LOGOS
───────────────────────────────────────────────────────────── */
function LogosSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-16" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center text-xs font-bold uppercase tracking-widest mb-8"
          style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
        >
          Trusted by Enterprise Organizations Worldwide
        </motion.p>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {ENTERPRISE_LOGOS.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.07 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="text-lg">{logo.flag}</span>
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-secondary)' }}
              >
                {logo.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   TRUST INDICATORS BAR
───────────────────────────────────────────────────────────── */
function TrustBar() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-14" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-5">
          {[
            { badge: 'ISO 27001', icon: '📋', desc: 'Information Security Certified' },
            { badge: 'SOC 2 Type II', icon: '🛡️', desc: 'Security Controls Audited' },
            { badge: 'GDPR', icon: '🇪🇺', desc: 'EU Data Privacy Compliant' },
            { badge: '99.9% SLA', icon: '⚡', desc: 'Uptime Guaranteed' },
          ].map((item, i) => (
            <motion.div
              key={item.badge}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.08 }}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl"
              style={{
                background: 'var(--bg-surface2)',
                border: '1px solid var(--border-strong)',
                minWidth: '200px',
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div
                  className="font-bold text-sm"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
                >
                  {item.badge}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                >
                  {item.desc}
                </div>
              </div>
              <span style={{ color: '#10B981', fontWeight: 700, marginLeft: 'auto' }}>✓</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────────────────────── */
function ContactSection() {
  const { ref, inView } = useSection()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" ref={ref} className="py-24" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-14 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ color: '#D4A853', border: '1px solid rgba(212,168,83,0.35)', background: 'rgba(212,168,83,0.07)' }}
            >
              Get In Touch
            </span>
            <h2
              className="text-4xl md:text-5xl font-extrabold leading-tight mb-5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
            >
              Talk to Enterprise Sales
            </h2>
            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
            >
              Whether you are exploring Gravity for the first time or ready to sign, our enterprise team
              will help you find the right solution within 2 hours.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { icon: '⚡', text: 'Response within 2 hours' },
                { icon: '💰', text: 'Custom pricing tailored to your scale' },
                { icon: '🚀', text: '30-day pilot program at no cost' },
                { icon: '🤝', text: 'Dedicated Customer Success Manager' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)' }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(212,168,83,0.22)',
              boxShadow: '0 0 50px rgba(212,168,83,0.08)',
            }}
          >
            {submitted ? (
              <div className="text-center py-14">
                <div className="text-5xl mb-4">🎉</div>
                <h3
                  className="text-2xl font-bold mb-3"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
                >
                  Request Received!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
                  Our enterprise team will contact you within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Smith' },
                    { label: 'Company', name: 'company', type: 'text', placeholder: 'Acme Corp' },
                  ].map((field) => (
                    <div key={field.name} className="flex flex-col gap-1.5">
                      <label
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                      >
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        required
                        className="rounded-xl px-4 py-3 text-sm outline-none"
                        style={{
                          background: 'var(--bg-surface2)',
                          border: '1px solid var(--border-strong)',
                          color: 'var(--text-primary)',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                    >
                      Your Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      placeholder="Head of Safety"
                      required
                      className="rounded-xl px-4 py-3 text-sm outline-none"
                      style={{
                        background: 'var(--bg-surface2)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-primary)',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                    >
                      Company Size
                    </label>
                    <select
                      name="size"
                      required
                      className="rounded-xl px-4 py-3 text-sm outline-none"
                      style={{
                        background: 'var(--bg-surface2)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-secondary)',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <option value="">Select size</option>
                      <option>100–500</option>
                      <option>500–2,000</option>
                      <option>2,000–10,000</option>
                      <option>10,000+</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Work Email', name: 'email', type: 'email', placeholder: 'you@company.com' },
                    { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
                  ].map((field) => (
                    <div key={field.name} className="flex flex-col gap-1.5">
                      <label
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                      >
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.name === 'email'}
                        className="rounded-xl px-4 py-3 text-sm outline-none"
                        style={{
                          background: 'var(--bg-surface2)',
                          border: '1px solid var(--border-strong)',
                          color: 'var(--text-primary)',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                  >
                    Safety Challenge
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Describe your organization's current safety challenges and what you want to achieve with Gravity..."
                    className="rounded-xl px-4 py-3 text-sm outline-none resize-none"
                    style={{
                      background: 'var(--bg-surface2)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-primary)',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-xl font-bold text-base"
                  style={{
                    background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                    color: '#1A0F05',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: '0 4px 24px rgba(212,168,83,0.35)',
                  }}
                >
                  Book Enterprise Demo →
                </motion.button>
                <p
                  className="text-xs text-center"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                >
                  By submitting you agree to our Privacy Policy. We never share your details.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   FAQ
───────────────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
      >
        <span
          className="font-semibold text-sm md:text-base pr-4"
          style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {q}
        </span>
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            border: open ? '1.5px solid var(--gold)' : '1px solid var(--border-strong)',
            background: open ? 'rgba(212,168,83,0.12)' : 'transparent',
            color: open ? 'var(--gold)' : 'var(--text-muted)',
            fontWeight: 700,
          }}
        >
          {open ? '−' : '+'}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p
              className="px-6 pb-5 pt-3 text-sm leading-relaxed"
              style={{
                borderTop: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FaqSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Enterprise FAQ
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
            Common questions from enterprise buyers.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col gap-3"
        >
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   BOTTOM CTA
───────────────────────────────────────────────────────────── */
function BottomCta() {
  const { ref, inView } = useSection()

  return (
    <section id="brochure" ref={ref} className="py-24" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(75,128,240,0.08) 0%, rgba(212,168,83,0.06) 100%)',
            border: '1px solid rgba(212,168,83,0.25)',
          }}
        >
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(212,168,83,0.12) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <h2
              className="text-4xl md:text-5xl font-extrabold mb-5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
            >
              Ready to Deploy?
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
            >
              Join 5,600+ organizations already using Gravity to keep their people safe.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                  color: '#1A0F05',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 4px 24px rgba(212,168,83,0.35)',
                }}
              >
                Book Enterprise Demo →
              </a>
              <a
                href="/gravity-enterprise-brochure.pdf"
                download
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Download Enterprise Brochure ↓
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function EnterprisePage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <TargetMarketsSection />
      <KeyFeaturesSection />
      <WhiteLabelSection />
      <ApiMarketplaceSection />
      <PricingSection />
      <TrustBar />
      <LogosSection />
      <ContactSection />
      <FaqSection />
      <BottomCta />
      <Footer />
    </main>
  )
}
