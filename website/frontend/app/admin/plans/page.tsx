'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { getAdminToken, plansApi } from '@/lib/api'
import {
  TrendingUp, TrendingDown, Download, CreditCard, Users,
  Check, ArrowUpRight, ArrowDownRight, Zap, Crown, Shield,
  RefreshCw, AlertCircle, ToggleLeft, ToggleRight, IndianRupee,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
interface Plan {
  id: string | number
  name: string
  price_monthly: number
  price_yearly?: number
  description?: string
  features: string[]
  is_active: boolean
}

// ── Helpers ───────────────────────────────────────────────────────

const PLAN_ICONS: Record<string, React.ElementType> = {
  free: Shield, premium: Zap, family: Crown,
}
const PLAN_COLORS: Record<string, { color: string; bg: string; border: string; headerBg: string }> = {
  free:    { color: "#6B7280", bg: "rgba(107,114,128,0.12)", border: "var(--border)",   headerBg: "var(--bg-surface2)" },
  premium: { color: "#D4A853", bg: "rgba(212,168,83,0.12)", border: "var(--gold)",     headerBg: "rgba(212,168,83,0.06)" },
  family:  { color: "#4B80F0", bg: "rgba(75,128,240,0.12)", border: "var(--primary)",  headerBg: "rgba(75,128,240,0.06)" },
}

function getPlanKey(name: string) {
  const n = name.toLowerCase()
  if (n.includes("premium")) return "premium"
  if (n.includes("family")) return "family"
  return "free"
}

const REVENUE_STATS = [
  { label: "MRR",        value: "₹74,82,500", trend: "+18.7%", up: true,  note: "Monthly Recurring Revenue" },
  { label: "ARR",        value: "₹8.97 Cr",   trend: "+21.2%", up: true,  note: "Annual Recurring Revenue" },
  { label: "ARPU",       value: "₹524/mo",    trend: "+5.8%",  up: true,  note: "Avg Revenue Per User" },
  { label: "Churn Rate", value: "2.4%",        trend: "-0.3%",  up: false, note: "Monthly churn" },
]

const MONTHLY_MRR = [3200000, 4100000, 5200000, 5900000, 6100000, 6500000, 6600000, 6200000, 6700000, 7000000, 7300000, 7482500]
const MONTH_LABELS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const PAYMENT_METHODS = [
  { label: "UPI",          pct: 54, color: "#10B981" },
  { label: "Credit Card",  pct: 28, color: "#4B80F0" },
  { label: "Debit Card",   pct: 12, color: "#D4A853" },
  { label: "Net Banking",  pct: 6,  color: "#A78BFA" },
]

function buildLinePath(data: number[], w: number, h: number, padX = 40, padY = 24): string {
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
  const xs = data.map((_, i) => padX + (i / (data.length - 1)) * (w - padX * 2))
  const ys = data.map(v => padY + (1 - (v - min) / range) * (h - padY * 2))
  let d = `M ${xs[0]} ${ys[0]}`
  for (let i = 1; i < xs.length; i++) { const cpx = (xs[i - 1] + xs[i]) / 2; d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}` }
  return d
}

function buildAreaPath(data: number[], w: number, h: number, padX = 40, padY = 24): string {
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1
  const xs = data.map((_, i) => padX + (i / (data.length - 1)) * (w - padX * 2))
  const ys = data.map(v => padY + (1 - (v - min) / range) * (h - padY * 2))
  let d = `M ${xs[0]} ${h - padY} L ${xs[0]} ${ys[0]}`
  for (let i = 1; i < xs.length; i++) { const cpx = (xs[i - 1] + xs[i]) / 2; d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}` }
  d += ` L ${xs[xs.length - 1]} ${h - padY} Z`
  return d
}

function buildDonutSlices(segments: { pct: number; color: string; label: string }[], r = 60, cx = 90, cy = 90) {
  const circ = 2 * Math.PI * r; let offset = 0
  return segments.map(seg => {
    const dash = (seg.pct / 100) * circ; const gap = circ - dash
    const result = { dashArray: `${dash} ${gap}`, dashOffset: `${-(offset / 100) * circ}`, color: seg.color, label: seg.label, pct: seg.pct }
    offset += seg.pct; return result
  })
}

function Card({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, boxShadow: "var(--shadow-card)", transition: "box-shadow 0.25s ease", ...style }}>
      {children}
    </motion.div>
  )
}

