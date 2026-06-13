'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ─────────────── Animation helpers ─────────────── */
function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }
}

function useSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return { ref, inView }
}

/* ─────────────── DATA ─────────────── */
const TRUST_STATS = [
  { value: '5,600+', label: 'Enterprise Clients' },
  { value: '127', label: 'Countries' },
  { value: '99.9%', label: 'SLA Uptime' },
  { value: '24/7', label: 'Priority Support' },
]

const SEGMENTS = [
  {
    emoji: '🏫',
    title: 'Schools & Universities',
    subtitle: 'Student safety at scale',
    features: [
      'Student safety tracking',
      'Bus route management',
      'Parent notifications',
      'Emergency evacuation mode',
      'Admin dashboard',
    ],
    cta: 'School Edition Details',
    color: '#4B80F0',
    colorRgb: '75,128,240',
  },
  {
    emoji: '🏥',
    title: 'Hospitals & Healthcare',
    subtitle: 'HIPAA-ready patient & staff safety',
    features: [
      'Staff safety tracking',
      'Patient family alerts',
      'Asset tracking',
      'Emergency response',
      'HIPAA Ready',
    ],
    cta: 'Healthcare Solution',
    color: '#10B981',
    colorRgb: '16,185,129',
  },
  {
    emoji: '🤝',
    title: 'NGOs & Aid Organizations',
    subtitle: 'Field safety in any terrain',
    features: [
      'Field worker safety',
      'Remote area tracking',
      'Emergency evacuation',
      'Multi-country deployment',
    ],
    cta: 'NGO Package',
    color: '#F59E0B',
    colorRgb: '245,158,11',
  },
  {
    emoji: '🏢',
    title: 'Corporations & HR',
    subtitle: 'Duty of care for every employee',
    features: [
      'Business travel safety',
      'Remote worker monitoring',
      'Crisis management',
      'Executive protection',
    ],
    cta: 'Corporate Safety',
    color: '#8B5CF6',
    colorRgb: '139,92,246',
  },
  {
    emoji: '🛡️',
    title: 'Security & Law Enforcement',
    subtitle: 'Real-time team coordination',
    features: [
      'Team coordination',
      'Real-time tracking',
      'Incident management',
      'Full API integration',
    ],
    cta: 'Agency Solution',
    color: '#64748B',
    colorRgb: '100,116,139',
  },
]

const ENTERPRISE_FEATURES = [
  {
    icon: '🎨',
    title: 'White-Label Platform',
    description: 'Your brand, our technology',
    items: [
      'Custom domain & colors',
      'Branded mobile app',
      'Custom onboarding flow',
      'App store listing under your brand',
    ],
    color: '#D4A853',
  },
  {
    icon: '🏗️',
    title: 'Multi-Tenant Architecture',
    description: 'Built for organizational scale',
    items: [
      'Isolated data per organization',
      'Unlimited sub-organizations',
      'Role-based access control',
      'Custom permission sets',
    ],
    color: '#4B80F0',
  },
  {
    icon: '⚡',
    title: 'API Marketplace',
    description: 'Integrate with anything',
    items: [
      'Full REST API access',
      'WebSocket real-time events',
      'Webhook notifications',
      'SDK for iOS & Android',
    ],
    color: '#10B981',
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    description: 'Zero-trust by design',
    items: [
      'SSO (SAML 2.0, OAuth)',
      'Audit logs (90-day retention)',
      'SOC 2 Type II certified',
      'GDPR & HIPAA compliant',
    ],
    color: '#EF4444',
  },
]

const SUPPORT_PILLARS = [
  {
    icon: '⚡',
    title: '90-Minute Onboarding',
    description:
      'Dedicated Customer Success Manager walks your team through live training, custom configuration, and a go-live checklist. From contract to deployed in one session.',
    color: '#D4A853',
  },
  {
    icon: '💬',
    title: '24/7 Priority Support',
    description:
      'Dedicated Slack channel shared with our engineering team. Guaranteed response under 1 hour. Named account manager who knows your deployment inside out.',
    color: '#4B80F0',
  },
  {
    icon: '📊',
    title: 'Advanced Reporting',
    description:
      'Custom dashboards built to your KPIs. Scheduled automated reports delivered to your inbox. Full data export API for BI tools like Tableau and Power BI.',
    color: '#10B981',
  },
]

