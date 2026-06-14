'use client'
import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CreditCard,
  Smartphone,
  Shield,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Lock,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = '#D4A853'
const BG = '#0B0D13'
const SURFACE = '#111420'
const SURFACE2 = '#161926'
const BORDER = 'rgba(212,168,83,0.15)'

const PLANS = [
  {
    id: 2,
    name: 'Family',
    monthlyInr: 199,
    annualInr: 159,
    monthlyUsd: 2.49,
    annualUsd: 1.99,
    features: [
      'Track up to 4 family members',
      'Real-time GPS location',
      'Basic geofencing (3 zones)',
      'SOS emergency alerts',
    ],
  },
  {
    id: 3,
    name: 'Care',
    monthlyInr: 299,
    annualInr: 239,
    monthlyUsd: 3.49,
    annualUsd: 2.79,
    features: [
      'Track up to 6 members',
      'Elderly & child safety mode',
      'Advanced geofencing (10 zones)',
      'Fall detection & health alerts',
    ],
  },
  {
    id: 4,
    name: 'Family Plus',
    monthlyInr: 499,
    annualInr: 399,
    monthlyUsd: 5.99,
    annualUsd: 4.79,
    popular: true,
    features: [
      'Track up to 10 members',
      'Driving safety & speed alerts',
      'Unlimited geofencing zones',
      'Priority 24/7 support',
    ],
  },
  {
    id: 5,
    name: 'Ultimate',
    monthlyInr: 799,
    annualInr: 639,
    monthlyUsd: 9.99,
    annualUsd: 7.99,
    features: [
      'Unlimited family members',
      'AI-powered safety insights',
      'White-glove onboarding',
      'Dedicated account manager',
    ],
  },
]

type Plan = (typeof PLANS)[number]
type BillingCycle = 'monthly' | 'annual'
type PaymentMethod = 'razorpay' | 'card' | 'applepay' | 'googlepay'
type PageState = 'checkout' | 'processing' | 'success' | 'error'

// ─── Declare Razorpay on window ────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: any
  }
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('gravity_token')
}

