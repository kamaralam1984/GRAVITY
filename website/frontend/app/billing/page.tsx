'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  CreditCard,
  Calendar,
  Download,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Crown,
  RefreshCw,
  AlertTriangle,
  Package,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0B0D13',
  surface: '#111420',
  elevated: '#161926',
  gold: '#D4A853',
  goldDim: 'rgba(212,168,83,0.12)',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(212,168,83,0.3)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#4B5563',
  green: '#10B981',
  greenDim: 'rgba(16,185,129,0.12)',
  red: '#EF4444',
  redDim: 'rgba(239,68,68,0.12)',
  yellow: '#F59E0B',
  yellowDim: 'rgba(245,158,11,0.12)',
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Subscription {
  id: string
  plan_name: string
  status: 'active' | 'cancelled' | 'paused' | 'trial'
  billing_cycle: 'monthly' | 'annual'
  amount: number
  currency: string
  start_date: string
  end_date: string
  auto_renew: boolean
}

interface Invoice {
  id: string
  date: string
  desc: string
  amount: string
  method: string
  status: 'Paid' | 'Failed' | 'Refunded'
}

interface SavedCard {
  id: string
  network: 'Visa' | 'Mastercard'
  last4: string
  expiry: string
  isDefault: boolean
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', date: 'Jun 12, 2026', desc: 'Family Plus - Monthly', amount: '₹499', method: 'UPI', status: 'Paid' },
  { id: 'INV-002', date: 'May 12, 2026', desc: 'Family Plus - Monthly', amount: '₹499', method: 'Razorpay', status: 'Paid' },
  { id: 'INV-003', date: 'Apr 12, 2026', desc: 'Family Plan - Monthly', amount: '₹199', method: 'Card', status: 'Paid' },
]

const MOCK_CARDS: SavedCard[] = [
  { id: 'card-1', network: 'Visa', last4: '4242', expiry: '12/27', isDefault: true },
  { id: 'card-2', network: 'Mastercard', last4: '5555', expiry: '08/26', isDefault: false },
]

