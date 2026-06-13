'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { adminApi } from '@/lib/api'
import {
  Users,
  Smartphone,
  AlertTriangle,
  CreditCard,
  Download,
  Megaphone,
  FileText,
  HardDrive,
  Terminal,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

// ── Data ─────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Total Families",
    value: "50,234",
    trend: "+12.4%",
    up: true,
    detail: "this month",
    icon: Users,
    color: "var(--primary)",
    colorRgb: "var(--primary-rgb)",
  },
  {
    label: "Active Devices",
    value: "142,891",
    trend: "+8.2%",
    up: true,
    detail: "this month",
    icon: Smartphone,
    color: "var(--gold)",
    colorRgb: "var(--gold-rgb)",
  },
  {
    label: "SOS Alerts Today",
    value: "3",
    trend: "-2",
    up: false,
    detail: "from yesterday",
    icon: AlertTriangle,
    color: "var(--sos)",
    colorRgb: "239,68,68",
  },
  {
    label: "Monthly Revenue",
    value: "₹24.5L",
    trend: "+18.7%",
    up: true,
    detail: "this month",
    icon: CreditCard,
    color: "var(--safe)",
    colorRgb: "16,185,129",
  },
]

const MONTHLY_DATA = [12000, 18000, 24000, 31000, 38000, 44000, 48000, 42000, 46000, 49000, 50234, 52000]
const MONTH_LABELS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const PLAN_DATA = [
  { label: "Free", pct: 42, count: "21,098", color: "var(--text-muted)" },
  { label: "Premium", pct: 35, count: "17,581", color: "var(--gold)" },
  { label: "Family", pct: 23, count: "11,554", color: "var(--primary)" },
]

const ACTIVITY = [
  { dot: "#EF4444", text: "SOS Alert triggered by Priya Sharma", location: "Mumbai", time: "2 min ago", action: "View" },
  { dot: "#10B981", text: "New family joined: The Mehta Family", location: "", time: "5 min ago", action: "View" },
  { dot: "#D4A853", text: "Payment received: ₹299 Premium — Rajesh K.", location: "", time: "12 min ago", action: "Receipt" },
  { dot: "var(--primary)", text: "Device registered: iPhone 14 — Ananya S.", location: "", time: "18 min ago", action: "Details" },
  { dot: "#10B981", text: "Geofence triggered: Home Zone — Arjun S. arrived", location: "", time: "25 min ago", action: "View" },
  { dot: "#EF4444", text: "Battery critical: 8% — Kavita M.", location: "", time: "31 min ago", action: "Alert sent" },
  { dot: "#10B981", text: "New subscription: Family Plan — The Iyer Family", location: "", time: "45 min ago", action: "Details" },
  { dot: "#D4A853", text: "SOS resolved: Confirmed safe — Priya Sharma", location: "", time: "1 hr ago", action: "View" },
]

const TOP_CITIES = [
  { city: "Mumbai", count: 3240 },
  { city: "Delhi", count: 2890 },
  { city: "Bangalore", count: 2450 },
  { city: "Chennai", count: 1820 },
  { city: "Hyderabad", count: 1560 },
]
const MAX_CITY = 3240

const QUICK_ACTIONS = [
  { label: "Send Announcement", icon: Megaphone, color: "var(--primary)" },
  { label: "Export CSV", icon: FileText, color: "var(--gold)" },
  { label: "Force System Backup", icon: HardDrive, color: "var(--safe)" },
  { label: "View Error Logs", icon: Terminal, color: "var(--sos)" },
]

// ── SVG Line Chart helpers ────────────────────────────────────────
function buildLinePath(data: number[], w: number, h: number, padX = 30, padY = 20): string {
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

function buildAreaPath(data: number[], w: number, h: number, padX = 30, padY = 20): string {
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

function getDataPoints(data: number[], w: number, h: number, padX = 30, padY = 20) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  return data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * (w - padX * 2),
    y: padY + (1 - (v - min) / range) * (h - padY * 2),
    value: v,
  }))
}

