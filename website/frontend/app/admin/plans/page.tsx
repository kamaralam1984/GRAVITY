'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { plansApi } from '@/lib/api'
import {
  TrendingUp, TrendingDown, Download, CreditCard, Users,
  Check, ArrowUpRight, ArrowDownRight, Zap, Crown, Shield,
} from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

const REVENUE_STATS = [
  { label: "MRR",        value: "₹74,82,500", trend: "+18.7%", up: true,  note: "Monthly Recurring Revenue" },
  { label: "ARR",        value: "₹8.97 Cr",   trend: "+21.2%", up: true,  note: "Annual Recurring Revenue" },
  { label: "ARPU",       value: "₹524/mo",    trend: "+5.8%",  up: true,  note: "Avg Revenue Per User" },
  { label: "Churn Rate", value: "2.4%",        trend: "-0.3%",  up: false, note: "Monthly churn" },
]

const PLANS = [
  {
    name: "Free Plan",
    icon: Shield,
    iconColor: "#6B7280",
    iconBg: "rgba(107,114,128,0.12)",
    price: "₹0",
    period: "forever",
    users: 21784,
    usersTrend: "+234 this month",
    mrr: null,
    badge: null,
    features: [
      "Up to 5 family members",
      "Basic live tracking",
      "7-day location history",
      "2 geofences",
      "Email support",
    ],
    borderColor: "var(--border)",
    headerBg: "var(--bg-surface2)",
  },
  {
    name: "Premium Plan",
    icon: Zap,
    iconColor: "#D4A853",
    iconBg: "rgba(212,168,83,0.15)",
    price: "₹299",
    period: "per month",
    users: 19782,
    usersTrend: "+891 this month",
    mrr: "₹59.15L MRR",
    badge: "Most Popular",
    features: [
      "Up to 10 family members",
      "All tracking features",
      "30-day location history",
      "Unlimited geofences",
      "Ghost Mode",
      "AI Insights (beta)",
      "Priority support",
    ],
    borderColor: "var(--gold)",
    headerBg: "rgba(var(--gold-rgb),0.06)",
  },
  {
    name: "Family Plan",
    icon: Crown,
    iconColor: "#4B80F0",
    iconBg: "rgba(75,128,240,0.12)",
    price: "₹499",
    period: "per month",
    users: 8668,
    usersTrend: "+312 this month",
    mrr: "₹43.24L MRR",
    badge: null,
    features: [
      "Up to 25 family members",
      "All Premium features",
      "90-day location history",
      "Dedicated account manager",
      "Family analytics dashboard",
      "Emergency contact network",
      "24/7 Priority SOS support",
    ],
    borderColor: "var(--primary)",
    headerBg: "rgba(75,128,240,0.06)",
  },
]

const MONTHLY_MRR = [3200000, 4100000, 5200000, 5900000, 6100000, 6500000, 6600000, 6200000, 6700000, 7000000, 7300000, 7482500]
const MONTH_LABELS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const SUBSCRIPTIONS = [
  { customer: "Sharma Family",   plan: "Family",  start: "Jun 1, 2025",  next: "Jul 1, 2025",  amount: "₹499", status: "Active" },
  { customer: "Mehta R.",        plan: "Premium", start: "Jun 2, 2025",  next: "Jul 2, 2025",  amount: "₹299", status: "Active" },
  { customer: "Iyer Household",  plan: "Family",  start: "May 28, 2025", next: "Jun 28, 2025", amount: "₹499", status: "Active" },
  { customer: "Kapoor A.",       plan: "Premium", start: "May 25, 2025", next: "Jun 25, 2025", amount: "₹299", status: "Active" },
  { customer: "Singh B. Family", plan: "Family",  start: "May 20, 2025", next: "Jun 20, 2025", amount: "₹499", status: "Active" },
  { customer: "Nair S.",         plan: "Premium", start: "May 18, 2025", next: "Jun 18, 2025", amount: "₹299", status: "Active" },
  { customer: "Gupta P.",        plan: "Premium", start: "May 15, 2025", next: "Jun 15, 2025", amount: "₹299", status: "Pending" },
  { customer: "Reddy K. Family", plan: "Family",  start: "May 12, 2025", next: "Jun 12, 2025", amount: "₹499", status: "Active" },
  { customer: "Chowdhury M.",    plan: "Premium", start: "May 8, 2025",  next: "Jun 8, 2025",  amount: "₹299", status: "Active" },
  { customer: "Joshi V.",        plan: "Premium", start: "May 5, 2025",  next: "Jun 5, 2025",  amount: "₹299", status: "Cancelled" },
]

