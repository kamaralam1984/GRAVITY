'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import { REGIONAL_PRICING } from '@/lib/constants'

/* ─────────────── Regional prices (6 tiers) ─────────────── */
type RegionalPriceRow = {
  free: string
  premium: string
  familyPlus: string
  elderCare: string
  school: string
  enterprise: string
  gateway: string
}

const REGIONAL_PRICES: Record<string, RegionalPriceRow> = {
  India: {
    free: 'Free',
    premium: '₹299/mo',
    familyPlus: '₹499/mo',
    elderCare: '₹699/mo',
    school: '₹999/mo',
    enterprise: 'Custom',
    gateway: 'UPI · Razorpay',
  },
  'Kenya / East Africa': {
    free: 'Free',
    premium: 'KES 550/mo',
    familyPlus: 'KES 950/mo',
    elderCare: 'KES 1,350/mo',
    school: 'KES 1,900/mo',
    enterprise: 'Custom',
    gateway: 'M-Pesa · Airtel Money',
  },
  'UAE / MENA': {
    free: 'Free',
    premium: 'AED 11/mo',
    familyPlus: 'AED 18/mo',
    elderCare: 'AED 26/mo',
    school: 'AED 37/mo',
    enterprise: 'Custom',
    gateway: 'Stripe · PayTabs',
  },
  'UK / Europe': {
    free: 'Free',
    premium: '£2.49/mo',
    familyPlus: '£4.49/mo',
    elderCare: '£5.99/mo',
    school: '£8.99/mo',
    enterprise: 'Custom',
    gateway: 'Stripe · PayPal',
  },
  'USA / Canada': {
    free: 'Free',
    premium: '$2.99/mo',
    familyPlus: '$5.99/mo',
    elderCare: '$7.99/mo',
    school: '$11.99/mo',
    enterprise: 'Custom',
    gateway: 'Stripe · Apple Pay',
  },
  'Rest of Africa': {
    free: 'Free',
    premium: '$1.99/mo',
    familyPlus: '$3.99/mo',
    elderCare: '$5.99/mo',
    school: '$8.99/mo',
    enterprise: 'Custom',
    gateway: 'Flutterwave · Paystack',
  },
}

/* ─────────────── Plan definitions ─────────────── */
type PlanId = 'free' | 'premium' | 'familyPlus' | 'elderCare' | 'school' | 'enterprise'

interface Plan {
  id: PlanId
  name: string
  tagline: string
  emoji: string
  badge: string | null
  badgeColor: string | null
  features: string[]
  cta: string
  ctaHref: string
  accentColor: string
  accentRgb: string
  isFeatured: boolean
  isContact: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'For individuals',
    emoji: '🆓',
    badge: null,
    badgeColor: null,
    features: [
      '3 family members',
      'Live location tracking',
      'Basic SOS alerts',
      'Check-in system',
      '7-day location history',
    ],
    cta: 'Start Free',
    ctaHref: '/#download',
    accentColor: '#6B7280',
    accentRgb: '107,114,128',
    isFeatured: false,
    isContact: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'For small families',
    emoji: '👨‍👩‍👧',
    badge: 'Popular',
    badgeColor: '#4B80F0',
    features: [
      '6 family members',
      'Geofencing (10 zones)',
      'Journey sharing',
      '30-day location history',
      'Priority support',
    ],
    cta: 'Go Premium',
    ctaHref: '/#download',
    accentColor: '#4B80F0',
    accentRgb: '75,128,240',
    isFeatured: false,
    isContact: false,
  },
  {
    id: 'familyPlus',
    name: 'Family Plus',
    tagline: 'Best for families',
    emoji: '⭐',
    badge: 'MOST POPULAR',
    badgeColor: '#D4A853',
    features: [
      '15 family members',
      'Unlimited geofences',
      'Family chat',
      'Driving safety suite',
      'AI safety alerts',
      'Wearable sync',
    ],
    cta: 'Get Family Plus',
    ctaHref: '/#download',
    accentColor: '#D4A853',
    accentRgb: '212,168,83',
    isFeatured: true,
    isContact: false,
  },
  {
    id: 'elderCare',
    name: 'Elder Care',
    tagline: 'For families with seniors',
    emoji: '❤️',
    badge: 'Care Focused',
    badgeColor: '#10B981',
    features: [
      'Everything in Family Plus',
      'Fall detection',
      'Medication tracking',
      'Health monitoring',
      'Wellness dashboard',
      'Caregiver mode',
    ],
    cta: 'Start Elder Care',
    ctaHref: '/#download',
    accentColor: '#10B981',
    accentRgb: '16,185,129',
    isFeatured: false,
    isContact: false,
  },
  {
    id: 'school',
    name: 'School Edition',
    tagline: 'For educational institutions',
    emoji: '🏫',
    badge: 'Education',
    badgeColor: '#8B5CF6',
    features: [
      '500 students',
      'Bus route tracking',
      'Pickup verification',
      'Admin dashboard',
      'Parent notifications',
      'Emergency mode',
    ],
    cta: 'School Sales',
    ctaHref: 'mailto:schools@trackalways.com',
    accentColor: '#8B5CF6',
    accentRgb: '139,92,246',
    isFeatured: false,
    isContact: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For organizations',
    emoji: '🏢',
    badge: 'Custom',
    badgeColor: '#64748B',
    features: [
      'Unlimited users',
      'White-label platform',
      'Full API access',
      'SSO (SAML 2.0)',
      '99.9% SLA guarantee',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    ctaHref: '/enterprise#contact',
    accentColor: '#94A3B8',
    accentRgb: '148,163,184',
    isFeatured: false,
    isContact: true,
  },
]