async function apiFetch(path: string, body: object): Promise<any> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const existing = document.getElementById('razorpay-script')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = reject
    document.body.appendChild(script)
  })
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? GOLD : 'transparent',
        color: active ? '#0B0D13' : 'rgba(255,255,255,0.55)',
        border: `1px solid ${active ? GOLD : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 8,
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  maxLength,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
  maxLength?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500, letterSpacing: '0.04em' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: SURFACE,
          border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: 10,
          padding: '11px 14px',
          color: '#fff',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.2s',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  )
}

function ProcessingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11,13,19,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      >
        <Loader2 size={48} color={GOLD} />
      </motion.div>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>Processing your payment…</p>
    </motion.div>
  )
}

function SuccessScreen({ plan, onDashboard, onReceipt }: { plan: Plan; onDashboard: () => void; onReceipt: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        minHeight: '100vh',
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          background: SURFACE,
          border: `1px solid rgba(34,197,94,0.3)`,
          borderRadius: 20,
          padding: '48px 40px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(34,197,94,0.08)',
        }}
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.12)',
            border: '2px solid rgba(34,197,94,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
          }}
        >
          <CheckCircle2 size={40} color='#22c55e' />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 12 }}
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 8 }}
        >
          Your <span style={{ color: GOLD, fontWeight: 600 }}>{plan.name}</span> subscription is now active.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 36 }}
        >
          Check your email for confirmation and receipt.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <button
            onClick={onDashboard}
            style={{
              background: GOLD,
              color: '#0B0D13',
              border: 'none',
              borderRadius: 10,
              padding: '14px 24px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            Go to Dashboard <ChevronRight size={16} />
          </button>

          <button
            onClick={onReceipt}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            View Receipt
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Inner checkout content (uses useSearchParams, wrapped in Suspense) ────────

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Resolve initial plan from URL
  const initialPlanId = parseInt(searchParams.get('plan') || '4', 10)
  const initialCycle = (searchParams.get('cycle') || 'monthly') as BillingCycle

  const [selectedPlan, setSelectedPlan] = useState<Plan>(
    () => PLANS.find((p) => p.id === initialPlanId) || PLANS[2]
  )
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialCycle)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay')
  const [pageState, setPageState] = useState<PageState>('checkout')
  const [errorMsg, setErrorMsg] = useState<string>('')

  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  // Derived pricing
  const priceInr = billingCycle === 'monthly' ? selectedPlan.monthlyInr : selectedPlan.annualInr
  const priceUsd = billingCycle === 'monthly' ? selectedPlan.monthlyUsd : selectedPlan.annualUsd
  const savingsInr = selectedPlan.monthlyInr - selectedPlan.annualInr
  const savingsPct = Math.round((savingsInr / selectedPlan.monthlyInr) * 100)

  const isIndianFlow = paymentMethod === 'razorpay'

  // ── Razorpay flow ─────────────────────────────────────────────────────────

  async function handleRazorpay() {
    setErrorMsg('')
    setPageState('processing')
    try {
      await loadRazorpayScript()
      const order = await apiFetch('/payments/razorpay/create-order', {
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
      })

      setPageState('checkout') // let Razorpay modal take over visually

      const rzp = new window.Razorpay({
        key: order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'TRACKALWAYS',
        description: `${selectedPlan.name} Plan — ${billingCycle}`,
        order_id: order.order_id,
        image: '/logo.png',
        prefill: { email: '', contact: '' },
        theme: { color: GOLD },
        handler: async (response: any) => {
          setPageState('processing')
          try {
            await apiFetch('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: selectedPlan.id,
              billing_cycle: billingCycle,
            })
            setPageState('success')
          } catch (err: any) {
            setErrorMsg(err.message || 'Payment verification failed.')
            setPageState('error')
          }
        },
        modal: {
          ondismiss: () => {
            setPageState('checkout')
          },
        },
      })
      rzp.open()
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not initialise Razorpay. Please try again.')
      setPageState('error')
    }
  }

  // ── Stripe / Card flow ────────────────────────────────────────────────────

  async function handleStripeCard() {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      setErrorMsg('Please fill in all card details.')
      setPageState('error')
      return
    }
    setErrorMsg('')
    setPageState('processing')
    try {
      const intent = await apiFetch('/stripe/create-payment-intent', {
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        currency: 'usd',
      })
      await apiFetch('/stripe/confirm', {
        payment_intent_id: intent.payment_intent_id,
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
      })
      setPageState('success')
    } catch (err: any) {
      setErrorMsg(err.message || 'Card payment failed. Please try again.')
      setPageState('error')
    }
  }

  // ── Apple / Google Pay (delegates to Stripe) ──────────────────────────────

  async function handleWalletPay(label: string) {
    setErrorMsg('')
    setPageState('processing')
    try {
      const intent = await apiFetch('/stripe/create-payment-intent', {
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
        currency: 'usd',
        payment_method_type: label === 'apple' ? 'apple_pay' : 'google_pay',
      })
      await apiFetch('/stripe/confirm', {
        payment_intent_id: intent.payment_intent_id,
        plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
      })
      setPageState('success')
    } catch (err: any) {
      setErrorMsg(err.message || `${label === 'apple' ? 'Apple' : 'Google'} Pay failed. Please try again.`)
      setPageState('error')
    }
  }

  // ── Format card number with spaces ────────────────────────────────────────

  function formatCardNumber(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`
    return digits
  }

  // ── Success / Processing screens ──────────────────────────────────────────

  if (pageState === 'success') {
    return (
      <SuccessScreen
        plan={selectedPlan}
        onDashboard={() => router.push('/live-tracking')}
        onReceipt={() => router.push('/billing')}
      />
    )
  }

  // ── Main checkout UI ──────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff' }}>
      <Navbar />

      {/* Processing overlay */}
      <AnimatePresence>
        {pageState === 'processing' && <ProcessingOverlay />}
      </AnimatePresence>

      {/* Page header */}
      <div
        style={{
          borderBottom: `1px solid ${BORDER}`,
          background: SURFACE,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href='/pricing'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(255,255,255,0.55)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
          >
            <ArrowLeft size={16} />
            Back to Pricing
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            <Lock size={14} color={GOLD} />
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {pageState === 'error' && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 0,
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={16} color='#ef4444' />
            <span style={{ color: '#fca5a5', fontSize: 14 }}>{errorMsg}</span>
            <button
              onClick={() => setPageState('checkout')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                marginLeft: 8,
              }}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column layout */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '48px 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr)',
          gap: 32,
        }}
        className='checkout-grid'
      >
        {/* ── LEFT: Order Summary ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ gridColumn: 1 }}
          className='order-summary-col'
        >
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: '28px 24px',
              position: 'sticky',
              top: 80,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Order Summary</h2>

            {/* Plan selector */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
                Selected Plan
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      background: selectedPlan.id === plan.id ? `rgba(212,168,83,0.12)` : 'transparent',
                      border: `1px solid ${selectedPlan.id === plan.id ? GOLD : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 8,
                      padding: '6px 12px',
                      color: selectedPlan.id === plan.id ? GOLD : 'rgba(255,255,255,0.5)',
                      fontSize: 13,
                      fontWeight: selectedPlan.id === plan.id ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    {plan.name}
                    {plan.popular && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: GOLD,
                          color: '#0B0D13',
                          fontSize: 9,
                          fontWeight: 700,
                          borderRadius: 4,
                          padding: '1px 4px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        HOT
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing cycle toggle */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
                Billing Cycle
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  background: SURFACE2,
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: 4,
                  gap: 4,
                }}
              >
                {(['monthly', 'annual'] as BillingCycle[]).map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setBillingCycle(cycle)}
                    style={{
                      background: billingCycle === cycle ? GOLD : 'transparent',
                      color: billingCycle === cycle ? '#0B0D13' : 'rgba(255,255,255,0.55)',
                      border: 'none',
                      borderRadius: 7,
                      padding: '7px 16px',
                      fontSize: 13,
                      fontWeight: billingCycle === cycle ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'capitalize',
                    }}
                  >
                    {cycle}
                    {cycle === 'annual' && billingCycle !== 'annual' && (
                      <span style={{ marginLeft: 6, color: '#4ade80', fontSize: 11, fontWeight: 700 }}>
                        −{savingsPct}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price display */}
            <div
              style={{
                background: SURFACE2,
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: '16px 18px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <span style={{ fontSize: 32, fontWeight: 800, color: GOLD }}>
                    {isIndianFlow ? `₹${priceInr}` : `$${priceUsd}`}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginLeft: 4 }}>/ mo</span>
                </div>
                {billingCycle === 'annual' && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      background: 'rgba(74,222,128,0.12)',
                      border: '1px solid rgba(74,222,128,0.3)',
                      color: '#4ade80',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 6,
                      padding: '3px 8px',
                    }}
                  >
                    Save {savingsPct}%
                  </motion.span>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                {billingCycle === 'annual'
                  ? `Billed annually — ${isIndianFlow ? `₹${priceInr * 12}` : `$${(priceUsd * 12).toFixed(2)}`}/year`
                  : 'Billed monthly, cancel anytime'}
              </p>
            </div>

            {/* Features */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
                What's Included
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedPlan.features.map((feat, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={15} color='#4ade80' style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(74,222,128,0.06)',
                  border: '1px solid rgba(74,222,128,0.15)',
                  borderRadius: 8,
                  padding: '8px 12px',
                }}
              >
                <Shield size={14} color='#4ade80' />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>30-day money-back guarantee</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: `rgba(212,168,83,0.06)`,
                  border: `1px solid rgba(212,168,83,0.15)`,
                  borderRadius: 8,
                  padding: '8px 12px',
                }}
              >
                <Lock size={14} color={GOLD} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: Payment Form ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className='payment-form-col'
        >
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: '28px 24px',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Payment Method</h2>

            {/* Payment method tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              <TabButton active={paymentMethod === 'razorpay'} onClick={() => setPaymentMethod('razorpay')}>
                🇮🇳 Razorpay
              </TabButton>
              <TabButton active={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')}>
                <CreditCard size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Card
              </TabButton>
              <TabButton active={paymentMethod === 'applepay'} onClick={() => setPaymentMethod('applepay')}>
                {/* Apple logo */}
                <svg width='13' height='13' viewBox='0 0 24 24' fill='currentColor' style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }}>
                  <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
                </svg>
                Apple Pay
              </TabButton>
              <TabButton active={paymentMethod === 'googlepay'} onClick={() => setPaymentMethod('googlepay')}>
                <Smartphone size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Google Pay
              </TabButton>
            </div>

            {/* Tab content */}
            <AnimatePresence mode='wait'>

              {/* ── TAB 1: Razorpay ── */}
              {paymentMethod === 'razorpay' && (
                <motion.div
                  key='razorpay'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                    Pay securely using UPI, Net Banking, Debit/Credit cards via Razorpay.
                  </p>

                  {/* Payment badges */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                    {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking'].map((badge) => (
                      <span
                        key={badge}
                        style={{
                          background: SURFACE2,
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.55)',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={handleRazorpay}
                    style={{
                      background: GOLD,
                      color: '#0B0D13',
                      border: 'none',
                      borderRadius: 12,
                      padding: '15px 24px',
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      transition: 'opacity 0.2s, transform 0.15s',
                      boxShadow: `0 4px 24px rgba(212,168,83,0.25)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <Lock size={16} />
                    Pay ₹{priceInr} with Razorpay
                  </button>

                  <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 14 }}>
                    Powered by Razorpay · Secured by 256-bit SSL
                  </p>
                </motion.div>
              )}

              {/* ── TAB 2: Card ── */}
              {paymentMethod === 'card' && (
                <motion.div
                  key='card'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <Input
                    label='Card Number'
                    placeholder='1234 5678 9012 3456'
                    value={cardNumber}
                    onChange={(v) => setCardNumber(formatCardNumber(v))}
                    maxLength={19}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Input
                      label='Expiry Date'
                      placeholder='MM / YY'
                      value={cardExpiry}
                      onChange={(v) => setCardExpiry(formatExpiry(v))}
                      maxLength={7}
                    />
                    <Input
                      label='CVV'
                      placeholder='•••'
                      value={cardCvv}
                      onChange={setCardCvv}
                      type='password'
                      maxLength={4}
                    />
                  </div>

                  <Input
                    label='Cardholder Name'
                    placeholder='Name as on card'
                    value={cardName}
                    onChange={setCardName}
                  />

                  <button
                    onClick={handleStripeCard}
                    style={{
                      background: GOLD,
                      color: '#0B0D13',
                      border: 'none',
                      borderRadius: 12,
                      padding: '15px 24px',
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      transition: 'opacity 0.2s, transform 0.15s',
                      boxShadow: `0 4px 24px rgba(212,168,83,0.25)`,
                      marginTop: 4,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <Lock size={16} />
                    Pay ${priceUsd.toFixed(2)} securely
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                    <CreditCard size={13} color='rgba(255,255,255,0.3)' />
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                      We use Stripe for secure card processing
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── TAB 3: Apple Pay ── */}
              {paymentMethod === 'applepay' && (
                <motion.div
                  key='applepay'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 8 }}
                >
                  <button
                    onClick={() => handleWalletPay('apple')}
                    style={{
                      background: '#000',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 12,
                      padding: '16px 32px',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      transition: 'opacity 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.85'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Apple logo SVG */}
                    <svg width='22' height='22' viewBox='0 0 24 24' fill='white'>
                      <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
                    </svg>
                    <span style={{ color: '#fff', fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
                      Pay with Apple Pay
                    </span>
                  </button>

                  <div
                    style={{
                      background: SURFACE2,
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <AlertCircle size={14} color='rgba(255,255,255,0.35)' style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5 }}>
                      Works on Safari on iPhone and Mac. Apple Pay uses biometric authentication for a fast, secure checkout experience.
                    </p>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center' }}>
                    Amount: ${priceUsd.toFixed(2)}/mo · Powered by Stripe
                  </p>
                </motion.div>
              )}

              {/* ── TAB 4: Google Pay ── */}
              {paymentMethod === 'googlepay' && (
                <motion.div
                  key='googlepay'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 8 }}
                >
                  <button
                    onClick={() => handleWalletPay('google')}
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 12,
                      padding: '16px 32px',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    {/* Google Pay text logo */}
                    <span style={{ fontFamily: 'sans-serif', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>
                      <span style={{ color: '#4285F4' }}>G</span>
                      <span style={{ color: '#EA4335' }}>o</span>
                      <span style={{ color: '#FBBC05' }}>o</span>
                      <span style={{ color: '#4285F4' }}>g</span>
                      <span style={{ color: '#34A853' }}>l</span>
                      <span style={{ color: '#EA4335' }}>e</span>
                      <span style={{ color: '#5F6368', marginLeft: 6 }}>Pay</span>
                    </span>
                  </button>

                  <div
                    style={{
                      background: SURFACE2,
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    <AlertCircle size={14} color='rgba(255,255,255,0.35)' style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5 }}>
                      Works on Chrome on Android and desktop. Google Pay uses your saved payment methods for a faster checkout.
                    </p>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, textAlign: 'center' }}>
                    Amount: ${priceUsd.toFixed(2)}/mo · Powered by Stripe
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom disclaimer */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 20, lineHeight: 1.6 }}>
            By completing your purchase, you agree to our{' '}
            <Link href='/terms' style={{ color: 'rgba(212,168,83,0.7)', textDecoration: 'none' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href='/privacy' style={{ color: 'rgba(212,168,83,0.7)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            . Subscriptions auto-renew unless cancelled.
          </p>
        </motion.div>
      </div>

      {/* Responsive grid styles */}
      <style>{`
        @media (min-width: 900px) {
          .checkout-grid {
            grid-template-columns: 380px 1fr !important;
          }
          .order-summary-col {
            grid-column: 1 !important;
          }
          .payment-form-col {
            grid-column: 2 !important;
          }
        }
      `}</style>
    </div>
  )
}

// ─── Page export (wraps in Suspense for useSearchParams) ──────────────────────

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: BG,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader2 size={40} color={GOLD} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