// ── Toast System ─────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium"
            style={{
              background: t.type === 'success' ? COLORS.greenDim : COLORS.redDim,
              border: `1px solid ${t.type === 'success' ? COLORS.green : COLORS.red}44`,
              color: t.type === 'success' ? COLORS.green : COLORS.red,
              backdropFilter: 'blur(12px)',
              minWidth: 240,
            }}
          >
            {t.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span style={{ color: COLORS.textPrimary }}>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="w-full max-w-md rounded-2xl p-8"
            style={{ background: COLORS.elevated, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: COLORS.redDim, border: `1px solid ${COLORS.red}44` }}
              >
                <AlertTriangle size={28} style={{ color: COLORS.red }} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                  Cancel Subscription?
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
                  You'll keep access to all premium features until the end of your current billing period.
                  After that, your account will revert to the Free plan.
                </p>
              </div>
              <div
                className="w-full rounded-xl p-4 text-sm"
                style={{ background: COLORS.yellowDim, border: `1px solid ${COLORS.yellow}44`, color: COLORS.yellow }}
              >
                You won't be charged again after cancellation.
              </div>
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110"
                  style={{ background: COLORS.surface, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` }}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110 flex items-center justify-center gap-2"
                  style={{ background: COLORS.red, color: '#fff', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                  {loading ? 'Cancelling…' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: COLORS.elevated, ...style }}
    />
  )
}

function PlanSkeleton() {
  return (
    <div
      className="rounded-2xl p-8"
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton style={{ width: 160, height: 28 }} />
          <Skeleton style={{ width: 100, height: 20 }} />
          <Skeleton style={{ width: 200, height: 16 }} />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton style={{ width: 140, height: 44 }} />
          <Skeleton style={{ width: 140, height: 44 }} />
        </div>
      </div>
      <div className="mt-6">
        <Skeleton style={{ width: '100%', height: 8 }} />
      </div>
    </div>
  )
}

function InvoiceSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: COLORS.elevated }}>
          <Skeleton style={{ width: 80, height: 16 }} />
          <Skeleton style={{ flex: 1, height: 16 }} />
          <Skeleton style={{ width: 60, height: 16 }} />
          <Skeleton style={{ width: 60, height: 24 }} />
          <Skeleton style={{ width: 32, height: 32 }} />
        </div>
      ))}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function getTotalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    active:    { color: COLORS.green,  bg: COLORS.greenDim,  icon: <CheckCircle2 size={12} />, label: 'Active' },
    cancelled: { color: COLORS.red,    bg: COLORS.redDim,    icon: <XCircle size={12} />,      label: 'Cancelled' },
    paused:    { color: COLORS.yellow, bg: COLORS.yellowDim, icon: <Clock size={12} />,         label: 'Paused' },
    trial:     { color: COLORS.gold,   bg: COLORS.goldDim,   icon: <Zap size={12} />,           label: 'Trial' },
    Paid:      { color: COLORS.green,  bg: COLORS.greenDim,  icon: <CheckCircle2 size={12} />, label: 'Paid' },
    Failed:    { color: COLORS.red,    bg: COLORS.redDim,    icon: <XCircle size={12} />,      label: 'Failed' },
    Refunded:  { color: COLORS.yellow, bg: COLORS.yellowDim, icon: <RefreshCw size={12} />,    label: 'Refunded' },
  }
  const s = map[status] ?? map['active']
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: s.color, background: s.bg }}
    >
      {s.icon}
      {s.label}
    </span>
  )
}

function CardNetworkIcon({ network }: { network: string }) {
  if (network === 'Visa') {
    return (
      <div
        className="w-10 h-7 rounded flex items-center justify-center text-xs font-black italic"
        style={{ background: '#1A1F71', color: '#fff', letterSpacing: '-0.5px' }}
      >
        VISA
      </div>
    )
  }
  return (
    <div className="w-10 h-7 rounded flex items-center justify-center" style={{ background: '#252525' }}>
      <div className="relative w-6 h-5">
        <div
          className="absolute left-0 top-0 w-4 h-4 rounded-full opacity-90"
          style={{ background: '#EB001B', top: '50%', transform: 'translateY(-50%)' }}
        />
        <div
          className="absolute right-0 top-0 w-4 h-4 rounded-full opacity-90"
          style={{ background: '#F79E1B', top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subLoading, setSubLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES)
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [cards, setCards] = useState<SavedCard[]>(MOCK_CARDS)
  const [autoRenew, setAutoRenew] = useState(true)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  // Fetch subscription
  useEffect(() => {
    const fetchSub = async () => {
      setSubLoading(true)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) { setSubLoading(false); return }
        const res = await fetch('/api/subscriptions/my', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setSubscription(data)
          setAutoRenew(data.auto_renew ?? true)
        }
      } catch {
        // No subscription found or API error — show free plan
      } finally {
        setSubLoading(false)
      }
    }
    fetchSub()
  }, [])

  // Fetch payment history
  useEffect(() => {
    const fetchInvoices = async () => {
      setInvoicesLoading(true)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) { setInvoicesLoading(false); return }
        const res = await fetch('/api/payments/history', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) setInvoices(data)
        }
      } catch {
        // Keep mock data
      } finally {
        setInvoicesLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const handleCancelSubscription = async () => {
    if (!subscription) return
    setCancelling(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`/api/subscriptions/cancel/${subscription.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      })
      if (res.ok) {
        setSubscription((prev) => prev ? { ...prev, status: 'cancelled' } : prev)
        addToast('Subscription cancelled. You retain access until end of period.', 'success')
      } else {
        addToast('Failed to cancel. Please try again or contact support.', 'error')
      }
    } catch {
      addToast('Network error. Please try again.', 'error')
    } finally {
      setCancelling(false)
      setCancelModalOpen(false)
    }
  }

  const handleRemoveCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
    addToast('Payment method removed.', 'success')
  }

  const handleSetDefault = (id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })))
    addToast('Default payment method updated.', 'success')
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    addToast(`Invoice ${invoiceId} downloaded.`, 'success')
  }

  // Compute progress bar data
  const daysRemaining = subscription ? getDaysRemaining(subscription.end_date) : 0
  const totalDays = subscription
    ? getTotalDays(subscription.start_date, subscription.end_date)
    : 30
  const progressPct = totalDays > 0 ? Math.min(100, (daysRemaining / totalDays) * 100) : 0

  const isPaidPlan = !!subscription && subscription.status !== 'cancelled'

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: COLORS.bg, color: COLORS.textPrimary }}>
      <Navbar />

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      <CancelModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelSubscription}
        loading={cancelling}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16 flex flex-col gap-8">

        {/* ── Page Header ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={20} style={{ color: COLORS.gold }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: COLORS.gold }}>
              Billing & Subscription
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.textPrimary }}>
            Your Plan
          </h1>
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
            Manage your subscription, payment methods, and billing history.
          </p>
        </motion.div>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 1 — Current Plan
        ──────────────────────────────────────────────────────────────── */}
        <motion.section initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          {subLoading ? (
            <PlanSkeleton />
          ) : !subscription ? (
            /* Free Plan Card */
            <div
              className="rounded-2xl p-8"
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Package size={22} style={{ color: COLORS.textSecondary }} />
                    <span className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>Free Plan</span>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: COLORS.elevated, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}
                    >
                      Current
                    </span>
                  </div>
                  <p className="text-sm max-w-sm" style={{ color: COLORS.textSecondary }}>
                    You're on the free plan. Upgrade to unlock live tracking, SOS alerts, advanced geofencing, and more.
                  </p>
                  <ul className="flex flex-col gap-1 mt-1">
                    {['3 members max', 'Basic location history', 'SOS alerts', 'Check-ins'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ color: COLORS.textSecondary }}>
                        <CheckCircle2 size={13} style={{ color: COLORS.green }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/checkout?plan=4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm w-full justify-center"
                      style={{ background: COLORS.gold, color: '#0B0D13' }}
                    >
                      <Crown size={16} />
                      Upgrade to Family Plus
                      <ChevronRight size={14} />
                    </motion.button>
                  </Link>
                  <Link href="/pricing">
                    <button
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm w-full justify-center transition-all hover:brightness-110"
                      style={{ background: COLORS.elevated, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}
                    >
                      View all plans
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Active Subscription Card */
            <div
              className="rounded-2xl p-8"
              style={{
                background: COLORS.surface,
                border: `1px solid ${isPaidPlan ? COLORS.borderHover : COLORS.border}`,
                boxShadow: isPaidPlan ? `0 0 0 1px ${COLORS.gold}22, 0 8px 40px ${COLORS.gold}08` : 'none',
              }}
            >
              {/* Top row */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Crown size={22} style={{ color: COLORS.gold }} />
                    <span className="text-2xl font-bold" style={{ color: COLORS.gold }}>
                      {subscription.plan_name}
                    </span>
                    <StatusBadge status={subscription.status} />
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{ background: COLORS.elevated, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}
                    >
                      {subscription.billing_cycle}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-6 mt-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs" style={{ color: COLORS.textMuted }}>Amount</span>
                      <span className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
                        {subscription.currency === 'INR' ? '₹' : '$'}{subscription.amount}
                        <span className="text-sm font-normal ml-1" style={{ color: COLORS.textSecondary }}>
                          /{subscription.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs" style={{ color: COLORS.textMuted }}>Started</span>
                      <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                        {formatDate(subscription.start_date)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs" style={{ color: COLORS.textMuted }}>
                        {subscription.status === 'cancelled' ? 'Access Until' : 'Next Renewal'}
                      </span>
                      <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: COLORS.textPrimary }}>
                        <Calendar size={13} style={{ color: COLORS.gold }} />
                        {formatDate(subscription.end_date)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs" style={{ color: COLORS.textMuted }}>Days Remaining</span>
                      <span className="text-sm font-bold" style={{ color: daysRemaining < 7 ? COLORS.red : COLORS.green }}>
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 min-w-[160px]">
                  <Link href="/checkout">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm w-full justify-center"
                      style={{ background: COLORS.gold, color: '#0B0D13' }}
                    >
                      <Zap size={14} />
                      Upgrade Plan
                    </motion.button>
                  </Link>
                  {subscription.status !== 'cancelled' && (
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm w-full justify-center transition-all hover:brightness-110"
                      style={{ background: COLORS.redDim, color: COLORS.red, border: `1px solid ${COLORS.red}33` }}
                    >
                      <XCircle size={14} />
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs" style={{ color: COLORS.textSecondary }}>
                  <span>{formatDate(subscription.start_date)}</span>
                  <span style={{ color: COLORS.textMuted }}>{daysRemaining} days left of {totalDays}</span>
                  <span>{formatDate(subscription.end_date)}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: COLORS.elevated }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${COLORS.gold} 0%, #F5C842 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Auto-renew toggle */}
              {subscription.status !== 'cancelled' && (
                <div
                  className="flex items-center justify-between mt-5 pt-5"
                  style={{ borderTop: `1px solid ${COLORS.border}` }}
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw size={15} style={{ color: COLORS.textSecondary }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Auto-renew</p>
                      <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                        {autoRenew
                          ? `Renews automatically on ${formatDate(subscription.end_date)}`
                          : 'Subscription will not renew automatically'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAutoRenew((v) => !v)
                      addToast(
                        autoRenew ? 'Auto-renew disabled.' : 'Auto-renew enabled.',
                        'success',
                      )
                    }}
                    className="relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none"
                    style={{ background: autoRenew ? COLORS.gold : COLORS.elevated, border: `1px solid ${autoRenew ? COLORS.gold : COLORS.border}` }}
                    aria-label="Toggle auto-renew"
                  >
                    <motion.div
                      animate={{ x: autoRenew ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full"
                      style={{ background: autoRenew ? '#0B0D13' : COLORS.textMuted }}
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 2 — Payment Methods
        ──────────────────────────────────────────────────────────────── */}
        <motion.section initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: COLORS.gold }} />
              <h2 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>Payment Methods</h2>
            </div>
            <button
              onClick={() => addToast('Redirect to add payment method coming soon.', 'success')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: COLORS.goldDim, color: COLORS.gold, border: `1px solid ${COLORS.gold}33` }}
            >
              + Add Method
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {cards.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center"
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
              >
                <CreditCard size={32} className="mx-auto mb-3" style={{ color: COLORS.textMuted }} />
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>No payment methods saved.</p>
              </div>
            ) : (
              cards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{
                    background: COLORS.surface,
                    border: `1px solid ${card.isDefault ? COLORS.borderHover : COLORS.border}`,
                  }}
                >
                  <CardNetworkIcon network={card.network} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: COLORS.textPrimary }}>
                        {card.network} •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: COLORS.goldDim, color: COLORS.gold }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.textSecondary }}>
                      Expires {card.expiry}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <button
                        onClick={() => handleSetDefault(card.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                        style={{ background: COLORS.elevated, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}
                      >
                        Set default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                      style={{ background: COLORS.redDim, color: COLORS.red, border: `1px solid ${COLORS.red}33` }}
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 3 — Invoice / Payment History
        ──────────────────────────────────────────────────────────────── */}
        <motion.section initial="hidden" animate="visible" custom={3} variants={fadeUp}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} style={{ color: COLORS.gold }} />
            <h2 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>Billing History</h2>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            {invoicesLoading ? (
              <div className="p-4">
                <InvoiceSkeleton />
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <Package size={36} style={{ color: COLORS.textMuted }} />
                <p className="font-semibold" style={{ color: COLORS.textSecondary }}>No invoices yet</p>
                <p className="text-sm" style={{ color: COLORS.textMuted }}>
                  Payments will appear here once you subscribe.
                </p>
              </div>
            ) : (
              <>
                {/* Table header — hidden on mobile */}
                <div
                  className="hidden md:grid grid-cols-[1fr_2fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.border}` }}
                >
                  <span>Date</span>
                  <span>Description</span>
                  <span>Amount</span>
                  <span>Method</span>
                  <span>Status</span>
                  <span>Invoice</span>
                </div>

                {/* Invoice rows */}
                {invoices.map((inv, i) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex flex-col md:grid md:grid-cols-[1fr_2fr_auto_auto_auto_auto] gap-2 md:gap-4 px-5 py-4 md:items-center"
                    style={{
                      borderBottom: i < invoices.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                    }}
                  >
                    {/* Mobile label */}
                    <div className="flex items-center justify-between md:contents">
                      <span className="text-sm" style={{ color: COLORS.textSecondary }}>{inv.date}</span>
                      {/* Mobile: show status badge inline */}
                      <span className="md:hidden">
                        <StatusBadge status={inv.status} />
                      </span>
                    </div>

                    <span className="font-medium text-sm" style={{ color: COLORS.textPrimary }}>{inv.desc}</span>

                    <span className="font-bold text-sm" style={{ color: COLORS.gold }}>{inv.amount}</span>

                    <span
                      className="text-xs px-2.5 py-1 rounded-lg font-medium"
                      style={{ background: COLORS.elevated, color: COLORS.textSecondary }}
                    >
                      {inv.method}
                    </span>

                    {/* Desktop status badge */}
                    <span className="hidden md:inline-flex">
                      <StatusBadge status={inv.status} />
                    </span>

                    <button
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 w-fit"
                      style={{ background: COLORS.elevated, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}
                      title={`Download ${inv.id}`}
                    >
                      <Download size={12} />
                      <span className="hidden md:inline">{inv.id}</span>
                      <span className="md:hidden">Download</span>
                    </button>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </motion.section>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 4 — Danger Zone
        ──────────────────────────────────────────────────────────────── */}
        {subscription && subscription.status !== 'cancelled' && (
          <motion.section initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <div
              className="rounded-2xl p-6"
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.red}44`,
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} style={{ color: COLORS.red }} />
                    <h3 className="font-bold text-base" style={{ color: COLORS.red }}>Danger Zone</h3>
                  </div>
                  <p className="text-sm max-w-md" style={{ color: COLORS.textSecondary }}>
                    Cancelling your subscription will stop all future charges. You'll retain access to premium
                    features until <strong style={{ color: COLORS.textPrimary }}>{subscription ? formatDate(subscription.end_date) : '—'}</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 whitespace-nowrap"
                  style={{ background: COLORS.redDim, color: COLORS.red, border: `1px solid ${COLORS.red}44` }}
                >
                  <XCircle size={15} />
                  Cancel Subscription
                </button>
              </div>
            </div>
          </motion.section>
        )}

      </main>

      <Footer />
    </div>
  )
}