/* ─────────────── Comparison table data ─────────────── */
const COMPARISON_ROWS = [
  { feature: 'Family members', free: '3', premium: '6', familyPlus: '15', elderCare: '15', school: '500 students', enterprise: 'Unlimited' },
  { feature: 'Live location tracking', free: true, premium: true, familyPlus: true, elderCare: true, school: true, enterprise: true },
  { feature: 'SOS alerts', free: 'Basic', premium: 'Priority', familyPlus: 'Priority', elderCare: 'Priority', school: 'Emergency mode', enterprise: 'Custom' },
  { feature: 'Geofencing', free: false, premium: '10 zones', familyPlus: 'Unlimited', elderCare: 'Unlimited', school: 'Campus zones', enterprise: 'Unlimited' },
  { feature: 'Location history', free: '7 days', premium: '30 days', familyPlus: '90 days', elderCare: '90 days', school: '90 days', enterprise: 'Custom' },
  { feature: 'Fall detection', free: false, premium: false, familyPlus: false, elderCare: true, school: false, enterprise: 'Optional' },
  { feature: 'Driving safety', free: false, premium: false, familyPlus: true, elderCare: true, school: false, enterprise: 'Optional' },
  { feature: 'White-label', free: false, premium: false, familyPlus: false, elderCare: false, school: false, enterprise: true },
  { feature: 'API access', free: false, premium: false, familyPlus: false, elderCare: false, school: false, enterprise: true },
  { feature: 'SLA guarantee', free: false, premium: false, familyPlus: false, elderCare: false, school: false, enterprise: '99.9%' },
]

/* ─────────────── Helpers ─────────────── */
function parseAmount(raw: string): number | null {
  if (raw === 'Free' || raw === 'Custom') return null
  const m = raw.match(/[\d,]+/)
  return m ? parseFloat(m[0].replace(',', '')) : null
}

function annualize(raw: string): string {
  if (raw === 'Free' || raw === 'Custom') return raw
  const amount = parseAmount(raw)
  if (amount === null) return raw
  const discounted = Math.round(amount * 0.8)
  return raw.replace(/[\d,]+/, discounted.toLocaleString())
}

function getPlanPrice(plan: Plan, region: string, cycle: 'monthly' | 'annual'): string {
  const row = REGIONAL_PRICES[region]
  if (!row) return plan.id === 'enterprise' ? 'Custom' : '—'
  const raw = row[plan.id]
  return cycle === 'annual' ? annualize(raw) : raw
}