// ── Plan Card ─────────────────────────────────────────────────────
function PlanCard({ plan, index, onToggle }: { plan: Plan; index: number; onToggle: (id: string | number) => void }) {
  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly")
  const [toggling, setToggling] = useState(false)

  const planKey = getPlanKey(plan.name)
  const style = PLAN_COLORS[planKey] || PLAN_COLORS["free"]
  const Icon = PLAN_ICONS[planKey] || Zap
  const price = billingMode === "yearly" && plan.price_yearly ? plan.price_yearly : plan.price_monthly

  const handleToggle = async () => {
    setToggling(true)
    try {
      const token = getAdminToken() || (typeof window !== "undefined" ? localStorage.getItem("gravity_admin_auth") : null)
      const res = await fetch(`/plans/${plan.id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      })
      if (!res.ok) throw new Error("Failed")
      onToggle(plan.id)
    } catch {
      // silently fail — UI stays unchanged
    } finally {
      setToggling(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(0,0,0,0.14)" }}
      style={{
        background: "var(--bg-surface)",
        border: `1.5px solid ${plan.is_active ? style.border : "var(--border)"}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: "var(--shadow-card)", transition: "box-shadow 0.25s ease", position: "relative",
        opacity: plan.is_active ? 1 : 0.72,
      }}
    >
      {!plan.is_active && (
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(107,114,128,0.15)", color: "#6B7280", fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, letterSpacing: "0.04em" }}>
          INACTIVE
        </div>
      )}

      {/* Header */}
      <div style={{ background: plan.is_active ? style.headerBg : "var(--bg-surface2)", padding: "18px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: style.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={20} style={{ color: style.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", margin: 0 }}>{plan.name}</h3>
            {plan.description && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.3 }}>{plan.description}</p>}
          </div>
        </div>

        {/* Billing toggle */}
        {plan.price_yearly && (
          <div style={{ display: "flex", background: "var(--bg-surface2)", borderRadius: 8, padding: 2, marginBottom: 10, width: "fit-content" }}>
            {(["monthly", "yearly"] as const).map(mode => (
              <button key={mode} onClick={() => setBillingMode(mode)}
                style={{ padding: "3px 12px", borderRadius: 7, border: "none", background: billingMode === mode ? "var(--bg-surface)" : "transparent", color: billingMode === mode ? "var(--text-primary)" : "var(--text-muted)", fontSize: 11.5, fontWeight: billingMode === mode ? 600 : 400, cursor: "pointer", transition: "all 0.15s", boxShadow: billingMode === mode ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                {mode === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: plan.is_active ? style.color : "var(--text-muted)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
          </span>
          {price > 0 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>/{billingMode === "yearly" ? "year" : "month"}</span>}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "14px 18px 16px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", margin: "0 0 10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Includes</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
          {(plan.features || []).map((feat, fi) => (
            <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 17, height: 17, borderRadius: "50%", background: style.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={10} style={{ color: style.color }} />
              </div>
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>{feat}</span>
            </div>
          ))}
          {(!plan.features || plan.features.length === 0) && (
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: 0 }}>No features listed.</p>
          )}
        </div>

        {/* Active toggle button */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          style={{ width: "100%", padding: "8px", borderRadius: 10, border: `1px solid ${plan.is_active ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, background: plan.is_active ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)", color: plan.is_active ? "#EF4444" : "#10B981", fontSize: 13, fontWeight: 600, cursor: toggling ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.15s", opacity: toggling ? 0.6 : 1 }}
        >
          {plan.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {toggling ? "Updating…" : plan.is_active ? "Deactivate Plan" : "Activate Plan"}
        </button>
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default function PlansPage() {
  const [plans, setPlans]     = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [planStats, setPlanStats] = useState<any>(null)

  useEffect(() => {
    setLoading(true)
    const token = getAdminToken() || (typeof window !== "undefined" ? localStorage.getItem("gravity_admin_auth") : null)

    Promise.all([
      fetch("/plans/", { headers: { Authorization: "Bearer " + token } })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
        .then(d => Array.isArray(d) ? d : (d.plans || [])),
      plansApi.stats().catch(() => null),
    ])
      .then(([fetchedPlans, stats]) => {
        setPlans(fetchedPlans)
        if (stats) setPlanStats(stats)
      })
      .catch(e => setError(e.message || "Failed to load plans"))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = (id: string | number) => {
    setPlans(ps => ps.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p))
  }

  const SVG_W = 700
  const SVG_H = 220
  const linePath = buildLinePath(MONTHLY_MRR, SVG_W, SVG_H)
  const areaPath = buildAreaPath(MONTHLY_MRR, SVG_W, SVG_H)
  const donutSlices = buildDonutSlices(PAYMENT_METHODS)

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 6px" }}>
            Plans &amp; Revenue
          </h1>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total MRR</span>
            <span className="gradient-text-gold" style={{ fontSize: 32, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
              {planStats ? `₹${(planStats.mrr_inr / 100000).toFixed(1)}L` : "—"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 13, fontWeight: 600, color: "var(--safe)", background: "rgba(16,185,129,0.10)", padding: "3px 10px", borderRadius: 999 }}>
              <TrendingUp size={13} />+18.7%
            </span>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #C9913A, #D4A853)", color: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 600, boxShadow: "0 4px 16px rgba(184,114,10,0.35)" }}>
          <Download size={15} />Export
        </motion.button>
      </div>

      {/* Revenue Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {REVENUE_STATS.map((stat, i) => (
          <Card key={stat.label} delay={i * 0.07}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px", fontWeight: 500 }}>{stat.label}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span className="gradient-text-gold" style={{ fontSize: 22, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>{stat.value}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 600, color: stat.up ? "var(--safe)" : "var(--sos)", background: stat.up ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)", padding: "2px 8px", borderRadius: 999 }}>
                {stat.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{stat.trend}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "6px 0 0" }}>{stat.note}</p>
          </Card>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: 13.5, marginBottom: 20 }}>
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Plan Cards */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-primary)", margin: 0 }}>Subscription Plans</h2>
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{plans.filter(p => p.is_active).length} of {plans.length} active</span>
        </div>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 12, color: "var(--text-muted)", fontSize: 14 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
            Loading plans…
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 14 }}>
            No plans returned from API.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
            {plans.map((plan, i) => (
              <PlanCard key={String(plan.id)} plan={plan} index={i} onToggle={handleToggle} />
            ))}
          </div>
        )}
      </div>

      {/* Revenue Chart */}
      <Card delay={0.2} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>Revenue Growth</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Monthly Recurring Revenue — Jul 2024 to Jun 2025</p>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(var(--gold-rgb),0.10)", color: "var(--gold)", fontSize: 12, fontWeight: 600 }}>+133.8% YoY</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H + 32}`} style={{ width: "100%", minWidth: 380, display: "block" }} aria-label="MRR growth chart">
            <defs>
              <linearGradient id="plansAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A853" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#D4A853" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map(f => (
              <line key={f} x1={40} y1={24 + (1 - f) * (SVG_H - 48)} x2={SVG_W - 40} y2={24 + (1 - f) * (SVG_H - 48)}
                stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
            ))}
            <path d={areaPath} fill="url(#plansAreaGrad)" />
            <motion.path d={linePath} fill="none" stroke="#D4A853" strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }} />
            {MONTHLY_MRR.map((val, i) => {
              const min = Math.min(...MONTHLY_MRR); const max = Math.max(...MONTHLY_MRR)
              const x = 40 + (i / (MONTHLY_MRR.length - 1)) * (SVG_W - 80)
              const y = 24 + (1 - (val - min) / (max - min)) * (SVG_H - 48)
              return <motion.circle key={i} cx={x} cy={y} r={4} fill="#D4A853" stroke="var(--bg-surface)" strokeWidth={2}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 + i * 0.06 }} />
            })}
            {MONTH_LABELS.map((label, i) => {
              const x = 40 + (i / (MONTH_LABELS.length - 1)) * (SVG_W - 80)
              return <text key={i} x={x} y={SVG_H + 22} textAnchor="middle" fontSize={10.5} fill="var(--text-muted)" fontFamily="Inter, sans-serif">{label}</text>
            })}
          </svg>
        </div>
      </Card>

      {/* Payment Method Donut */}
      <Card delay={0.3}>
        <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 16px" }}>Payment Methods</h3>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
          <svg viewBox="0 0 180 180" style={{ width: 150, height: 150, flexShrink: 0 }} aria-label="Payment method distribution donut chart">
            {donutSlices.map((slice, i) => (
              <motion.circle key={i} cx={90} cy={90} r={60} fill="none"
                stroke={slice.color} strokeWidth={28}
                strokeDasharray={slice.dashArray} strokeDashoffset={slice.dashOffset}
                strokeLinecap="butt" style={{ transform: "rotate(-90deg)", transformOrigin: "90px 90px" }}
                initial={{ strokeDasharray: "0 377" }} animate={{ strokeDasharray: slice.dashArray }}
                transition={{ duration: 1.2, delay: i * 0.22, ease: "easeOut" }}
              />
            ))}
            <text x={90} y={86} textAnchor="middle" fontSize={18} fontWeight={800} fontFamily="Plus Jakarta Sans, sans-serif" fill="var(--text-primary)">UPI</text>
            <text x={90} y={102} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontFamily="Inter, sans-serif">54% share</text>
          </svg>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 160 }}>
            {PAYMENT_METHODS.map((pm, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: pm.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{pm.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 60, height: 5, borderRadius: 3, background: "var(--bg-surface2)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pm.pct}%` }} transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                      style={{ height: "100%", borderRadius: 3, background: pm.color }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", width: 30, textAlign: "right" }}>{pm.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
