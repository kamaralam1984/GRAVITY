'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import { REGIONAL_PRICING } from '@/lib/constants'

/* ─────────────── Types ─────────────── */
type Currency = 'INR' | 'USD' | 'AED' | 'KES'
type BillingCycle = 'monthly' | 'annual'

interface PlanTier {
  id: string
  name: string
  tagline: string
  emoji: string
  monthlyINR: string
  annualINR: string
  monthlyUSD: string
  annualUSD: string
  monthlyAED: string
  annualAED: string
  monthlyKES: string
  annualKES: string
  badge: string | null
  badgeColor: string | null
  features: string[]
  cta: string
  ctaHref: string
  accentColor: string
  accentRgb: string
  isFeatured: boolean
  isContact: boolean
  isCustom: boolean
}

/* ─────────────── 7 Plan Definitions ─────────────── */
const PLANS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'For individuals getting started',
    emoji: '🆓',
    monthlyINR: '₹0',
    annualINR: '₹0',
    monthlyUSD: '$0',
    annualUSD: '$0',
    monthlyAED: 'AED 0',
    annualAED: 'AED 0',
    monthlyKES: 'KES 0',
    annualKES: 'KES 0',
    badge: null,
    badgeColor: null,
    features: [
      '3 family members',
      'Real-time location tracking',
      'Basic SOS alert',
      'Check-in system',
      'Basic geofence (1 zone)',
      '7-day location history',
    ],
    cta: 'Start Free',
    ctaHref: '/#download',
    accentColor: '#6B7280',
    accentRgb: '107,114,128',
    isFeatured: false,
    isContact: false,
    isCustom: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'For small families',
    emoji: '👨‍👩‍👧',
    monthlyINR: '₹299',
    annualINR: '₹2,499',
    monthlyUSD: '$3.99',
    annualUSD: '$32.99',
    monthlyAED: 'AED 14',
    annualAED: 'AED 115',
    monthlyKES: 'KES 550',
    annualKES: 'KES 4,599',
    badge: 'Popular',
    badgeColor: '#4B80F0',
    features: [
      '10 family members',
      'AI Guardian alerts',
      'Unlimited geofencing',
      'Driving safety score',
      'Health monitoring',
      '30-day location history',
      'Priority SOS response',
    ],
    cta: 'Get Started',
    ctaHref: '/#download',
    accentColor: '#4B80F0',
    accentRgb: '75,128,240',
    isFeatured: false,
    isContact: false,
    isCustom: false,
  },
  {
    id: 'familyPlus',
    name: 'Family Plus',
    tagline: 'Best for growing families',
    emoji: '⭐',
    monthlyINR: '₹499',
    annualINR: '₹3,999',
    monthlyUSD: '$6.99',
    annualUSD: '$54.99',
    monthlyAED: 'AED 25',
    annualAED: 'AED 199',
    monthlyKES: 'KES 950',
    annualKES: 'KES 7,499',
    badge: 'MOST POPULAR',
    badgeColor: '#D4A853',
    features: [
      '25 family members',
      'All Premium features',
      'Child safety mode',
      'Elder care dashboard',
      'Smart home integration',
      'Family group chat',
      '90-day location history',
      'Wearable device sync',
    ],
    cta: 'Start Trial',
    ctaHref: '/#download',
    accentColor: '#D4A853',
    accentRgb: '212,168,83',
    isFeatured: true,
    isContact: false,
    isCustom: false,
  },
  {
    id: 'elderCare',
    name: 'Elder Care',
    tagline: 'For families with seniors',
    emoji: '❤️',
    monthlyINR: '₹399',
    annualINR: '₹3,199',
    monthlyUSD: '$5.49',
    annualUSD: '$43.99',
    monthlyAED: 'AED 20',
    annualAED: 'AED 159',
    monthlyKES: 'KES 750',
    annualKES: 'KES 5,999',
    badge: 'Care Focused',
    badgeColor: '#10B981',
    features: [
      'Fall detection & alerts',
      'Medication management',
      'Health monitoring dashboard',
      'Caregiver mode',
      'Vital sign tracking',
      'Emergency contact chain',
      'Wellness reports',
    ],
    cta: 'Start Trial',
    ctaHref: '/#download',
    accentColor: '#10B981',
    accentRgb: '16,185,129',
    isFeatured: false,
    isContact: false,
    isCustom: false,
  },
  {
    id: 'school',
    name: 'School Edition',
    tagline: 'For educational institutions',
    emoji: '🏫',
    monthlyINR: '₹999',
    annualINR: '₹7,999',
    monthlyUSD: '$13.99',
    annualUSD: '$109.99',
    monthlyAED: 'AED 51',
    annualAED: 'AED 399',
    monthlyKES: 'KES 1,900',
    annualKES: 'KES 14,999',
    badge: 'Education',
    badgeColor: '#8B5CF6',
    features: [
      'Up to 500 students',
      'School bus live tracking',
      'Attendance management',
      'Pickup authorization system',
      'Parent notifications',
      'Admin dashboard',
      'Emergency broadcast mode',
    ],
    cta: 'Contact Sales',
    ctaHref: 'mailto:schools@trackalways.com',
    accentColor: '#8B5CF6',
    accentRgb: '139,92,246',
    isFeatured: false,
    isContact: true,
    isCustom: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For large organizations',
    emoji: '🏢',
    monthlyINR: '₹4,999',
    annualINR: '₹4,999',
    monthlyUSD: '$67.99',
    annualUSD: '$67.99',
    monthlyAED: 'AED 249',
    annualAED: 'AED 249',
    monthlyKES: 'KES 9,500',
    annualKES: 'KES 9,500',
    badge: 'Enterprise',
    badgeColor: '#64748B',
    features: [
      'Multi-tenant architecture',
      'White label platform',
      'SSO / SAML 2.0',
      'Full REST + WebSocket API',
      '99.9% SLA guarantee',
      'Custom reporting & analytics',
      'Dedicated account manager',
      '24/7 phone support',
    ],
    cta: 'Contact Sales',
    ctaHref: '/enterprise#contact',
    accentColor: '#94A3B8',
    accentRgb: '148,163,184',
    isFeatured: false,
    isContact: true,
    isCustom: false,
  },
  {
    id: 'whiteLabel',
    name: 'White Label',
    tagline: 'Full rebrand for your business',
    emoji: '🎨',
    monthlyINR: 'Custom',
    annualINR: 'Custom',
    monthlyUSD: 'Custom',
    annualUSD: 'Custom',
    monthlyAED: 'Custom',
    annualAED: 'Custom',
    monthlyKES: 'Custom',
    annualKES: 'Custom',
    badge: 'Custom Pricing',
    badgeColor: '#F59E0B',
    features: [
      'Full brand customization',
      'Custom domain (gravity.yourschool.edu)',
      'Dedicated infrastructure',
      'Private cloud deployment',
      'Custom mobile app build',
      'Revenue sharing model',
      'Onboarding & training',
    ],
    cta: 'Contact Sales',
    ctaHref: '/enterprise#white-label',
    accentColor: '#F59E0B',
    accentRgb: '245,158,11',
    isFeatured: false,
    isContact: true,
    isCustom: true,
  },
]

