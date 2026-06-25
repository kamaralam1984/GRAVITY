'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

type Currency = 'INR' | 'USD' | 'AED' | 'KES'
type BillingCycle = 'monthly' | 'annual'

/* ── Free plan features (50%) ─────────────────────────────────── */
const FREE_FEATURES = [
  '3 family members',
  'Real-time location tracking',
  'Basic SOS emergency alert',
  'Check-in & arrival alerts',
  '1 geofence zone',
  '7-day location history',
  'Battery level monitoring',
]

/* ── Paid plan features (100% — everything) ───────────────────── */
const PAID_FEATURES = [
  'Unlimited family members',
  'Real-time GPS (high precision)',
  'AI Guardian smart alerts',
  'Priority SOS + emergency services auto-dial',
  'Unlimited geofences',
  '90-day location history',
  'Driving safety AI scoring',
  'Child safety mode',
  'Elder care + fall detection',
  'Health monitoring dashboard',
  'Family group chat',
  'Wearable device sync',
  'Smart home integration',
  'School bus live tracking',
  'Custom reports & analytics',
  'API access (REST + WebSocket)',
  '24/7 priority support',
]

const PRICES: Record<Currency, { monthly: string; annual: string; annualNote: string }> = {
  INR: { monthly: '₹299',     annual: '₹2,499',    annualNote: '~₹208/mo' },
  USD: { monthly: '$3.99',    annual: '$32.99',     annualNote: '~$2.75/mo' },
  AED: { monthly: 'AED 14',   annual: 'AED 115',   annualNote: '~AED 9.6/mo' },
  KES: { monthly: 'KES 550',  annual: 'KES 4,599', annualNote: '~KES 383/mo' },
}

const CURRENCY_FLAGS: Record<Currency, string> = { INR: '🇮🇳', USD: '🇺🇸', AED: '🇦🇪', KES: '🇰🇪' }

const COMPARE_ROWS = [
  { feature: 'Family members',       free: '3',       paid: 'Unlimited' },
  { feature: 'Real-time tracking',   free: true,      paid: true },
  { feature: 'SOS emergency',        free: 'Basic',   paid: 'Priority + auto-dial' },
  { feature: 'Geofencing',           free: '1 zone',  paid: 'Unlimited zones' },
  { feature: 'Location history',     free: '7 days',  paid: '90 days' },
  { feature: 'AI Guardian alerts',   free: false,     paid: true },
  { feature: 'Driving safety',       free: false,     paid: true },
  { feature: 'Child safety mode',    free: false,     paid: true },
  { feature: 'Elder care / fall det',free: false,     paid: true },
  { feature: 'Health monitoring',    free: false,     paid: true },
  { feature: 'Family group chat',    free: false,     paid: true },
  { feature: 'Wearable sync',        free: false,     paid: true },
  { feature: 'School bus tracking',  free: false,     paid: true },
  { feature: 'API access',           free: false,     paid: true },
  { feature: '24/7 priority support',free: false,     paid: true },
]

const FAQ = [
  {
    q: 'Is the Free plan really free forever?',
    a: 'Yes, completely free — no credit card, no hidden fees, no trial expiry. The Free plan gives you live location for 3 members, basic SOS, check-ins, 1 geofence, and 7-day history.',
  },
  {
    q: 'What is included in the Paid plan?',
    a: 'Everything — unlimited members, AI Guardian, priority SOS, unlimited geofences, driving safety AI, elder care, fall detection, health monitoring, family chat, wearable sync, school bus tracking, API access, and 24/7 support.',
  },
  {
    q: 'Can I upgrade from Free to Paid at any time?',
    a: 'Yes, you can upgrade instantly. All your data, family members, and settings carry over. Annual plan saves ~30% compared to monthly.',
  },
  {
    q: 'Can I track someone without them knowing?',
    a: 'No — every member accepts an invitation and can see who views their location. Privacy hours let any member pause sharing. KVL Track is built for consensual family safety.',
  },
  {
    q: 'Does it work offline?',
    a: 'KVL Track requires internet for live tracking. The last known location is always cached offline. SOS alerts also send via SMS as a backup when connectivity drops.',
  },
  {
    q: 'What happens during an SOS emergency?',
    a: 'One tap instantly alerts all family members with exact GPS location. A loud alarm sounds continuously. On the Paid plan, emergency services can be auto-dialed.',
  },
]

