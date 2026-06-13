'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { PRICING_PLANS, REGIONAL_PRICING } from '@/lib/constants'

/* ─────────────── Regional plan prices ─────────────── */
const REGIONAL_PLAN_PRICES: Record<
  string,
  { free: string; family: string; care: string; 'family-plus': string; ultimate: string; enterprise: string; gateway: string }
> = {
  'Kenya / East Africa': {
    free: 'Free',
    family: 'KES 650/mo',
    care: 'KES 1,050/mo',
    'family-plus': 'KES 1,750/mo',
    ultimate: 'KES 2,800/mo',
    enterprise: 'Custom',
    gateway: 'M-Pesa · Airtel Money',
  },
  India: {
    free: 'Free',
    family: '₹199/mo',
    care: '₹299/mo',
    'family-plus': '₹499/mo',
    ultimate: '₹799/mo',
    enterprise: 'Custom',
    gateway: 'UPI · Razorpay',
  },
  'UAE / MENA': {
    free: 'Free',
    family: 'AED 10/mo',
    care: 'AED 16/mo',
    'family-plus': 'AED 27/mo',
    ultimate: 'AED 43/mo',
    enterprise: 'Custom',
    gateway: 'Stripe · PayTabs',
  },
  'UK / Europe': {
    free: 'Free',
    family: '£1.99/mo',
    care: '£2.99/mo',
    'family-plus': '£4.99/mo',
    ultimate: '£7.99/mo',
    enterprise: 'Custom',
    gateway: 'Stripe · PayPal',
  },
  'USA / Canada': {
    free: 'Free',
    family: '$2.49/mo',
    care: '$3.49/mo',
    'family-plus': '$5.99/mo',
    ultimate: '$9.99/mo',
    enterprise: 'Custom',
    gateway: 'Stripe · Apple Pay',
  },
  'Rest of Africa': {
    free: 'Free',
    family: '$1.99/mo',
    care: '$2.99/mo',
    'family-plus': '$4.99/mo',
    ultimate: '$7.99/mo',
    enterprise: 'Custom',
    gateway: 'Flutterwave · Paystack',
  },
}

/* ─────────────── FAQ data ─────────────── */
const FAQ_ITEMS = [
  {
    question: 'Is it really free?',
    answer:
      'Yes, completely free forever — no credit card, no hidden fees, no trial expiry. The Free plan gives you live location sharing for up to 3 members, SOS alerts, basic geofencing, and our check-in system.',
  },
  {
    question: 'Can I track without the person knowing?',
    answer:
      'No — and we designed it this way intentionally. Every member must accept an invitation and can see who is viewing their location. Gravity is built on mutual trust, not surveillance. Privacy hours let any member pause their location sharing.',
  },
  {
    question: 'Does it work offline?',
    answer:
      'Gravity requires an internet connection for live tracking. However, the last known location is always cached and viewable offline. SOS alerts are also sent via SMS as a backup when data is unavailable.',
  },
  {
    question: 'What happens in an SOS emergency?',
    answer:
      'One tap instantly sends an emergency alert with the exact GPS location to every circle member simultaneously. A loud alarm sounds continuously until acknowledged. On Care and Bundle plans, SMS escalation and emergency services integration are available.',
  },
]