/* ─────────────── Region selector ─────────────── */
function RegionSelector({
  selected,
  setSelected,
}: {
  selected: string
  setSelected: (r: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = REGIONAL_PRICING.find((r) => r.region === selected)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 focus:outline-none transition-all min-w-[200px] justify-between"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <span>
          {current?.flag} {selected}
        </span>
        <span
          style={{
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: 'var(--text-muted)',
          }}
        >
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-full rounded-xl overflow-hidden z-50"
            style={{
              background: 'var(--bg-surface2)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            }}
          >
            {REGIONAL_PRICING.map((r) => (
              <button
                key={r.region}
                onClick={() => { setSelected(r.region); setOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors"
                style={{
                  color: selected === r.region ? 'var(--gold)' : 'var(--text-secondary)',
                  background: selected === r.region ? 'rgba(212,168,83,0.08)' : 'transparent',
                  fontWeight: selected === r.region ? 600 : 400,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span>{r.flag}</span>
                <span>{r.region}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}

/* ─────────────── Pricing card ─────────────── */
function PricingCard({
  plan,
  cycle,
  region,
  index,
  inView,
}: {
  plan: Plan
  cycle: 'monthly' | 'annual'
  region: string
  index: number
  inView: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const price = getPlanPrice(plan, region, cycle)
  const regionalRow = REGIONAL_PRICES[region]
  const gateway = regionalRow?.gateway ?? ''
  const showGateway = !plan.isContact && plan.id !== 'free'
  const showSave = cycle === 'annual' && price !== 'Free' && price !== 'Custom'

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + index * 0.08 }}
      whileHover={{ y: plan.isFeatured ? -10 : -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col rounded-2xl"
      style={{
        background: 'var(--bg-surface)',
        border: plan.isFeatured
          ? `2px solid ${plan.accentColor}`
          : `1px solid var(--border)`,
        boxShadow: plan.isFeatured
          ? hovered
            ? `0 0 60px rgba(${plan.accentRgb},0.35), 0 20px 60px rgba(0,0,0,0.25)`
            : `0 0 40px rgba(${plan.accentRgb},0.2), 0 10px 40px rgba(0,0,0,0.15)`
          : hovered
          ? `0 0 30px rgba(${plan.accentRgb},0.15), 0 16px 48px rgba(0,0,0,0.18)`
          : '0 2px 12px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.3s',
        ...(plan.isFeatured ? { transform: 'scale(1.02)' } : {}),
      }}
    >
      {/* Top accent border */}
      <div
        style={{
          height: '4px',
          borderRadius: '16px 16px 0 0',
          background: plan.isFeatured
            ? `linear-gradient(90deg, ${plan.accentColor}, #F5C842)`
            : plan.accentColor,
        }}
      />

      {/* Popular ribbon */}
      {plan.isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span
            className="text-[10px] font-extrabold px-5 py-1.5 rounded-full uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #F5C842)',
              color: '#1A0F05',
              boxShadow: '0 4px 16px rgba(212,168,83,0.5)',
            }}
          >
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Badge (top-right) for non-featured */}
      {plan.badge && !plan.isFeatured && plan.badgeColor && (
        <div className="absolute top-4 right-4">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: `rgba(${plan.accentRgb},0.12)`,
              color: plan.accentColor,
              border: `1px solid rgba(${plan.accentRgb},0.3)`,
            }}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 pt-7">
        {/* Icon + name */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{plan.emoji}</span>
          <div>
            <h3
              className="text-lg font-bold leading-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--text-primary)',
              }}
            >
              {plan.name}
            </h3>
            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
            >
              {plan.tagline}
            </p>
          </div>
        </div>

        {/* Price */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${region}-${plan.id}-${cycle}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <div
              className="font-extrabold leading-none"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: plan.isFeatured ? plan.accentColor : 'var(--text-primary)',
                fontSize: price === 'Custom' ? '28px' : '30px',
              }}
            >
              {price}
              {price !== 'Free' && price !== 'Custom' && (
                <span
                  className="text-sm font-normal ml-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  /{cycle === 'annual' ? 'mo*' : 'mo'}
                </span>
              )}
            </div>
            {showSave && (
              <p className="text-xs mt-1 font-semibold" style={{ color: '#10B981' }}>
                Save 20% vs monthly
              </p>
            )}
            {showGateway && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                via {gateway}
              </p>
            )}
            {plan.id === 'enterprise' && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                Contact us for a quote
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Divider */}
        <div className="my-5" style={{ borderTop: '1px solid var(--border)' }} />

        {/* Features */}
        <ul className="flex-1 flex flex-col gap-2.5 mb-6">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2.5 text-sm">
              <span
                className="flex-shrink-0 mt-0.5 font-bold"
                style={{ color: plan.accentColor }}
              >
                ✓
              </span>
              <span
                style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
              >
                {feat}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <motion.a
          href={plan.ctaHref}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl text-sm font-bold text-center block transition-all duration-200 focus:outline-none"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            ...(plan.isFeatured
              ? {
                  background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                  color: '#1A0F05',
                  boxShadow: hovered ? '0 4px 20px rgba(212,168,83,0.5)' : '0 2px 10px rgba(212,168,83,0.3)',
                }
              : plan.isContact
              ? {
                  background: 'transparent',
                  border: `1.5px solid ${plan.accentColor}`,
                  color: plan.accentColor,
                }
              : {
                  background: `rgba(${plan.accentRgb},0.12)`,
                  border: `1.5px solid rgba(${plan.accentRgb},0.35)`,
                  color: plan.accentColor,
                  ...(hovered ? { background: `rgba(${plan.accentRgb},0.2)` } : {}),
                }),
          }}
        >
          {plan.cta}
        </motion.a>
      </div>
    </motion.div>
  )
}

/* ─────────────── FAQ ─────────────── */
const PRICING_FAQ = [
  {
    question: 'Is it really free?',
    answer:
      'Yes, completely free forever — no credit card, no hidden fees, no trial expiry. The Free plan gives you live location sharing for up to 3 members, SOS alerts, and check-ins.',
  },
  {
    question: 'Can I track without the person knowing?',
    answer:
      'No — and we designed it this way intentionally. Every member must accept an invitation and can see who is viewing their location. Privacy hours let any member pause their location sharing.',
  },
  {
    question: 'Does it work offline?',
    answer:
      'Gravity requires an internet connection for live tracking. However, the last known location is always cached and viewable offline. SOS alerts are also sent via SMS as a backup.',
  },
  {
    question: 'What happens in an SOS emergency?',
    answer:
      'One tap instantly sends an emergency alert with the exact GPS location to every circle member simultaneously. A loud alarm sounds continuously until acknowledged.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Yes — upgrade or downgrade at any time. When you upgrade, the new plan activates immediately with prorated billing for the remainder of your cycle.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none group"
      >
        <span
          className="font-semibold text-sm md:text-base pr-4"
          style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {question}
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
              className="px-6 pb-5 text-sm leading-relaxed pt-3"
              style={{
                borderTop: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────── Comparison table cell ─────────────── */
function CompCell({ value }: { value: string | boolean | undefined }) {
  if (value === true) return <span style={{ color: '#10B981', fontSize: '16px' }}>✓</span>
  if (value === false || value === undefined) return <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>—</span>
  return <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>{value}</span>
}

/* ─────────────── Main section ─────────────── */
export default function PricingSection() {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')
  const [region, setRegion] = useState('USA / Canada')
  const [showTable, setShowTable] = useState(false)

  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-24 relative overflow-hidden"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Ambient gold glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '500px',
          background:
            'radial-gradient(ellipse, rgba(212,168,83,0.13) 0%, rgba(184,114,10,0.04) 55%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              color: 'var(--gold)',
              border: '1px solid rgba(212,168,83,0.35)',
              background: 'rgba(212,168,83,0.07)',
            }}
          >
            <span>💛</span>
            Transparent Pricing
          </span>

          <h2
            className="text-4xl md:text-5xl font-extrabold leading-tight"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--text-primary)',
            }}
          >
            Choose Your{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #D4A853, #F5C842, #D4A853)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Safety Plan
            </span>
          </h2>

          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            Start free. Upgrade when your family needs more. Cancel anytime.
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
            <span style={{ color: 'var(--gold)' }}>₹</span> Prices shown for India.{' '}
            <Link href="#pricing" className="underline underline-offset-2 hover:opacity-80">
              See regional pricing →
            </Link>
          </p>
        </motion.div>

        {/* ── Controls: billing toggle + region ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          {/* Billing toggle */}
          <div
            className="flex items-center gap-1 rounded-full p-1"
            style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
          >
            {(['monthly', 'annual'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className="relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 focus:outline-none"
                style={{
                  background:
                    cycle === c ? 'linear-gradient(135deg, #D4A853, #F5C842)' : 'transparent',
                  color: cycle === c ? '#1A0F05' : 'var(--text-secondary)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {c === 'monthly' ? 'Monthly' : 'Annual'}
                {c === 'annual' && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: cycle === 'annual' ? 'rgba(0,0,0,0.2)' : 'rgba(16,185,129,0.15)',
                      color: cycle === 'annual' ? '#1A0F05' : '#10B981',
                    }}
                  >
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>

          <RegionSelector selected={region} setSelected={setRegion} />
        </motion.div>

        {/* ── Pricing cards grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch overflow-visible pb-4">
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              region={region}
              index={i}
              inView={inView}
            />
          ))}
        </div>

        {/* Annual note + guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8 flex flex-col gap-1"
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
            <span style={{ color: '#10B981', fontWeight: 600 }}>30-day money-back guarantee</span>
            {' '}· No credit card required for free plan · Cancel anytime
          </p>
          {cycle === 'annual' && (
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              * Annual price shown per month — billed once per year (20% savings)
            </p>
          )}
        </motion.div>

        {/* ── Enterprise CTA strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background: 'linear-gradient(135deg, rgba(75,128,240,0.08) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(75,128,240,0.2)',
          }}
        >
          <div>
            <h3
              className="text-xl font-bold mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
            >
              Need more than 500 users?
            </h3>
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
            >
              Gravity Enterprise offers white-label, SSO, dedicated infrastructure, and custom SLAs for schools, hospitals, NGOs, and corporations.
            </p>
          </div>
          <Link
            href="/enterprise"
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #4B80F0, #818CF8)',
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 20px rgba(75,128,240,0.35)',
            }}
          >
            Explore Enterprise →
          </Link>
        </motion.div>

        {/* ── Feature comparison table (collapsible) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-16"
        >
          <button
            onClick={() => setShowTable((v) => !v)}
            className="flex items-center gap-3 mx-auto mb-6 text-sm font-semibold focus:outline-none"
            style={{ color: 'var(--gold)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span>{showTable ? 'Hide' : 'Show'} Full Feature Comparison</span>
            <span
              style={{
                display: 'inline-block',
                transform: showTable ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s',
              }}
            >
              ▾
            </span>
          </button>

          <AnimatePresence>
            {showTable && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)' }}>
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
                        <th
                          className="text-left px-5 py-4 text-sm font-bold"
                          style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          Feature
                        </th>
                        {PLANS.map((p) => (
                          <th
                            key={p.id}
                            className="text-center px-4 py-4 text-xs font-bold uppercase tracking-wide"
                            style={{ color: p.isFeatured ? p.accentColor : 'var(--text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_ROWS.map((row, i) => (
                        <tr
                          key={row.feature}
                          style={{
                            borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid var(--border)' : 'none',
                            background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface2)',
                          }}
                        >
                          <td
                            className="px-5 py-3.5 text-sm"
                            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
                          >
                            {row.feature}
                          </td>
                          {PLANS.map((p) => (
                            <td key={p.id} className="px-4 py-3.5 text-center">
                              <CompCell value={row[p.id as keyof typeof row] as string | boolean} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
          className="mt-24"
        >
          <h3
            className="text-2xl font-bold text-center mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Frequently Asked Questions
          </h3>
          <p
            className="text-sm text-center mb-10"
            style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
          >
            Everything you need to know before getting started.
          </p>
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {PRICING_FAQ.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
