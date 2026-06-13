'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { adminApi } from '@/lib/api'
import { TrendingUp, TrendingDown, Users, Clock, BarChart2, Download } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const TOTAL_USERS  = [12000, 18000, 24000, 31000, 38000, 44000, 48000, 42000, 46000, 49000, 50234, 52000]
const NEW_USERS    = [2000,  6000,  6000,  7000,  7000,  6000,  4000,  5000,  4000,  3000,  1234,  1766]

const FEATURES = [
  { label: "Live Tracking",    pct: 94, color: "#D4A853" },
  { label: "Geofence Alerts",  pct: 78, color: "#4B80F0" },
  { label: "Battery Alerts",   pct: 71, color: "#10B981" },
  { label: "Check-in",         pct: 56, color: "#A78BFA" },
  { label: "Ghost Mode",       pct: 34, color: "#F59E0B" },
  { label: "SOS",              pct: 12, color: "#EF4444" },
]

const CITIES = [
  { city: "Mumbai",    users: 18432 },
  { city: "Delhi",     users: 15234 },
  { city: "Bangalore", users: 12890 },
  { city: "Chennai",   users: 9820 },
  { city: "Hyderabad", users: 8760 },
  { city: "Pune",      users: 7234 },
  { city: "Kolkata",   users: 6890 },
  { city: "Ahmedabad", users: 5234 },
]
const MAX_CITY_USERS = 18432

const COHORT_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]
const COHORTS = [
  { label: "Jun 1", data: [100, 82, 74, 68, 63, 59, 56, 54] },
  { label: "May 25", data: [100, 79, 71, 65, 60, 57, 54, 52] },
  { label: "May 18", data: [100, 81, 73, 67, 62, 58, 55, 53] },
  { label: "May 11", data: [100, 83, 75, 69, 64, 60, 57, 55] },
  { label: "May 4",  data: [100, 80, 72, 66, 61, 57, 54, 52] },
]

const APP_VERSIONS = [
  { label: "v2.4.1", pct: 62, color: "#D4A853" },
  { label: "v2.4.0", pct: 18, color: "#4B80F0" },
  { label: "Older",  pct: 20, color: "#6B7280" },
]

const FUNNEL = [
  { label: "Install",              count: "142,891", pct: 100 },
  { label: "Register",             count: "98,234",  pct: 69 },
  { label: "Create Circle",        count: "74,182",  pct: 52 },
  { label: "Invite Member",        count: "58,340",  pct: 41 },
  { label: "First Location Share", count: "49,122",  pct: 34 },
  { label: "Day 7 Active",         count: "38,906",  pct: 27 },
]

const KPIS = [
  { label: "DAU",          value: "89,432",  trend: "+4.2%",  up: true,  icon: Users },
  { label: "MAU",          value: "142,891", trend: "+12.1%", up: true,  icon: Users },
  { label: "Avg Session",  value: "8.4 min", trend: "+0.6 min", up: true, icon: Clock },
  { label: "Retention",    value: "78.3%",   trend: "+1.4%",  up: true,  icon: TrendingUp },
]

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom"]

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

function getPoints(data: number[], w: number, h: number, padX = 40, padY = 24) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  return data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * (w - padX * 2),
    y: padY + (1 - (v - min) / range) * (h - padY * 2),
    value: v,
  }))
}