const COMPLIANCE_BADGES = [
  { label: 'SOC 2 Type II', icon: '🛡️' },
  { label: 'ISO 27001', icon: '📋' },
  { label: 'GDPR Certified', icon: '🇪🇺' },
  { label: 'HIPAA Ready', icon: '🏥' },
  { label: 'CCPA', icon: '🔏' },
  { label: 'ISO 9001', icon: '✅' },
]

const CASE_STUDIES = [
  {
    org: 'DPS Group of Schools, India',
    flag: '🇮🇳',
    challenge: 'Tracking 12,000 students across 8 campuses with no unified safety system.',
    stat1: { value: '94%', label: 'Reduction in late pickup incidents' },
    stat2: { value: '+67%', label: 'Parent satisfaction score' },
    color: '#4B80F0',
  },
  {
    org: 'Médecins Sans Frontières',
    flag: '🌍',
    challenge: 'Field worker safety across 5 active countries with limited connectivity.',
    stat1: { value: '0', label: 'Unresponsive workers in 2024' },
    stat2: { value: '-78%', label: 'Emergency response time' },
    color: '#EF4444',
  },
  {
    org: 'Gulf Petrol Corp, UAE',
    flag: '🇦🇪',
    challenge: '3,200 remote oil field workers requiring real-time evacuation coordination.',
    stat1: { value: '100%', label: 'Evacuation coverage rate' },
    stat2: { value: '$4.2M', label: 'Insurance savings in year one' },
    color: '#D4A853',
  },
]

const FAQ_ITEMS = [
  {
    q: 'What is the minimum contract size?',
    a: 'Enterprise plans start at 100 users with annual contracts. We also offer 30-day pilot programs for organizations that want to validate Gravity before committing.',
  },
  {
    q: 'Can we white-label the app?',
    a: 'Yes, full white-labeling including custom domain, app store listings under your brand, custom UI themes, and branded onboarding flow. Our design team assists with brand alignment.',
  },
  {
    q: 'Is Gravity GDPR compliant?',
    a: 'Yes, Gravity is fully GDPR compliant. We offer Data Processing Agreements (DPAs), right to erasure, data portability, and EU-based data hosting options for European clients.',
  },
  {
    q: 'How long does implementation take?',
    a: 'Standard enterprise deployment takes 5–10 business days. White-label deployment including custom app store listing takes 4–6 weeks. Our CSM team guides every step.',
  },
  {
    q: 'Do you offer an SLA?',
    a: 'Enterprise clients receive a 99.9% uptime SLA with financial penalties for breaches. We also offer 99.95% SLA for mission-critical deployments with dedicated infrastructure.',
  },
]