const FLOW_STATS = [
  { label: "Free to Premium",    count: "1,234", icon: ArrowUpRight, color: "var(--safe)" },
  { label: "Premium to Family",  count: "456",   icon: ArrowUpRight, color: "var(--primary)" },
  { label: "Downgrade",          count: "234",   icon: ArrowDownRight, color: "#F59E0B" },
  { label: "Cancellation",       count: "189",   icon: ArrowDownRight, color: "var(--sos)" },
]

const PAYMENT_METHODS = [
  { label: "UPI",           pct: 54, color: "#10B981" },
  { label: "Credit Card",  pct: 28, color: "#4B80F0" },
  { label: "Debit Card",   pct: 12, color: "#D4A853" },
  { label: "Net Banking",  pct: 6,  color: "#A78BFA" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildLinePath(data: number[], w: number, h: number, padX = 40, padY = 24): string {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const xs = data.map((_, i) => padX + (i / (data.length - 1)) * (w - padX * 2))
  const ys = data.map(v => padY + (1 - (v - min) / range) * (h - padY * 2))
  let d = `M ${xs[0]} ${ys[0]}`
  for (let i = 1; i < xs.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2
    d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`
  }
  return d
}

function buildAreaPath(data: number[], w: number, h: number, padX = 40, padY = 24): string {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const xs = data.map((_, i) => padX + (i / (data.length - 1)) * (w - padX * 2))
  const ys = data.map(v => padY + (1 - (v - min) / range) * (h - padY * 2))
  let d = `M ${xs[0]} ${h - padY}`
  d += ` L ${xs[0]} ${ys[0]}`
  for (let i = 1; i < xs.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2
    d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`
  }
  d += ` L ${xs[xs.length - 1]} ${h - padY} Z`
  return d
}

function buildDonutSlices(segments: { pct: number; color: string; label: string }[], r = 60, cx = 90, cy = 90) {
  const circ = 2 * Math.PI * r
  let offset = 0
  return segments.map(seg => {
    const dash = (seg.pct / 100) * circ
    const gap = circ - dash
    const result = {
      dashArray: `${dash} ${gap}`,
      dashOffset: `${-(offset / 100) * circ}`,
      color: seg.color,
      label: seg.label,
      pct: seg.pct,
    }
    offset += seg.pct
    return result
  })
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
    Pending: { bg: "rgba(212,168,83,0.12)", color: "#D4A853" },
    Cancelled: { bg: "rgba(239,68,68,0.12)", color: "#EF4444" },
  }
  return map[status] || { bg: "var(--bg-surface2)", color: "var(--text-muted)" }
}

function planBadge(plan: string) {
  if (plan === "Family") return { bg: "rgba(75,128,240,0.12)", color: "#4B80F0" }
  if (plan === "Premium") return { bg: "rgba(212,168,83,0.12)", color: "#D4A853" }
  return { bg: "rgba(107,114,128,0.12)", color: "#6B7280" }
}

// ── Card ──────────────────────────────────────────────────────────────────────

function Card({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "var(--shadow-card)",
        transition: "box-shadow 0.25s ease",
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [planStats, setPlanStats] = useState<any>(null)

  useEffect(() => {
    plansApi.stats()
      .then(d => setPlanStats(d))
      .catch(() => {})
  }, [])

  const SVG_W = 700
  const SVG_H = 220
  const linePath = buildLinePath(MONTHLY_MRR, SVG_W, SVG_H)
  const areaPath = buildAreaPath(MONTHLY_MRR, SVG_W, SVG_H)

  const donutSlices = buildDonutSlices(PAYMENT_METHODS)

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 6px" }}>
            Plans &amp; Revenue
          </h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total MRR</span>
            <span
              className="gradient-text-gold"
              style={{ fontSize: 32, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}
            >
              {planStats ? `₹${(planStats.mrr_inr / 100000).toFixed(1)}L` : "Loading..."}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 13, fontWeight: 600, color: "var(--safe)",
              background: "rgba(16,185,129,0.10)", padding: "3px 10px", borderRadius: 999,
            }}>
              <TrendingUp size={13} />
              +18.7%
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 20px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #C9913A, #D4A853)",
            color: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 600,
            boxShadow: "0 4px 16px rgba(184,114,10,0.35)",
          }}
        >
          <Download size={15} />
          Export
        </motion.button>
      </div>

      {/* ── Revenue Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {REVENUE_STATS.map((stat, i) => (
          <Card key={stat.label} delay={i * 0.07}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px", fontWeight: 500 }}>{stat.label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span className="gradient-text-gold" style={{ fontSize: 22, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontSize: 11.5, fontWeight: 600,
                color: stat.up ? "var(--safe)" : "var(--sos)",
                background: stat.up ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
                padding: "2px 8px", borderRadius: 999,
              }}>
                {stat.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {stat.trend}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>{stat.note}</p>
          </Card>
        ))}
      </div>

      {/* ── Plan Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
        {PLANS.map((plan, i) => {
          const Icon = plan.icon
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(0,0,0,0.14)" }}
              style={{
                background: "var(--bg-surface)",
                border: `1.5px solid ${plan.borderColor}`,
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "var(--shadow-card)",
                transition: "box-shadow 0.25s ease",
                position: "relative",
              }}
            >
              {plan.badge && (
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  background: "linear-gradient(135deg, #C9913A, #D4A853)",
                  color: "#fff", fontSize: 10.5, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 999,
                  letterSpacing: "0.04em",
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div style={{ background: plan.headerBg, padding: "20px 20px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: plan.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} style={{ color: plan.iconColor }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: 0 }}>
                      {plan.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: plan.iconColor, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {plan.price}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/{plan.period}</span>
                    </div>
                  </div>
                </div>

                {/* User count */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={14} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                      {plan.name === "Premium Plan"
                        ? (planStats?.premium?.toLocaleString("en-IN") ?? plan.users.toLocaleString())
                        : plan.name === "Family Plan"
                        ? (planStats?.family_plus?.toLocaleString("en-IN") ?? plan.users.toLocaleString())
                        : plan.name === "Free Plan"
                        ? (planStats?.free?.toLocaleString("en-IN") ?? plan.users.toLocaleString())
                        : plan.users.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>users</span>
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--safe)", fontWeight: 600 }}>{plan.usersTrend}</span>
                </div>

                {plan.mrr && (
                  <div style={{
                    marginTop: 10, padding: "6px 12px", borderRadius: 8,
                    background: "rgba(var(--gold-rgb),0.10)", border: "1px solid rgba(var(--gold-rgb),0.20)",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    <CreditCard size={13} style={{ color: "var(--gold)" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--gold)" }}>{plan.mrr}</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div style={{ padding: "16px 20px 20px" }}>
                <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Includes
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map((feat, fi) => (
                    <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: `${plan.iconColor}18`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                      }}>
                        <Check size={11} style={{ color: plan.iconColor }} />
                      </div>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Revenue Chart ── */}
      <Card delay={0.2} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
              Revenue Growth
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Monthly Recurring Revenue — Jul 2024 to Jun 2025</p>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(var(--gold-rgb),0.10)", color: "var(--gold)", fontSize: 12, fontWeight: 600 }}>
            +133.8% YoY
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H + 32}`} style={{ width: "100%", minWidth: 380, display: "block" }} aria-label="MRR growth chart">
            <defs>
              <linearGradient id="plansAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A853" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#D4A853" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map(f => (
              <line key={f} x1={40} y1={24 + (1 - f) * (SVG_H - 48)} x2={SVG_W - 40} y2={24 + (1 - f) * (SVG_H - 48)}
                stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
            ))}
            {/* Area */}
            <path d={areaPath} fill="url(#plansAreaGrad)" />
            {/* Line */}
            <motion.path d={linePath} fill="none" stroke="#D4A853" strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }} />
            {/* Data points */}
            {MONTHLY_MRR.map((val, i) => {
              const min = Math.min(...MONTHLY_MRR)
              const max = Math.max(...MONTHLY_MRR)
              const x = 40 + (i / (MONTHLY_MRR.length - 1)) * (SVG_W - 80)
              const y = 24 + (1 - (val - min) / (max - min)) * (SVG_H - 48)
              return (
                <motion.circle key={i} cx={x} cy={y} r={4} fill="#D4A853" stroke="var(--bg-surface)" strokeWidth={2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }} />
              )
            })}
            {/* X labels */}
            {MONTH_LABELS.map((label, i) => {
              const x = 40 + (i / (MONTH_LABELS.length - 1)) * (SVG_W - 80)
              return (
                <text key={i} x={x} y={SVG_H + 22} textAnchor="middle" fontSize={10.5}
                  fill="var(--text-muted)" fontFamily="Inter, sans-serif">{label}</text>
              )
            })}
          </svg>
        </div>
      </Card>

      {/* ── Subscriptions Table + Donut ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16, marginBottom: 24, alignItems: "start" }}>

        {/* Subscriptions Table */}
        <Card delay={0.25}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 16px" }}>
            Recent Subscriptions
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Customer", "Plan", "Start Date", "Next Billing", "Amount", "Status", ""].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBSCRIPTIONS.map((row, i) => {
                  const sStyle = statusBadge(row.status)
                  const pStyle = planBadge(row.plan)
                  return (
                    <motion.tr key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: hoveredRow === i ? "rgba(var(--gold-rgb),0.04)" : i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                        {row.customer}
                      </td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: pStyle.bg, color: pStyle.color, whiteSpace: "nowrap" }}>
                          {row.plan}
                        </span>
                      </td>
                      <td style={{ padding: "11px 12px", fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{row.start}</td>
                      <td style={{ padding: "11px 12px", fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{row.next}</td>
                      <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{row.amount}</td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: sStyle.bg, color: sStyle.color, whiteSpace: "nowrap" }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "11px 12px" }}>
                        <button style={{
                          padding: "5px 12px", borderRadius: 8, border: "1px solid var(--border-strong)",
                          background: "transparent", color: "var(--text-secondary)", fontSize: 12,
                          fontWeight: 500, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.background = "rgba(var(--gold-rgb),0.06)" }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent" }}>
                          Manage
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment Method Donut */}
        <Card delay={0.3}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 16px" }}>
            Payment Methods
          </h3>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <svg viewBox="0 0 180 180" style={{ width: 150, height: 150 }} aria-label="Payment method distribution donut chart">
              {donutSlices.map((slice, i) => (
                <motion.circle key={i} cx={90} cy={90} r={60} fill="none"
                  stroke={slice.color} strokeWidth={28}
                  strokeDasharray={slice.dashArray}
                  strokeDashoffset={slice.dashOffset}
                  strokeLinecap="butt"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "90px 90px" }}
                  initial={{ strokeDasharray: "0 377" }}
                  animate={{ strokeDasharray: slice.dashArray }}
                  transition={{ duration: 1.2, delay: i * 0.22, ease: "easeOut" }}
                />
              ))}
              <text x={90} y={86} textAnchor="middle" fontSize={18} fontWeight={800}
                fontFamily="Plus Jakarta Sans, sans-serif" fill="var(--text-primary)">UPI</text>
              <text x={90} y={102} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontFamily="Inter, sans-serif">54% share</text>
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PAYMENT_METHODS.map((pm, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: pm.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{pm.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 60, height: 5, borderRadius: 3, background: "var(--bg-surface2)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pm.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                      style={{ height: "100%", borderRadius: 3, background: pm.color }}
                    />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", width: 30, textAlign: "right" }}>{pm.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Upgrade / Downgrade Flow ── */}
      <Card delay={0.35}>
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
            Subscription Flow
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>This month plan changes</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {FLOW_STATS.map((flow, i) => {
            const Icon = flow.icon
            return (
              <motion.div
                key={flow.label}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                style={{
                  padding: "16px", borderRadius: 12, background: "var(--bg-surface2)",
                  border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${flow.color === "var(--safe)" ? "rgba(16,185,129" : flow.color === "var(--primary)" ? "rgba(75,128,240" : flow.color === "var(--sos)" ? "rgba(239,68,68" : "rgba(245,158,11"},0.12)`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={18} style={{ color: flow.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 2px", fontWeight: 500 }}>{flow.label}</p>
                  <span style={{ fontSize: 22, fontWeight: 800, color: flow.color, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {flow.count}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

    </div>
  )
}