function cohortColor(val: number): string {
  if (val >= 90) return "rgba(16,185,129,0.85)"
  if (val >= 70) return "rgba(16,185,129,0.55)"
  if (val >= 55) return "rgba(212,168,83,0.55)"
  if (val >= 40) return "rgba(212,168,83,0.30)"
  return "rgba(239,68,68,0.25)"
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

// ── Donut helpers ─────────────────────────────────────────────────────────────

function buildDonutSlices(segments: { pct: number; color: string; label: string }[], r = 60, cx = 90, cy = 90) {
  const circ = 2 * Math.PI * r
  let offset = 0
  return segments.map(seg => {
    const dash = (seg.pct / 100) * circ
    const gap  = circ - dash
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeRange, setActiveRange] = useState("Last 30 days")
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    adminApi.analytics()
      .then(d => setAnalyticsData(d))
      .catch(() => {})
  }, [])

  const SVG_W = 800
  const SVG_H = 280

  const totalLinePath  = buildLinePath(TOTAL_USERS, SVG_W, SVG_H)
  const totalAreaPath  = buildAreaPath(TOTAL_USERS, SVG_W, SVG_H)
  const newLinePath    = buildLinePath(NEW_USERS, SVG_W, SVG_H)
  const totalPoints    = getPoints(TOTAL_USERS, SVG_W, SVG_H)

  const donutSlices = buildDonutSlices(APP_VERSIONS)

  return (
    <div style={{ fontFamily: "Inter, sans-serif", maxWidth: 1400, margin: "0 auto" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-primary)", margin: "0 0 4px" }}>
            Analytics
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
            Product usage, growth, and engagement insights
          </p>
        </div>

        {/* Date range picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2 }}>
            {DATE_RANGES.map(r => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: activeRange === r ? 600 : 500,
                  background: activeRange === r ? "rgba(var(--gold-rgb),0.14)" : "transparent",
                  color: activeRange === r ? "var(--gold)" : "var(--text-secondary)",
                  transition: "all 0.18s",
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #C9913A, #D4A853)",
              color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}
          >
            <Download size={14} />
            Export
          </motion.button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {KPIS.map((kpi, i) => {
          const Icon = kpi.icon
          const displayValue = kpi.label === "DAU"
            ? (analyticsData?.total_users != null ? analyticsData.total_users.toLocaleString("en-IN") : kpi.value)
            : kpi.label === "MAU"
            ? (analyticsData?.total_devices != null ? analyticsData.total_devices.toLocaleString("en-IN") : kpi.value)
            : kpi.value
          return (
            <Card key={kpi.label} delay={i * 0.07}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "0 0 8px", fontWeight: 500 }}>{kpi.label}</p>
                  <span
                    className="gradient-text-gold"
                    style={{ fontSize: 28, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1, display: "block" }}
                  >
                    {displayValue}
                  </span>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 3, marginTop: 8,
                      fontSize: 12, fontWeight: 600,
                      color: kpi.up ? "var(--safe)" : "var(--sos)",
                      background: kpi.up ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
                      padding: "2px 9px", borderRadius: 999,
                    }}
                  >
                    {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {kpi.trend}
                  </span>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(var(--gold-rgb),0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} style={{ color: "var(--gold)" }} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* ── User Growth Chart ── */}
      <Card delay={0.1} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
              User Growth
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Total users vs new users per month (Jan - Dec 2025)</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 3, borderRadius: 2, background: "#D4A853" }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Total Users</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 3, borderRadius: 2, background: "#4B80F0" }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>New Users</span>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H + 32}`} style={{ width: "100%", minWidth: 480, display: "block" }} aria-label="User growth chart">
            <defs>
              <linearGradient id="analAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A853" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#D4A853" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="analAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4B80F0" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#4B80F0" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0.2, 0.4, 0.6, 0.8, 1].map(f => (
              <line key={f} x1={40} y1={24 + (1 - f) * (SVG_H - 48)} x2={SVG_W - 40} y2={24 + (1 - f) * (SVG_H - 48)}
                stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
            ))}

            {/* Area fills */}
            <path d={totalAreaPath} fill="url(#analAreaGrad)" />

            {/* Lines */}
            <motion.path
              d={newLinePath} fill="none" stroke="#4B80F0" strokeWidth={2} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.path
              d={totalLinePath} fill="none" stroke="#D4A853" strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
            />

            {/* Data points */}
            {totalPoints.map((pt, i) => (
              <motion.circle key={i} cx={pt.x} cy={pt.y} r={4} fill="#D4A853" stroke="var(--bg-surface)" strokeWidth={2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.06 }}
              />
            ))}

            {/* X-axis labels */}
            {MONTH_LABELS.map((label, i) => {
              const x = 40 + (i / (MONTH_LABELS.length - 1)) * (SVG_W - 80)
              return (
                <text key={i} x={x} y={SVG_H + 22} textAnchor="middle" fontSize={11}
                  fill="var(--text-muted)" fontFamily="Inter, sans-serif">
                  {label}
                </text>
              )
            })}

            {/* Y-axis value labels */}
            {[0, 13000, 26000, 39000, 52000].map((val, i) => (
              <text key={i} x={35} y={24 + (1 - val / 52000) * (SVG_H - 48)} textAnchor="end"
                fontSize={9} fill="var(--text-muted)" fontFamily="Inter, sans-serif"
                dominantBaseline="middle">
                {val === 0 ? "0" : `${val / 1000}K`}
              </text>
            ))}
          </svg>
        </div>
      </Card>

      {/* ── Feature Usage + Geographic Distribution ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, marginBottom: 24 }}>

        {/* Feature Usage */}
        <Card delay={0.15}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>
              Feature Usage
            </h3>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>% of active users</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FEATURES.map((feat, i) => (
              <div key={feat.label}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{ cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{feat.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: hoveredFeature === i ? feat.color : "var(--text-primary)", transition: "color 0.18s" }}>
                    {feat.pct}%
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "var(--bg-surface2)", overflow: "hidden", position: "relative" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feat.pct}%` }}
                    transition={{ duration: 1.0, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                    style={{ height: "100%", borderRadius: 4, background: feat.color, position: "relative", overflow: "hidden" }}
                  >
                    <motion.div
                      animate={{ x: ["0%", "200%"] }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.08, ease: "easeInOut" }}
                      style={{ position: "absolute", top: 0, left: 0, width: "40%", height: "100%", background: "rgba(255,255,255,0.25)", borderRadius: 4 }}
                    />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card delay={0.2}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>
              Top Cities
            </h3>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>by active users</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {CITIES.map((city, i) => (
              <div key={city.city}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", width: 18, textAlign: "right" }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{city.city}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    {city.users.toLocaleString()}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-surface2)", overflow: "hidden", marginLeft: 26 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(city.users / MAX_CITY_USERS) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.35 + i * 0.07, ease: "easeOut" }}
                    style={{
                      height: "100%", borderRadius: 3,
                      background: i === 0
                        ? "linear-gradient(90deg, #C9913A, #D4A853)"
                        : i < 3 ? "linear-gradient(90deg, #4B80F0, #6B96F5)"
                        : "linear-gradient(90deg, #10B981, #34D399)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Retention Cohort + App Version ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16, marginBottom: 24 }}>

        {/* Retention Cohort Heatmap */}
        <Card delay={0.25}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
              Retention Cohorts
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Weekly cohort retention — darker green = higher retention</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 3, minWidth: 400 }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textAlign: "left", padding: "4px 8px", width: 72 }}>Cohort</th>
                  {COHORT_WEEKS.map(w => (
                    <th key={w} style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textAlign: "center", padding: "4px 4px" }}>{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COHORTS.map((cohort, ci) => (
                  <motion.tr key={cohort.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + ci * 0.08 }}>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, padding: "4px 8px", whiteSpace: "nowrap" }}>
                      {cohort.label}
                    </td>
                    {cohort.data.map((val, wi) => (
                      <td key={wi} style={{ textAlign: "center", padding: "3px 2px" }}>
                        <div style={{
                          background: cohortColor(val),
                          borderRadius: 6,
                          padding: "6px 2px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: val >= 70 ? "#fff" : "var(--text-primary)",
                          minWidth: 36,
                        }}>
                          {val}%
                        </div>
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* App Version Donut */}
        <Card delay={0.3}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 16px" }}>
            App Version Adoption
          </h3>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <svg viewBox="0 0 180 180" style={{ width: 150, height: 150 }} aria-label="App version adoption donut chart">
              {donutSlices.map((slice, i) => (
                <motion.circle key={i} cx={90} cy={90} r={60} fill="none"
                  stroke={slice.color} strokeWidth={28}
                  strokeDasharray={slice.dashArray}
                  strokeDashoffset={slice.dashOffset}
                  strokeLinecap="butt"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "90px 90px" }}
                  initial={{ strokeDasharray: "0 377" }}
                  animate={{ strokeDasharray: slice.dashArray }}
                  transition={{ duration: 1.2, delay: i * 0.25, ease: "easeOut" }}
                />
              ))}
              <text x={90} y={86} textAnchor="middle" fontSize={14} fontWeight={800}
                fontFamily="Plus Jakarta Sans, sans-serif" fill="var(--text-primary)">v2.4.1</text>
              <text x={90} y={102} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontFamily="Inter, sans-serif">latest</text>
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {APP_VERSIONS.map((ver, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: ver.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{ver.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{ver.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Engagement Funnel ── */}
      <Card delay={0.35} style={{ marginBottom: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: "0 0 2px" }}>
            Engagement Funnel
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>User journey from install to Day 7 active</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          {FUNNEL.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, scaleX: 0.7 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.55, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}
            >
              <div
                style={{
                  width: `${Math.max(step.pct, 20)}%`,
                  minWidth: 160,
                  background: i === 0
                    ? "linear-gradient(90deg, #C9913A, #D4A853)"
                    : `rgba(212,168,83,${0.85 - i * 0.12})`,
                  borderRadius: i === 0 ? "10px 10px 6px 6px" : i === FUNNEL.length - 1 ? "4px 4px 10px 10px" : 4,
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  transition: "width 0.3s ease",
                  boxShadow: i === 0 ? "0 4px 20px rgba(212,168,83,0.25)" : "none",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? "#fff" : "var(--text-primary)", whiteSpace: "nowrap" }}>
                  {step.label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? "#fff" : "var(--text-primary)" }}>
                    {step.count}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: i === 0 ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.12)",
                    color: i === 0 ? "#fff" : "var(--text-primary)",
                  }}>
                    {step.pct}%
                  </span>
                </div>
              </div>
              {i < FUNNEL.length - 1 && (
                <div style={{ width: 2, height: 6, background: "var(--border-strong)" }} />
              )}
            </motion.div>
          ))}
        </div>
      </Card>

    </div>
  )
}