// ── Donut helpers ─────────────────────────────────────────────────
function donutPath(pct: number, offset: number, r = 60, cx = 90, cy = 90): { d: string; dashArray: string; dashOffset: string } {
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const gap = circ - dash
  return {
    d: `M ${cx} ${cy - r}`,
    dashArray: `${dash} ${gap}`,
    dashOffset: `${-(offset / 100) * circ}`,
  }
}

// ── Card wrapper ──────────────────────────────────────────────────
function Card({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  delay?: number
}) {
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

// ── Main Dashboard ────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const heroRef = useRef(null)
  const [apiData, setApiData] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    adminApi.dashboard()
      .then(d => { setApiData(d); setApiLoading(false) })
      .catch(() => setApiLoading(false))
  }, [])

  const liveStats = apiData ? [
    { ...STATS[0], value: apiData.total_families?.toLocaleString("en-IN") ?? STATS[0].value },
    { ...STATS[1], value: apiData.total_devices?.toLocaleString("en-IN") ?? STATS[1].value },
    { ...STATS[2], value: String(apiData.active_sos_alerts ?? STATS[2].value), trend: apiData.active_sos_alerts > 0 ? `${apiData.active_sos_alerts} active` : "-0 clear", up: apiData.active_sos_alerts === 0 },
    { ...STATS[3], value: apiData.mrr_inr ? `₹${(apiData.mrr_inr / 100000).toFixed(1)}L` : STATS[3].value },
  ] : STATS

  const livePlanData = apiData ? [
    { ...PLAN_DATA[0], count: apiData.free_families?.toLocaleString("en-IN") ?? PLAN_DATA[0].count },
    { ...PLAN_DATA[1], count: apiData.premium_families?.toLocaleString("en-IN") ?? PLAN_DATA[1].count },
    { ...PLAN_DATA[2], count: apiData.family_plan_families?.toLocaleString("en-IN") ?? PLAN_DATA[2].count },
  ] : PLAN_DATA

  const SVG_W = 600
  const SVG_H = 200
  const linePath = buildLinePath(MONTHLY_DATA, SVG_W, SVG_H)
  const areaPath = buildAreaPath(MONTHLY_DATA, SVG_W, SVG_H)
  const points = getDataPoints(MONTHLY_DATA, SVG_W, SVG_H)

  // Donut offsets
  let donutOffset = 0
  const donutSlices = livePlanData.map(item => {
    const slice = { ...donutPath(item.pct, donutOffset), color: item.color, label: item.label }
    donutOffset += item.pct
    return slice
  })

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: "var(--text-primary)",
              margin: "0 0 4px",
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Good morning, Admin
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              background: "rgba(var(--gold-rgb),0.10)",
              border: "1px solid rgba(var(--gold-rgb),0.25)",
              color: "var(--gold)",
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            Jun 2025
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-gold"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 13.5,
            }}
          >
            <Download size={14} />
            Export Report
          </motion.button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {liveStats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} delay={i * 0.07}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `rgba(${stat.colorRgb},0.12)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 4px", fontWeight: 500 }}>
                    {stat.label}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <span
                      className="gradient-text-gold"
                      style={{ fontSize: 26, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}
                    >
                      {stat.value}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 12,
                        fontWeight: 600,
                        color: stat.up ? "var(--safe)" : "var(--sos)",
                        background: stat.up ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {stat.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {stat.trend}
                    </span>
                  </div>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "4px 0 0" }}>
                    {stat.detail}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── Main Chart + Donut Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)",
          gap: 16,
          marginBottom: 24,
          alignItems: "start",
        }}
      >
        {/* Line Chart */}
        <Card delay={0.1}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
                User Growth
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Total registered families over 12 months</p>
            </div>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: "rgba(var(--gold-rgb),0.10)",
                color: "var(--gold)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              +33.5%
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H + 28}`}
              style={{ width: "100%", minWidth: 320, display: "block" }}
              aria-label="User growth line chart"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A853" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#D4A853" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map(f => (
                <line
                  key={f}
                  x1={30}
                  y1={20 + (1 - f) * 160}
                  x2={SVG_W - 30}
                  y2={20 + (1 - f) * 160}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
              ))}

              {/* Area fill */}
              <path d={areaPath} fill="url(#areaGrad)" />

              {/* Animated line */}
              <motion.path
                d={linePath}
                fill="none"
                stroke="#D4A853"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
              />

              {/* Data points */}
              {points.map((pt, i) => (
                <motion.circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill="#D4A853"
                  stroke="var(--bg-surface)"
                  strokeWidth={2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                />
              ))}

              {/* X-axis labels */}
              {points.map((pt, i) => (
                <text
                  key={i}
                  x={pt.x}
                  y={SVG_H + 18}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--text-muted)"
                  fontFamily="Inter, sans-serif"
                >
                  {MONTH_LABELS[i]}
                </text>
              ))}
            </svg>
          </div>
        </Card>

        {/* Donut Chart */}
        <Card delay={0.15}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 16px" }}>
            Plan Distribution
          </h3>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <svg viewBox="0 0 180 180" style={{ width: 160, height: 160 }} aria-label="Plan distribution donut chart">
              {donutSlices.map((slice, i) => (
                <motion.circle
                  key={i}
                  cx={90}
                  cy={90}
                  r={60}
                  fill="none"
                  stroke={slice.color === "var(--text-muted)" ? "#6B7280" : slice.color === "var(--gold)" ? "#D4A853" : "#4B80F0"}
                  strokeWidth={28}
                  strokeDasharray={slice.dashArray}
                  strokeDashoffset={slice.dashOffset}
                  strokeLinecap="butt"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "90px 90px" }}
                  initial={{ strokeDasharray: "0 377" }}
                  animate={{ strokeDasharray: slice.dashArray }}
                  transition={{ duration: 1.2, delay: i * 0.25, ease: "easeOut" }}
                />
              ))}
              <text x={90} y={86} textAnchor="middle" fontSize={22} fontWeight={800} fontFamily="Plus Jakarta Sans, sans-serif" fill="var(--text-primary)">
                50K
              </text>
              <text x={90} y={103} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontFamily="Inter, sans-serif">
                families
              </text>
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {livePlanData.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: item.color === "var(--text-muted)" ? "#6B7280" : item.color === "var(--gold)" ? "#D4A853" : "#4B80F0",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.pct}%</span>
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Activity Feed ── */}
      <Card delay={0.2} style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 16px" }}>
          Recent Activity
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ACTIVITY.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 0",
                borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `${item.dot}22`,
                  border: `2px solid ${item.dot}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.text}
                  {item.location && (
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> — {item.location}</span>
                  )}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>{item.time}</p>
              </div>
              <button
                style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-strong)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.18s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--gold)"
                  e.currentTarget.style.color = "var(--gold)"
                  e.currentTarget.style.background = "rgba(var(--gold-rgb),0.06)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border-strong)"
                  e.currentTarget.style.color = "var(--text-secondary)"
                  e.currentTarget.style.background = "transparent"
                }}
              >
                {item.action}
              </button>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* ── Bottom Row: Top Cities + Quick Actions ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: 16,
        }}
      >
        {/* Top Cities */}
        <Card delay={0.28}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 18px" }}>
            Top Cities
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {TOP_CITIES.map((city, i) => (
              <div key={city.city}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{city.city}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    {city.count.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 4,
                    background: "var(--bg-surface2)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(city.count / MAX_CITY) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.35 + i * 0.08, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      borderRadius: 4,
                      background: i === 0
                        ? "linear-gradient(90deg, #C9913A, #D4A853)"
                        : i === 1
                        ? "linear-gradient(90deg, #4B80F0, #6B96F5)"
                        : "linear-gradient(90deg, #10B981, #34D399)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card delay={0.32}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 18px" }}>
            Quick Actions
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 12px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface2)",
                    cursor: "pointer",
                    transition: "border-color 0.18s, background 0.18s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = action.color
                    e.currentTarget.style.background = `${action.color}12`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--border)"
                    e.currentTarget.style.background = "var(--bg-surface2)"
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${action.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} style={{ color: action.color }} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {action.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