/* ─────────────── Currency helpers ─────────────── */
const CURRENCY_CONFIG: Record<Currency, { label: string; flag: string }> = {
  INR: { label: 'INR ₹', flag: '🇮🇳' },
  USD: { label: 'USD $', flag: '🇺🇸' },
  AED: { label: 'AED', flag: '🇦🇪' },
  KES: { label: 'KES', flag: '🇰🇪' },
}

function getPlanPrice(plan: PlanTier, currency: Currency, cycle: BillingCycle): string {
  const key = `${cycle}${currency.charAt(0).toUpperCase()}${currency.slice(1).toLowerCase()}` as keyof PlanTier
  const val = plan[key]
  return typeof val === 'string' ? val : 'Custom'
}

/* ─────────────── Currency Toggle ─────────────── */
function CurrencyToggle({
  selected,
  setSelected,
}: {
  selected: Currency
  setSelected: (c: Currency) => void
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-full p-1"
      style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
    >
      {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((c) => (
        <button
          key={c}
          onClick={() => setSelected(c)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none"
          style={{
            background: selected === c ? 'linear-gradient(135deg, #D4A853, #F5C842)' : 'transparent',
            color: selected === c ? '#1A0F05' : 'var(--text-secondary)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {CURRENCY_CONFIG[c].flag} {c}
        </button>
      ))}
    </div>
  )
}

/* ─────────────── Pricing Card ─────────────── */
function PricingCard({
  plan,
  currency,
  cycle,
  index,
  inView,
}: {
  plan: PlanTier
  currency: Currency
  cycle: BillingCycle
  index: number
  inView: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const price = getPlanPrice(plan, currency, cycle)
  const isFree = price === '₹0' || price === '$0' || price === 'AED 0' || price === 'KES 0'
  const isCustom = price === 'Custom'
  const showSaveBadge = cycle === 'annual' && !isFree && !isCustom

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 + index * 0.07 }}
      whileHover={{ y: plan.isFeatured ? -12 : -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col rounded-2xl"
      style={{
        background: plan.isFeatured
          ? 'linear-gradient(145deg, rgba(212,168,83,0.07) 0%, var(--bg-surface) 40%)'
          : 'var(--bg-surface)',
        border: plan.isFeatured
          ? `2px solid ${plan.accentColor}`
          : `1px solid var(--border)`,
        boxShadow: plan.isFeatured
          ? hovered
            ? `0 0 70px rgba(${plan.accentRgb},0.4), 0 24px 64px rgba(0,0,0,0.3)`
            : `0 0 45px rgba(${plan.accentRgb},0.25), 0 12px 48px rgba(0,0,0,0.18)`
          : hovered
          ? `0 0 32px rgba(${plan.accentRgb},0.18), 0 18px 52px rgba(0,0,0,0.2)`
          : '0 2px 14px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.3s ease',
        ...(plan.isFeatured ? { transform: 'scale(1.02)' } : {}),
      }}
    >
      {/* Accent top border */}
      <div
        style={{
          height: '4px',
          borderRadius: '16px 16px 0 0',
          background: plan.isFeatured
            ? `linear-gradient(90deg, #B8760A, #D4A853, #F5C842, #D4A853, #B8760A)`
            : `linear-gradient(90deg, ${plan.accentColor}99, ${plan.accentColor})`,
        }}
      />

      {/* Most Popular animated badge */}
      {plan.isFeatured && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
          <motion.span
            animate={{ boxShadow: ['0 4px 16px rgba(212,168,83,0.4)', '0 4px 28px rgba(212,168,83,0.7)', '0 4px 16px rgba(212,168,83,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[10px] font-extrabold px-5 py-1.5 rounded-full uppercase tracking-widest inline-block"
            style={{
              background: 'linear-gradient(135deg, #B8760A, #D4A853, #F5C842)',
              color: '#1A0F05',
            }}
          >
            ★ MOST POPULAR
          </motion.span>
        </div>
      )}

      {/* Non-featured badge (top-right) */}
      {plan.badge && !plan.isFeatured && plan.badgeColor && (
        <div className="absolute top-4 right-4">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: `rgba(${plan.accentRgb},0.12)`,
              color: plan.accentColor,
              border: `1px solid rgba(${plan.accentRgb},0.28)`,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 pt-8">
        {/* Icon + name */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{plan.emoji}</span>
          <div>
            <h3
              className="text-lg font-bold leading-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: plan.isFeatured ? plan.accentColor : 'var(--text-primary)',
              }}
            >
              {plan.name}
            </h3>
            <p
              className="text-xs leading-tight mt-0.5"
              style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
            >
              {plan.tagline}
            </p>
          </div>
        </div>

        {/* Price block */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${plan.id}-${currency}-${cycle}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <div
              className="font-extrabold leading-none"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: plan.isFeatured ? plan.accentColor : 'var(--text-primary)',
                fontSize: isCustom ? '26px' : '32px',
              }}
            >
              {isCustom ? 'Custom Pricing' : isFree ? 'Free Forever' : price}
              {!isCustom && !isFree && (
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
                  /{cycle === 'annual' ? 'mo*' : 'mo'}
                </span>
              )}
            </div>

            {showSaveBadge && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(16,185,129,0.15)',
                  color: '#10B981',
                  border: '1px solid rgba(16,185,129,0.3)',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Save ~30% annually
              </motion.span>
            )}

            {isCustom && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                Contact us for a tailored quote
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Divider */}
        <div className="my-5" style={{ borderTop: '1px solid var(--border)' }} />

        {/* Feature list */}
        <ul className="flex-1 flex flex-col gap-2.5 mb-6">
          {plan.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2.5 text-sm">
              <span
                className="flex-shrink-0 mt-0.5 text-xs font-bold"
                style={{ color: plan.accentColor }}
              >
                ✓
              </span>
              <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>
                {feat}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <motion.a
          href={plan.ctaHref}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl text-sm font-bold text-center block focus:outline-none"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 0.2s ease',
            ...(plan.isFeatured
              ? {
                  background: 'linear-gradient(135deg, #D4A853, #F5C842)',
                  color: '#1A0F05',
                  boxShadow: hovered ? '0 6px 24px rgba(212,168,83,0.55)' : '0 3px 12px rgba(212,168,83,0.35)',
                }
              : plan.isContact
              ? {
                  background: 'transparent',
                  border: `1.5px solid ${plan.accentColor}`,
                  color: plan.accentColor,
                }
              : plan.id === 'free'
              ? {
                  background: 'rgba(107,114,128,0.12)',
                  border: '1.5px solid rgba(107,114,128,0.3)',
                  color: '#9CA3AF',
                }
              : {
                  background: `rgba(${plan.accentRgb},0.14)`,
                  border: `1.5px solid rgba(${plan.accentRgb},0.35)`,
                  color: plan.accentColor,
                }),
          }}
        >
          {plan.cta}
        </motion.a>
      </div>
    </motion.div>
  )
}

/* ─────────────── Comparison Rows ─────────────── */
const COMP_ROWS = [
  { feature: 'Family members', free: '3', premium: '10', familyPlus: '25', elderCare: '10', school: '500 students', enterprise: 'Unlimited', whiteLabel: 'Unlimited' },
  { feature: 'Real-time tracking', free: true, premium: true, familyPlus: true, elderCare: true, school: true, enterprise: true, whiteLabel: true },
  { feature: 'AI Guardian', free: false, premium: true, familyPlus: true, elderCare: true, school: false, enterprise: true, whiteLabel: true },
  { feature: 'SOS Emergency', free: 'Basic', premium: 'Priority', familyPlus: 'Priority', elderCare: 'Priority', school: 'Emergency mode', enterprise: 'Custom', whiteLabel: 'Custom' },
  { feature: 'Geofencing', free: '1 zone', premium: 'Unlimited', familyPlus: 'Unlimited', elderCare: 'Unlimited', school: 'Campus zones', enterprise: 'Unlimited', whiteLabel: 'Unlimited' },
  { feature: 'Driving safety', free: false, premium: true, familyPlus: true, elderCare: true, school: false, enterprise: true, whiteLabel: true },
  { feature: 'Fall detection', free: false, premium: false, familyPlus: false, elderCare: true, school: false, enterprise: 'Optional', whiteLabel: 'Optional' },
  { feature: 'Elder care module', free: false, premium: false, familyPlus: true, elderCare: true, school: false, enterprise: 'Optional', whiteLabel: 'Optional' },
  { feature: 'School bus tracking', free: false, premium: false, familyPlus: false, elderCare: false, school: true, enterprise: 'Optional', whiteLabel: 'Optional' },
  { feature: 'White label', free: false, premium: false, familyPlus: false, elderCare: false, school: false, enterprise: true, whiteLabel: true },
  { feature: 'API access', free: false, premium: false, familyPlus: false, elderCare: false, school: false, enterprise: true, whiteLabel: true },
  { feature: 'SLA guarantee', free: false, premium: false, familyPlus: false, elderCare: false, school: false, enterprise: '99.9%', whiteLabel: '99.9%' },
]

function CompCell({ value }: { value: string | boolean }) {
  if (value === true) return <span style={{ color: '#10B981', fontSize: '15px' }}>✓</span>
  if (value === false) return <span style={{ color: 'rgba(148,163,184,0.3)', fontSize: '14px' }}>—</span>
  return <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}>{value}</span>
}

/* ─────────────── FAQ ─────────────── */
const PRICING_FAQ = [
  {
    question: 'Is it really free?',
    answer: 'Yes, completely free forever — no credit card, no hidden fees. The Free plan gives you live location for up to 3 members, SOS alerts, basic geofencing, and check-ins.',
  },
  {
    question: 'Can I track without the person knowing?',
    answer: 'No — every member must accept an invitation and can see who views their location. Privacy hours let any member pause sharing. Gravity is built for consensual family safety.',
  },
  {
    question: 'Does it work offline?',
    answer: 'Gravity requires internet for live tracking. The last known location is always cached and viewable offline. SOS alerts are also sent via SMS as a backup when connectivity drops.',
  },
  {
    question: 'What happens during an SOS emergency?',
    answer: 'One tap instantly alerts all circle members with exact GPS location simultaneously. A loud alarm sounds continuously until acknowledged. Emergency services can be auto-dialed.',
  },
  {
    question: 'Can I switch plans later?',
    answer: 'Yes — upgrade or downgrade at any time. Upgrades activate immediately with prorated billing. Annual plans get a refund of unused months if you cancel.',
  },
  {
    question: 'Do you offer white label?',
    answer: 'Yes, we offer full white-label customization. Your brand, your domain, your app — we handle the infrastructure. Contact our team for custom pricing and onboarding.',
  },
  {
    question: 'What is the Enterprise SLA?',
    answer: '99.9% uptime guaranteed with a 1-hour response time for critical incidents. Enterprise plans include dedicated infrastructure, multi-region deployment, and 24/7 phone support.',
  },
  {
    question: 'Is there an API?',
    answer: 'Yes — Gravity offers a full REST + WebSocket API for enterprise and white-label customers. 50+ endpoints covering location, safety events, notifications, and analytics. Visit our API Marketplace for documentation.',
  },
  {
    question: 'Can white label use a custom domain?',
    answer: 'Absolutely. White-label deployments fully support custom domains such as gravity.yourschool.edu or safety.yourcompany.com, with SSL provisioned automatically.',
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
        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
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
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────── Main Component ─────────────── */
export default function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [currency, setCurrency] = useState<Currency>('INR')
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
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1100px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.12) 0%, rgba(184,114,10,0.04) 55%, transparent 75%)',
          filter: 'blur(70px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: 'easeOut' }}
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
            💛 Transparent Pricing
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Simple Plans,{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #D4A853, #F5C842, #D4A853)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Powerful Safety
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-base"
            style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
          >
            From free individual use to enterprise-grade white-label deployments. Start free, upgrade when your family needs more.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          {/* Billing toggle */}
          <div
            className="flex items-center gap-1 rounded-full p-1"
            style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
          >
            {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className="relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 focus:outline-none"
                style={{
                  background: cycle === c ? 'linear-gradient(135deg, #D4A853, #F5C842)' : 'transparent',
                  color: cycle === c ? '#1A0F05' : 'var(--text-secondary)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {c === 'monthly' ? 'Monthly' : 'Annual'}
                {c === 'annual' && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: cycle === 'annual' ? 'rgba(0,0,0,0.25)' : 'rgba(16,185,129,0.15)',
                      color: cycle === 'annual' ? '#1A0F05' : '#10B981',
                    }}
                  >
                    Save 30%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Currency toggle */}
          <CurrencyToggle selected={currency} setSelected={setCurrency} />
        </motion.div>

        {/* Cards grid — 4 cols on xl, 3 on lg, 2 on sm */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch overflow-visible pb-6">
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currency={currency}
              cycle={cycle}
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
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
            <span style={{ color: '#10B981', fontWeight: 600 }}>30-day money-back guarantee</span>
            {' '}· No credit card required for free plan · Cancel anytime
          </p>
          {cycle === 'annual' && (
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
              * Annual price shown per month — billed once per year (~30% savings vs monthly)
            </p>
          )}
        </motion.div>

        {/* Enterprise CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.75 }}
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
              Need a custom deployment?
            </h3>
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}
            >
              Schools, hospitals, logistics companies, and NGOs get white-label, SSO, dedicated infrastructure, and 99.9% SLAs.
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

        {/* Collapsible feature comparison */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <button
            onClick={() => setShowTable((v) => !v)}
            className="flex items-center gap-3 mx-auto mb-6 text-sm font-semibold focus:outline-none"
            style={{ color: 'var(--gold)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span>{showTable ? 'Hide' : 'Show'} Full Feature Comparison</span>
            <span style={{ display: 'inline-block', transform: showTable ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>▾</span>
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
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left px-5 py-4 text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Feature</th>
                        {PLANS.map((p) => (
                          <th
                            key={p.id}
                            className="text-center px-3 py-4 text-xs font-bold uppercase tracking-wide"
                            style={{ color: p.isFeatured ? p.accentColor : 'var(--text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMP_ROWS.map((row, i) => (
                        <tr
                          key={row.feature}
                          style={{
                            borderBottom: i < COMP_ROWS.length - 1 ? '1px solid var(--border)' : 'none',
                            background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface2)',
                          }}
                        >
                          <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}>{row.feature}</td>
                          {PLANS.map((p) => (
                            <td key={p.id} className="px-3 py-3.5 text-center">
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

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.85 }}
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