/* ─────────────── HERO ─────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          width: '1000px',
          height: '600px',
          background:
            'radial-gradient(ellipse, rgba(75,128,240,0.18) 0%, rgba(75,128,240,0.06) 45%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '300px',
          background:
            'radial-gradient(ellipse, rgba(212,168,83,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{
              color: '#4B80F0',
              border: '1px solid rgba(75,128,240,0.4)',
              background: 'rgba(75,128,240,0.08)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#4B80F0' }}
            />
            ENTERPRISE
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.04] tracking-tight"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: 'var(--text-primary)',
          }}
        >
          The{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #4B80F0, #818CF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Enterprise-Grade
          </span>
          <br />
          Family Safety Platform
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 max-w-2xl mx-auto text-xl leading-relaxed"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: 'var(--text-secondary)',
          }}
        >
          Deploy Gravity across your entire organization — schools, hospitals, NGOs, or corporations.
          SOC 2 certified. GDPR compliant. 99.9% SLA guaranteed.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
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
            Request Demo
            <span>→</span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(12px)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Download Enterprise Brief
            <span style={{ fontSize: '12px' }}>↓</span>
          </a>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          {...fadeUp(0.45)}
          className="flex flex-wrap justify-center gap-x-10 gap-y-5 mt-14"
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
      </div>
    </section>
  )
}

/* ─────────────── WHO IS IT FOR ─────────────── */
function SegmentsSection() {
  const { ref, inView } = useSection()
  const [active, setActive] = useState(0)
  const seg = SEGMENTS[active]

  return (
    <section ref={ref} className="py-24" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              color: '#4B80F0',
              border: '1px solid rgba(75,128,240,0.35)',
              background: 'rgba(75,128,240,0.07)',
            }}
          >
            Who Is It For
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--text-primary)',
            }}
          >
            Built for Every Organization
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            From a single school campus to a global NGO — Gravity Enterprise adapts to your structure.
          </p>
        </motion.div>

        {/* Tab row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {SEGMENTS.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setActive(i)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none"
              style={{
                background: active === i ? `rgba(${s.colorRgb},0.12)` : 'var(--bg-surface2)',
                border: active === i ? `1.5px solid ${s.color}` : '1.5px solid var(--border)',
                color: active === i ? s.color : 'var(--text-secondary)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <span>{s.emoji}</span>
              <span className="hidden sm:block">{s.title.split(' ')[0]}</span>
              <span className="sm:hidden">{s.emoji}</span>
            </button>
          ))}
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center"
            style={{
              background: 'var(--bg-surface2)',
              border: `1.5px solid rgba(${seg.colorRgb},0.25)`,
              boxShadow: `0 0 60px rgba(${seg.colorRgb},0.1)`,
            }}
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{seg.emoji}</span>
                <div>
                  <h3
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: 'var(--text-primary)',
                    }}
                  >
                    {seg.title}
                  </h3>
                  <p style={{ color: seg.color, fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                    {seg.subtitle}
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-3 mb-8">
                {seg.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: `rgba(${seg.colorRgb},0.15)`, color: seg.color }}
                    >
                      ✓
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: `rgba(${seg.colorRgb},0.15)`,
                  border: `1.5px solid rgba(${seg.colorRgb},0.4)`,
                  color: seg.color,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {seg.cta} →
              </a>
            </div>

            <div
              className="rounded-2xl p-8 flex flex-col gap-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: seg.color, fontFamily: "'Inter', sans-serif" }}
              >
                Why organizations choose us
              </p>
              {[
                'Fastest deployment in the industry',
                'No per-device hardware costs',
                'Works on any smartphone',
                'Fully customizable to your workflow',
                'Dedicated implementation engineer',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `rgba(${seg.colorRgb},0.1)` }}
                  >
                    <span style={{ color: seg.color, fontSize: '14px' }}>→</span>
                  </div>
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
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ─────────────── ENTERPRISE FEATURES 2x2 ─────────────── */
function EnterpriseFeaturesSection() {
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              color: 'var(--gold)',
              border: '1px solid rgba(212,168,83,0.35)',
              background: 'rgba(212,168,83,0.07)',
            }}
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
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {ENTERPRISE_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.1 }}
              className="rounded-2xl p-8"
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid rgba(${feat.color === '#D4A853' ? '212,168,83' : feat.color === '#4B80F0' ? '75,128,240' : feat.color === '#10B981' ? '16,185,129' : '239,68,68'},0.2)`,
                borderTop: `4px solid ${feat.color}`,
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'var(--bg-surface2)' }}
                >
                  {feat.icon}
                </div>
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: 'var(--text-primary)',
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: feat.color, fontFamily: "'Inter', sans-serif" }}
                  >
                    {feat.description}
                  </p>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {feat.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span style={{ color: feat.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────── IMPLEMENTATION & SUPPORT ─────────────── */
function SupportSection() {
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              color: '#4B80F0',
              border: '1px solid rgba(75,128,240,0.35)',
              background: 'rgba(75,128,240,0.07)',
            }}
          >
            Implementation & Support
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            We Deploy With You,
            <br />
            Not Just For You
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {SUPPORT_PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.12 }}
              className="rounded-2xl p-8 flex flex-col gap-4"
              style={{
                background: 'var(--bg-surface2)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `rgba(${pillar.color === '#D4A853' ? '212,168,83' : pillar.color === '#4B80F0' ? '75,128,240' : '16,185,129'},0.12)` }}
              >
                {pillar.icon}
              </div>
              <h3
                className="text-xl font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────── COMPLIANCE BADGES ─────────────── */
function ComplianceSection() {
  const { ref, inView } = useSection()

  return (
    <section ref={ref} className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-2xl md:text-3xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Certified. Compliant. Trusted.
          </h2>
          <p
            className="mt-3 text-sm"
            style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
          >
            Gravity meets the most rigorous security and privacy standards in the world.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {COMPLIANCE_BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.05 + i * 0.07 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
              >
                {badge.label}
              </span>
              <span style={{ color: '#10B981', fontSize: '16px' }}>✓</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────── CASE STUDIES ─────────────── */
function CaseStudiesSection() {
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              color: '#10B981',
              border: '1px solid rgba(16,185,129,0.35)',
              background: 'rgba(16,185,129,0.07)',
            }}
          >
            Case Studies
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Real Organizations.
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Measurable Results.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {CASE_STUDIES.map((cs, i) => (
            <motion.div
              key={cs.org}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + i * 0.12 }}
              className="rounded-2xl p-8 flex flex-col gap-5"
              style={{
                background: 'var(--bg-surface2)',
                border: `1.5px solid rgba(${cs.color === '#4B80F0' ? '75,128,240' : cs.color === '#EF4444' ? '239,68,68' : '212,168,83'},0.2)`,
                borderTop: `4px solid ${cs.color}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cs.flag}</span>
                <h3
                  className="font-bold text-base"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
                >
                  {cs.org}
                </h3>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                >
                  Challenge
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
                >
                  {cs.challenge}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[cs.stat1, cs.stat2].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4 text-center"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="text-2xl font-extrabold mb-1"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: cs.color,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────── CONTACT FORM ─────────────── */
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
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
              style={{
                color: '#D4A853',
                border: '1px solid rgba(212,168,83,0.35)',
                background: 'rgba(212,168,83,0.07)',
              }}
            >
              Get In Touch
            </span>
            <h2
              className="text-4xl md:text-5xl font-extrabold leading-tight mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
            >
              Talk to
              <br />
              Enterprise Sales
            </h2>
            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
            >
              Whether you are exploring Gravity for the first time or ready to sign, our enterprise team
              is here to help you find the right solution.
            </p>

            <div className="flex flex-col gap-5">
              {[
                { icon: '⚡', text: 'Response within 2 hours' },
                { icon: '💰', text: 'Custom pricing tailored to your scale' },
                { icon: '🚀', text: 'Pilot program available at no cost' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)' }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="font-medium text-sm"
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
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="rounded-2xl p-8"
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid rgba(212,168,83,0.2)',
              boxShadow: '0 0 50px rgba(212,168,83,0.08)',
            }}
          >
            {submitted ? (
              <div className="text-center py-12">
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
                        className="rounded-xl px-4 py-3 text-sm outline-none transition-colors duration-200"
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
                    { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+1 555 000 0000' },
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
                    Tell us about your safety challenge
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Describe your organization's current safety challenges and what you're hoping to achieve with Gravity..."
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
                  className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                    color: '#1A0F05',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: '0 4px 24px rgba(212,168,83,0.35)',
                  }}
                >
                  Request Enterprise Demo
                </motion.button>

                <p
                  className="text-xs text-center"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
                >
                  By submitting you agree to our Privacy Policy. We will never share your details.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── FAQ ─────────────── */
function FaqAccordionItem({ q, a }: { q: string; a: string }) {
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
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
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
            transition={{ duration: 0.32, ease: 'easeInOut' }}
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
          <p
            className="mt-3 text-sm"
            style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
          >
            Common questions from enterprise buyers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col gap-3"
        >
          {FAQ_ITEMS.map((item) => (
            <FaqAccordionItem key={item.q} q={item.q} a={item.a} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────── PAGE ─────────────── */
export default function EnterprisePage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <SegmentsSection />
      <EnterpriseFeaturesSection />
      <SupportSection />
      <ComplianceSection />
      <CaseStudiesSection />
      <ContactSection />
      <FaqSection />
      <Footer />
    </main>
  )
}