/* ─────────────── Plan visual config ─────────────── */
const PLAN_STYLE: Record<string, {
  emoji: string
  topBorderStyle: React.CSSProperties
  checkColor: string
  isFeatured: boolean
  btnStyle: React.CSSProperties
  btnHoverStyle: React.CSSProperties
}> = {
  free: {
    emoji: '🆓',
    topBorderStyle: { borderTop: '4px solid var(--border-strong, #374151)' },
    checkColor: 'var(--text-muted, #6B7280)',
    isFeatured: false,
    btnStyle: {
      background: 'transparent',
      border: '1.5px solid var(--border-strong, #374151)',
      color: 'var(--text-secondary, #9CA3AF)',
    },
    btnHoverStyle: {
      borderColor: 'var(--primary, #4B80F0)',
      color: 'var(--primary, #4B80F0)',
    },
  },
  family: {
    emoji: '👨‍👩‍👧‍👦',
    topBorderStyle: { borderTop: '4px solid var(--primary, #4B80F0)' },
    checkColor: 'var(--primary, #4B80F0)',
    isFeatured: false,
    btnStyle: {
      background: 'var(--primary, #4B80F0)',
      border: 'none',
      color: '#fff',
    },
    btnHoverStyle: {
      background: '#2563EB',
    },
  },
  care: {
    emoji: '❤️',
    topBorderStyle: { borderTop: '4px solid var(--safe, #10B981)' },
    checkColor: 'var(--safe, #10B981)',
    isFeatured: false,
    btnStyle: {
      background: 'var(--safe, #10B981)',
      border: 'none',
      color: '#fff',
    },
    btnHoverStyle: {
      background: '#059669',
    },
  },
  'family-plus': {
    emoji: '⭐',
    topBorderStyle: { borderTop: '4px solid var(--gold, #D4A853)' },
    checkColor: 'var(--gold, #D4A853)',
    isFeatured: true,
    btnStyle: {
      background: 'linear-gradient(135deg, #D4A853, #F5C842)',
      border: 'none',
      color: '#1A0F05',
      fontWeight: 700,
    },
    btnHoverStyle: {
      background: 'linear-gradient(135deg, #C49642, #E5B832)',
      boxShadow: '0 4px 20px rgba(212,168,83,0.45)',
    },
  },
  ultimate: {
    emoji: '🚀',
    topBorderStyle: { borderTop: '4px solid #8B5CF6' },
    checkColor: '#8B5CF6',
    isFeatured: false,
    btnStyle: {
      background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      border: 'none',
      color: '#fff',
      fontWeight: 700,
    },
    btnHoverStyle: {
      background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
      boxShadow: '0 4px 20px rgba(139,92,246,0.45)',
    },
  },
  enterprise: {
    emoji: '🏢',
    topBorderStyle: { borderTop: '4px solid #64748B' },
    checkColor: '#94A3B8',
    isFeatured: false,
    btnStyle: {
      background: 'transparent',
      border: '1.5px solid #64748B',
      color: '#94A3B8',
    },
    btnHoverStyle: {
      borderColor: '#94A3B8',
      color: '#F8FAFC',
    },
  },
}

/* ─── helpers ─────────────────────────────────────────────────── */

/** Parse a regional price string like "₹199/mo" → number (199), or null for Free/Custom */
function parseRegionalAmount(raw: string): number | null {
  if (raw === 'Free' || raw === 'Custom') return null
  const m = raw.match(/[\d,]+/)
  return m ? parseFloat(m[0].replace(',', '')) : null
}

/** Apply -20% to a regional price string for annual billing. */
function annualizeRegional(raw: string): string {
  if (raw === 'Free' || raw === 'Custom') return raw
  const amount = parseRegionalAmount(raw)
  if (amount === null) return raw
  // strip number, apply 20% off, rebuild string
  const discounted = Math.round(amount * 0.8)
  return raw.replace(/[\d,]+/, discounted.toLocaleString())
}