function Cell({ val }: { val: string | boolean }) {
  if (val === true)  return <span style={{ color: '#10B981', fontSize: 16 }}>✓</span>
  if (val === false) return <span style={{ color: 'rgba(148,163,184,0.3)', fontSize: 14 }}>—</span>
  return <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: "'Inter',sans-serif" }}>{val}</span>
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none">
        <span className="font-semibold text-sm pr-4" style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{q}</span>
        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all"
          style={{ border: open ? '1.5px solid var(--gold)' : '1px solid var(--border-strong)', background: open ? 'rgba(212,168,83,0.12)' : 'transparent', color: open ? 'var(--gold)' : 'var(--text-muted)' }}>
          {open ? '−' : '+'}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="c" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden">
            <p className="px-6 pb-5 pt-3 text-sm leading-relaxed" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: "'Inter',sans-serif" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PricingSection() {
  const [cycle, setCycle]       = useState<BillingCycle>('monthly')
  const [currency, setCurrency] = useState<Currency>('INR')
  const [showTable, setShowTable] = useState(false)
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const paidPrice = cycle === 'annual' ? PRICES[currency].annual : PRICES[currency].monthly

  return (
    <section id="pricing" ref={ref} className="py-24 relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>

      {/* Ambient glow */}
      <div className="absolute pointer-events-none" style={{
        top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '900px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(212,168,83,0.13) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: 'var(--gold)', border: '1px solid rgba(212,168,83,0.35)', background: 'rgba(212,168,83,0.07)' }}>
            💛 Simple Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text-primary)' }}>
            Two Plans.{' '}
            <span style={{ background: 'linear-gradient(90deg,#D4A853,#F5C842,#D4A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Zero Confusion.
            </span>
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-base" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter',sans-serif" }}>
            Start free with core safety features. Upgrade to Paid when your family needs everything.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.1 }} className="flex flex-wrap items-center justify-center gap-4 mb-14">
          {/* Billing toggle */}
          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}>
            {(['monthly', 'annual'] as BillingCycle[]).map(c => (
              <button key={c} onClick={() => setCycle(c)} className="relative px-5 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none flex items-center gap-2"
                style={{ background: cycle === c ? 'linear-gradient(135deg,#D4A853,#F5C842)' : 'transparent', color: cycle === c ? '#1A0F05' : 'var(--text-secondary)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {c === 'monthly' ? 'Monthly' : 'Annual'}
                {c === 'annual' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: cycle === 'annual' ? 'rgba(0,0,0,0.22)' : 'rgba(16,185,129,0.15)', color: cycle === 'annual' ? '#1A0F05' : '#10B981' }}>
                    Save 30%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Currency toggle */}
          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}>
            {(Object.keys(CURRENCY_FLAGS) as Currency[]).map(c => (
              <button key={c} onClick={() => setCurrency(c)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus:outline-none"
                style={{ background: currency === c ? 'linear-gradient(135deg,#D4A853,#F5C842)' : 'transparent', color: currency === c ? '#1A0F05' : 'var(--text-secondary)', fontFamily: "'Inter',sans-serif" }}>
                {CURRENCY_FLAGS[c]} {c}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-8 items-start max-w-3xl mx-auto">

          {/* ── Free Card ── */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.15 }}
            className="relative flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg,#6B7280,#9CA3AF)' }} />
            <div className="p-7 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🆓</span>
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text-primary)' }}>Free</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Inter',sans-serif" }}>Core safety, always free</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="text-4xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text-primary)' }}>Free Forever</div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: "'Inter',sans-serif" }}>No credit card · No expiry</p>
              </div>

              <div className="my-5" style={{ borderTop: '1px solid var(--border)' }} />

              <ul className="flex-1 flex flex-col gap-2.5 mb-6">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="flex-shrink-0 mt-0.5 text-xs font-bold" style={{ color: '#6B7280' }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter',sans-serif" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <a href="/#download" className="w-full py-3 rounded-xl text-sm font-bold text-center block transition-all hover:opacity-90"
                style={{ background: 'rgba(107,114,128,0.12)', border: '1.5px solid rgba(107,114,128,0.3)', color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Start Free
              </a>
            </div>
          </motion.div>

          {/* ── Paid Card ── */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.25 }}
            whileHover={{ y: -8 }}
            className="relative flex flex-col rounded-2xl overflow-visible"
            style={{ background: 'linear-gradient(145deg,rgba(212,168,83,0.07) 0%,var(--bg-surface) 40%)', border: '2px solid #D4A853', boxShadow: '0 0 50px rgba(212,168,83,0.22), 0 12px 48px rgba(0,0,0,0.18)', transform: 'scale(1.02)' }}>

            {/* Most Popular badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
              <motion.span
                animate={{ boxShadow: ['0 4px 16px rgba(212,168,83,0.4)', '0 4px 28px rgba(212,168,83,0.7)', '0 4px 16px rgba(212,168,83,0.4)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[10px] font-extrabold px-5 py-1.5 rounded-full uppercase tracking-widest inline-block"
                style={{ background: 'linear-gradient(135deg,#B8760A,#D4A853,#F5C842)', color: '#1A0F05' }}>
                ★ RECOMMENDED
              </motion.span>
            </div>

            <div style={{ height: 4, borderRadius: '16px 16px 0 0', background: 'linear-gradient(90deg,#B8760A,#D4A853,#F5C842,#D4A853,#B8760A)' }} />
            <div className="p-7 flex flex-col flex-1 pt-9">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🌟</span>
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#D4A853' }}>Paid</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'Inter',sans-serif" }}>Every feature, unlimited</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={`${currency}-${cycle}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="mt-5">
                  <div className="text-4xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#D4A853' }}>
                    {paidPrice}
                    <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
                      /{cycle === 'annual' ? 'yr' : 'mo'}
                    </span>
                  </div>
                  {cycle === 'annual' && (
                    <motion.span initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', fontFamily: "'Inter',sans-serif" }}>
                      {PRICES[currency].annualNote} · Save ~30%
                    </motion.span>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="my-5" style={{ borderTop: '1px solid rgba(212,168,83,0.2)' }} />

              <ul className="flex-1 flex flex-col gap-2 mb-6">
                {PAID_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="flex-shrink-0 mt-0.5 text-xs font-bold" style={{ color: '#D4A853' }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: "'Inter',sans-serif" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <motion.a href="/signup" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-center block"
                style={{ background: 'linear-gradient(135deg,#D4A853,#F5C842)', color: '#1A0F05', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 4px 18px rgba(212,168,83,0.4)' }}>
                Get Started →
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Guarantee */}
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm" style={{ color: 'var(--text-muted)', fontFamily: "'Inter',sans-serif" }}>
          <span style={{ color: '#10B981', fontWeight: 600 }}>30-day money-back guarantee</span>
          {' '}· No credit card for Free plan · Cancel anytime
          {cycle === 'annual' && <><br /><span className="text-xs">* Annual price billed once per year</span></>}
        </motion.p>

        {/* Comparison table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.55 }} className="mt-16">
          <button onClick={() => setShowTable(v => !v)}
            className="flex items-center gap-3 mx-auto mb-6 text-sm font-semibold focus:outline-none"
            style={{ color: 'var(--gold)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <span>{showTable ? 'Hide' : 'Show'} Full Feature Comparison</span>
            <span style={{ display: 'inline-block', transform: showTable ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>▾</span>
          </button>

          <AnimatePresence>
            {showTable && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                <div className="overflow-x-auto rounded-2xl max-w-2xl mx-auto" style={{ border: '1px solid var(--border)' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left px-5 py-4 text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Feature</th>
                        <th className="text-center px-5 py-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Free</th>
                        <th className="text-center px-5 py-4 text-xs font-bold uppercase tracking-wide" style={{ color: '#D4A853', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE_ROWS.map((row, i) => (
                        <tr key={row.feature} style={{ borderBottom: i < COMPARE_ROWS.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-surface2)' }}>
                          <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'Inter',sans-serif" }}>{row.feature}</td>
                          <td className="px-5 py-3 text-center"><Cell val={row.free} /></td>
                          <td className="px-5 py-3 text-center"><Cell val={row.paid} /></td>
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
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }} className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h3>
          <p className="text-sm text-center mb-8" style={{ color: 'var(--text-muted)', fontFamily: "'Inter',sans-serif" }}>
            Everything you need to know before getting started.
          </p>
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {FAQ.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