/* ─────────────── Price display ─────────────── */
function PriceDisplay({
  plan,
  billingCycle,
  region,
}: {
  plan: (typeof PRICING_PLANS)[0]
  billingCycle: 'monthly' | 'annual'
  region: string
}) {
  const regional = REGIONAL_PLAN_PRICES[region]

  /* Use regional prices for every named region (including USA/Canada) */
  if (regional) {
    const rawMonthly =
      plan.id === 'free'         ? regional.free
      : plan.id === 'family'     ? regional.family
      : plan.id === 'care'       ? regional.care
      : plan.id === 'family-plus' ? regional['family-plus']
      : plan.id === 'ultimate'   ? regional.ultimate
      : regional.enterprise

    const price = billingCycle === 'annual' ? annualizeRegional(rawMonthly) : rawMonthly

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${region}-${plan.id}-${billingCycle}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="mt-4"
        >
          <div
            className="text-3xl font-extrabold leading-tight"
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              color: 'var(--text-primary)',
            }}
          >
            {price}
            {price !== 'Free' && price !== 'Custom' && (
              <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
                /{billingCycle === 'annual' ? 'mo*' : 'mo'}
              </span>
            )}
          </div>
          {billingCycle === 'annual' && price !== 'Free' && price !== 'Custom' && (
            <p className="text-xs mt-1" style={{ color: '#10B981', fontWeight: 600 }}>
              Save 20% vs monthly
            </p>
          )}
          {plan.id !== 'free' && plan.id !== 'enterprise' && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              via {regional.gateway}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  /* Fallback when no region is selected (shows INR) */
  if (plan.id === 'enterprise') {
    return (
      <div className="mt-4">
        <div
          className="text-3xl font-extrabold leading-tight"
          style={{
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
            color: 'var(--text-primary)',
          }}
        >
          Custom
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          Contact us for a quote
        </p>
      </div>
    )
  }

  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${billingCycle}-${plan.id}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        className="mt-4 flex items-end gap-1"
      >
        <span
          className="text-4xl font-extrabold leading-tight"
          style={{
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
            color: 'var(--text-primary)',
          }}
        >
          {price === 0 ? 'Free' : `₹${price}`}
        </span>
        {price !== 0 && (
          <span className="text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>
            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

/* ─────────────── Pricing card ─────────────── */
function PricingCard({
  plan,
  billingCycle,
  region,
  index,
  inView,
}: {
  plan: (typeof PRICING_PLANS)[0]
  billingCycle: 'monthly' | 'annual'
  region: string
  index: number
  inView: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const style = PLAN_STYLE[plan.id]

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 + index * 0.1 }}
      whileHover={{ y: -6, scale: 1.01 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col rounded-2xl transition-shadow duration-300"
      style={{
        background: 'var(--bg-surface)',
        border: style.isFeatured
          ? '1.5px solid var(--gold, #D4A853)'
          : '1px solid var(--border)',
        boxShadow: style.isFeatured
          ? hovered
            ? '0 0 50px rgba(212,168,83,0.3), 0 20px 60px rgba(0,0,0,0.25)'
            : '0 0 30px rgba(212,168,83,0.2), 0 10px 40px rgba(0,0,0,0.15)'
          : hovered
            ? '0 16px 48px rgba(0,0,0,0.2)'
            : '0 2px 12px rgba(0,0,0,0.07)',
      }}
    >
      {/* Top color accent border */}
      <div style={style.topBorderStyle} />

      {/* "Most Popular" badge for bundle */}
      {style.isFeatured && (
        <div className="absolute top-4 right-4 z-10">
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #F5C842)',
              color: '#1A0F05',
            }}
          >
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Plan icon + name */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{style.emoji}</span>
          <h3
            className="text-xl font-bold"
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              color: 'var(--text-primary)',
            }}
          >
            {plan.name}
          </h3>
        </div>

        {/* Price */}
        <PriceDisplay plan={plan} billingCycle={billingCycle} region={region} />

        {plan.monthlyPrice > 0 && plan.id !== 'enterprise' && !REGIONAL_PLAN_PRICES[region] && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            per {billingCycle === 'monthly' ? 'month' : 'year'}, billed {billingCycle}
          </p>
        )}
        {plan.id === 'free' && (
          <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
            Free Forever
          </p>
        )}

        {/* Divider */}
        <div className="my-5" style={{ borderTop: '1px solid var(--border)' }} />

        {/* Feature list */}
        <ul className="flex-1 flex flex-col gap-2.5 mb-6">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2.5 text-sm">
              <span
                className="flex-shrink-0 mt-0.5 text-base leading-none"
                style={{ color: style.checkColor }}
              >
                ✓
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none"
          style={{
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
            ...style.btnStyle,
            ...(hovered ? style.btnHoverStyle : {}),
          }}
        >
          {plan.cta}
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ─────────────── Accordion FAQ item ─────────────── */
function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-xl overflow-hidden transition-colors duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none group"
      >
        <span
          className="font-semibold text-sm md:text-base pr-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {question}
        </span>
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            border: open
              ? '1.5px solid var(--gold, #D4A853)'
              : '1px solid var(--border-strong)',
            background: open ? 'rgba(212,168,83,0.12)' : 'transparent',
            color: open ? 'var(--gold, #D4A853)' : 'var(--text-muted)',
            fontSize: '16px',
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

/* ─────────────── Region selector dropdown ─────────────── */
function RegionSelector({
  selectedRegion,
  setSelectedRegion,
}: {
  selectedRegion: string
  setSelectedRegion: (r: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = REGIONAL_PRICING.find((r) => r.region === selectedRegion)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 focus:outline-none transition-all min-w-[200px] justify-between"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <span>
          {current?.flag} {selectedRegion}
        </span>
        <span
          className="text-xs transition-transform duration-200"
          style={{
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
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
            transition={{ duration: 0.16 }}
            className="absolute top-full left-0 mt-2 w-full rounded-xl overflow-hidden z-50"
            style={{
              background: 'var(--bg-surface2)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {REGIONAL_PRICING.map((r) => (
              <button
                key={r.region}
                onClick={() => {
                  setSelectedRegion(r.region)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors duration-100"
                style={{
                  color: selectedRegion === r.region ? 'var(--gold, #D4A853)' : 'var(--text-secondary)',
                  background: selectedRegion === r.region ? 'rgba(212,168,83,0.08)' : 'transparent',
                  fontWeight: selectedRegion === r.region ? 600 : 400,
                }}
              >
                <span>{r.flag}</span>
                <span>{r.region}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}

/* ─────────────── Main section ─────────────── */
export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedRegion, setSelectedRegion] = useState('USA / Canada')

  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-24 relative overflow-hidden"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Warm ambient glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '450px',
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.14) 0%, rgba(184,114,10,0.05) 55%, transparent 75%)',
          filter: 'blur(50px)',
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
          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              color: 'var(--gold, #D4A853)',
              border: '1px solid rgba(212,168,83,0.35)',
              background: 'rgba(212,168,83,0.07)',
            }}
          >
            <span>💛</span>
            Transparent Pricing
          </span>

          <h2
            className="text-4xl md:text-5xl font-extrabold leading-tight mt-2"
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
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
              Family Plan
            </span>
          </h2>

          <p className="mt-4 max-w-xl mx-auto text-base" style={{ color: 'var(--text-secondary)' }}>
            Start free. Upgrade when your family needs more. Cancel anytime.
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Pricing in INR for India users. USD for international.
          </p>
        </motion.div>

        {/* ── Controls row: billing toggle + region ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          {/* Monthly / Annual pill toggle */}
          <div
            className="flex items-center gap-1 rounded-full p-1"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            {(['monthly', 'annual'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className="relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 focus:outline-none"
                style={{
                  background: billingCycle === cycle ? 'var(--gold, #D4A853)' : 'transparent',
                  color: billingCycle === cycle ? '#1A0F05' : 'var(--text-secondary)',
                }}
              >
                {cycle === 'monthly' ? 'Monthly' : 'Annual'}
                {cycle === 'annual' && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: billingCycle === 'annual' ? 'rgba(0,0,0,0.2)' : 'rgba(16,185,129,0.15)',
                      color: billingCycle === 'annual' ? '#1A0F05' : '#10B981',
                    }}
                  >
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Region selector */}
          <RegionSelector selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
        </motion.div>

        {/* ── Pricing cards ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch overflow-visible">
          {PRICING_PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              region={selectedRegion}
              index={i}
              inView={inView}
            />
          ))}
        </div>

        {/* Guarantee note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="text-center mt-8 flex flex-col gap-1"
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--safe, #10B981)', fontWeight: 600 }}>30-day money-back guarantee</span>
            {' '}· No credit card required for free plan · Cancel anytime
          </p>
          {billingCycle === 'annual' && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              * Annual price shown per month — billed once per year (20% savings)
            </p>
          )}
        </motion.div>

        {/* ── FAQ Accordion ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.7 }}
          className="mt-24"
        >
          <h3
            className="text-2xl font-bold text-center mb-2"
            style={{
              fontFamily: 'var(--font-display, "Plus Jakarta Sans", sans-serif)',
              color: 'var(--text-primary)',
            }}
          >
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-center mb-10" style={{ color: 'var(--text-muted)' }}>
            Everything you need to know before getting started.
          </p>
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
