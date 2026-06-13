'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { drivingApi } from '@/lib/api'
import {
  Car,
  AlertTriangle,
  Gauge,
  Phone,
  Shield,
  MapPin,
  Clock,
  TrendingDown,
  TrendingUp,
  Eye,
  Flag,
  MoreHorizontal,
} from 'lucide-react'

/* ──────────────────────────── types ──────────────────────────── */
interface DriverScore {
  name: string
  initials: string
  family: string
  score: number
  incidents: number
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface Incident {
  id: string
  type: 'Speeding' | 'Phone Use' | 'Harsh Brake' | 'Rapid Accel'
  member: string
  memberInitials: string
  memberColor: string
  detail: string
  location: string
  time: string
  actionTaken: string
  status: 'Resolved' | 'Pending' | 'Logged'
}

interface AlertRule {
  id: string
  name: string
  value: string
  enabled: boolean
  category: string
}

/* ──────────────────────────── data ───────────────────────────── */
const TOP_DRIVERS: DriverScore[] = [
  { name: 'Kavita Sharma',   initials: 'KS', family: 'Sharma Family',   score: 98, incidents: 0, trend: 'stable', color: '#10B981' },
  { name: 'Meera Iyer',      initials: 'MI', family: 'Iyer Circle',     score: 96, incidents: 0, trend: 'up',     color: '#10B981' },
  { name: 'Sunita Mehta',    initials: 'SM', family: 'Mehta Household', score: 94, incidents: 1, trend: 'stable', color: '#10B981' },
  { name: 'Deepa Kapoor',    initials: 'DK', family: 'Kapoor Family',   score: 92, incidents: 1, trend: 'up',     color: '#10B981' },
  { name: 'Priya Joshi',     initials: 'PJ', family: 'Joshi Family',    score: 91, incidents: 0, trend: 'up',     color: '#10B981' },
]

const FLAGGED_DRIVERS: DriverScore[] = [
  { name: 'Rahul Singh',     initials: 'RS', family: 'Singh Circle',    score: 48, incidents: 14, trend: 'down', color: '#EF4444' },
  { name: 'Arjun Gupta',     initials: 'AG', family: 'Gupta Family',    score: 54, incidents: 11, trend: 'down', color: '#EF4444' },
  { name: 'Vikram Patel',    initials: 'VP', family: 'Patel Group',     score: 59, incidents: 9,  trend: 'down', color: '#F59E0B' },
  { name: 'Karan Reddy',     initials: 'KR', family: 'Reddy Household', score: 62, incidents: 7,  trend: 'down', color: '#F59E0B' },
  { name: 'Rohan Verma',     initials: 'RV', family: 'Verma Family',    score: 65, incidents: 6,  trend: 'stable', color: '#F59E0B' },
]

const INCIDENTS: Incident[] = [
  { id: 'INC-001', type: 'Speeding',    member: 'Rahul Sharma',    memberInitials: 'RS', memberColor: '#EF4444', detail: '98 km/h in 60 zone',        location: 'Mumbai Highway',    time: '9:15 AM',  actionTaken: 'Alert Sent',     status: 'Resolved' },
  { id: 'INC-002', type: 'Phone Use',   member: 'Ananya Mehta',    memberInitials: 'AM', memberColor: '#F59E0B', detail: 'Phone detected',             location: 'Delhi Ring Road',   time: '10:30 AM', actionTaken: 'Notification',   status: 'Pending' },
  { id: 'INC-003', type: 'Harsh Brake', member: 'Arjun Iyer',      memberInitials: 'AI', memberColor: '#D4A853', detail: '4.2G force',                 location: 'Koramangala, Bangalore', time: '11:45 AM', actionTaken: 'Auto-logged', status: 'Logged' },
  { id: 'INC-004', type: 'Speeding',    member: 'Vikram Kapoor',   memberInitials: 'VK', memberColor: '#EF4444', detail: '112 km/h in 80 zone',        location: 'Pune Expressway',   time: '12:10 PM', actionTaken: 'Alert Sent',     status: 'Resolved' },
  { id: 'INC-005', type: 'Rapid Accel', member: 'Neha Patel',      memberInitials: 'NP', memberColor: '#4B80F0', detail: '3.8G force — 0 to 80 km/h', location: 'Ahmedabad Ring',    time: '1:22 PM',  actionTaken: 'Auto-logged',    status: 'Logged' },
  { id: 'INC-006', type: 'Phone Use',   member: 'Suresh Joshi',    memberInitials: 'SJ', memberColor: '#F59E0B', detail: 'Phone detected while driving', location: 'Chennai OMR',    time: '2:08 PM',  actionTaken: 'Notification',   status: 'Pending' },
  { id: 'INC-007', type: 'Harsh Brake', member: 'Divya Reddy',     memberInitials: 'DR', memberColor: '#D4A853', detail: '3.6G force',                 location: 'Hyderabad Outer Ring', time: '2:55 PM', actionTaken: 'Auto-logged', status: 'Logged' },
  { id: 'INC-008', type: 'Speeding',    member: 'Karan Verma',     memberInitials: 'KV', memberColor: '#EF4444', detail: '104 km/h in 80 zone',        location: 'Kolkata Bypass',    time: '3:30 PM',  actionTaken: 'Alert Sent',     status: 'Resolved' },
  { id: 'INC-009', type: 'Phone Use',   member: 'Lakshmi Singh',   memberInitials: 'LS', memberColor: '#F59E0B', detail: 'Phone detected',             location: 'Jaipur NH',         time: '4:15 PM',  actionTaken: 'Notification',   status: 'Pending' },
  { id: 'INC-010', type: 'Rapid Accel', member: 'Rohit Gupta',     memberInitials: 'RG', memberColor: '#4B80F0', detail: '4.1G force',                 location: 'Surat BRTS',        time: '5:02 PM',  actionTaken: 'Auto-logged',    status: 'Logged' },
]

const ALERT_RULES: AlertRule[] = [
  { id: 'rule-1', name: 'Speed Threshold',      value: '80 km/h',   enabled: true,  category: 'Speed' },
  { id: 'rule-2', name: 'Phone-Use Detection',  value: 'On',        enabled: true,  category: 'Phone' },
  { id: 'rule-3', name: 'Harsh Brake Sensitivity', value: '3.5G',   enabled: true,  category: 'Brake' },
  { id: 'rule-4', name: 'Rapid Acceleration',   value: '3.0G',      enabled: true,  category: 'Accel' },
  { id: 'rule-5', name: 'Night Driving Alerts', value: '10pm–5am',  enabled: false, category: 'Night' },
  { id: 'rule-6', name: 'School Zone Speed',    value: '30 km/h',   enabled: true,  category: 'Zone' },
]

/* hourly incidents for the day pattern */
const HOURLY_INCIDENTS = [
  1, 0, 0, 1, 2, 3, 6, 12, 18, 22, 19, 15,
  14, 13, 11, 12, 16, 21, 24, 19, 14, 9, 5, 2,
]
const MAX_INC = Math.max(...HOURLY_INCIDENTS)

/* ──────────────────────────── helpers ────────────────────────── */
const cardVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
}

function incidentTypeBadge(type: Incident['type']) {
  const map = {
    'Speeding':    { bg: 'rgba(239,68,68,0.12)',   color: '#EF4444', border: 'rgba(239,68,68,0.3)' },
    'Phone Use':   { bg: 'rgba(249,115,22,0.12)',  color: '#F97316', border: 'rgba(249,115,22,0.3)' },
    'Harsh Brake': { bg: 'rgba(234,179,8,0.12)',   color: '#EAB308', border: 'rgba(234,179,8,0.3)' },
    'Rapid Accel': { bg: 'rgba(75,128,240,0.12)',  color: '#4B80F0', border: 'rgba(75,128,240,0.3)' },
  }
  const s = map[type]
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {type}
    </span>
  )
}

function statusBadge(status: Incident['status']) {
  const map = {
    Resolved: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.25)' },
    Pending:  { bg: 'rgba(239,68,68,0.10)',  color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
    Logged:   { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', border: 'rgba(107,114,128,0.2)' },
  }
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', dot: '#6B7280' }
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600 }}>
      {status}
    </span>
  )
}

function scoreColor(score: number) {
  if (score >= 90) return '#10B981'
  if (score >= 75) return '#D4A853'
  if (score >= 60) return '#F97316'
  return '#EF4444'
}

/* ──────────────────────────── driver row ─────────────────────── */
function DriverRow({ driver, index, isFlagged }: { driver: DriverScore; index: number; isFlagged: boolean }) {
  const sc = scoreColor(driver.score)
  return (
    <motion.div
      initial={{ opacity: 0, x: isFlagged ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 + 0.4 }}
      whileHover={{ backgroundColor: isFlagged ? 'rgba(239,68,68,0.04)' : 'rgba(16,185,129,0.04)' } as any}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12, cursor: 'default' }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', width: 18, textAlign: 'center', flexShrink: 0 }}>{index + 1}</span>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: driver.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
        {driver.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{driver.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.family}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {isFlagged && driver.score < 60 && (
          <span style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 999, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
            HIGH RISK
          </span>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
          {driver.incidents} incident{driver.incidents !== 1 ? 's' : ''}
        </div>
        {driver.trend === 'up' ? <TrendingUp size={13} color="#10B981" /> : driver.trend === 'down' ? <TrendingDown size={13} color="#EF4444" /> : <div style={{ width: 13 }} />}
        {/* score circle */}
        <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
          <svg viewBox="0 0 44 44" style={{ width: 44, height: 44, transform: 'rotate(-90deg)' }}>
            <circle cx={22} cy={22} r={18} fill="none" stroke="var(--border)" strokeWidth={4} />
            <motion.circle
              cx={22} cy={22} r={18} fill="none"
              stroke={sc} strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${(driver.score / 100) * 113} 113`}
              initial={{ strokeDasharray: '0 113' }}
              animate={{ strokeDasharray: `${(driver.score / 100) * 113} 113` }}
              transition={{ duration: 0.9, delay: index * 0.07 + 0.5, ease: 'easeOut' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: sc }}>
            {driver.score}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────── toggle ─────────────────────────── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <motion.div
      onClick={onToggle}
      animate={{ backgroundColor: enabled ? '#10B981' : 'var(--border)' }}
      style={{ width: 42, height: 23, borderRadius: 999, cursor: 'pointer', position: 'relative', flexShrink: 0 }}
    >
      <motion.div
        animate={{ left: enabled ? 22 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        style={{ position: 'absolute', top: 3, width: 17, height: 17, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
      />
    </motion.div>
  )
}

/* ──────────────────────────── page ───────────────────────────── */
export default function DrivingSafetyPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [rules, setRules] = useState<AlertRule[]>(ALERT_RULES)
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS)

  useEffect(() => {
    drivingApi.events(10)
      .then((events: any[]) => {
        if (events && events.length > 0) {
          setIncidents(events.map((e: any, idx: number) => ({
            id: `INC-${String(idx + 1).padStart(3, "0")}`,
            type: (e.type === "speeding" ? "Speeding" : e.type === "phone_use" ? "Phone Use" : "Harsh Brake") as Incident['type'],
            member: e.user_name ?? "Unknown",
            memberInitials: (e.user_name ?? "UN").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
            memberColor: '#EF4444',
            detail: e.speed ? `${e.speed} km/h` : "Detected",
            location: "India",
            time: e.occurred_at ? new Date(e.occurred_at).toLocaleTimeString("en-IN") : "",
            actionTaken: e.resolved ? "Alert Sent" : "Notification",
            status: (e.resolved ? "Resolved" : "Pending") as Incident['status'],
          })))
        }
      })
      .catch(() => {})
  }, [])

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const STATS = [
    { label: 'Speeding Incidents Today', value: '234', trend: '↓12% vs yesterday', trendUp: true, sub: 'Speed violations detected', color: '#EF4444', icon: Gauge },
    { label: 'Phone-Use Alerts',         value: '89',  trend: '↑5 new',            trendUp: false, sub: 'While driving detected',  color: '#F97316', icon: Phone },
    { label: 'Harsh Braking Events',     value: '156', trend: '↓18% improved',     trendUp: true, sub: 'High G-force events',     color: '#EAB308', icon: AlertTriangle },
    { label: 'Safe Journeys',            value: '23,456', trend: '96.2%',          trendUp: true, sub: 'Excellent — no incidents', color: '#10B981', icon: Shield },
  ]

  const peakHours = new Set([7, 8, 9, 17, 18, 19, 20])

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Driving Safety
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #C9913A, #D4A853)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              borderRadius: 6,
              padding: '3px 8px',
            }}>
              NEW
            </span>
            {/* safety score badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 999,
              padding: '5px 14px',
            }}>
              <Shield size={13} color="#10B981" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>Avg Score: 87/100</span>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Monitor driving behavior across all families
          </p>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(({ label, value, trend, trendUp, sub, color, icon: Icon }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px 22px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={19} color={color} />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: trendUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: trendUp ? '#10B981' : '#EF4444',
                padding: '2px 8px', borderRadius: 999,
                whiteSpace: 'nowrap',
              }}>
                {trendUp ? <TrendingDown size={9} style={{ display: 'inline', marginRight: 2 }} /> : <TrendingUp size={9} style={{ display: 'inline', marginRight: 2 }} />}
                {trend}
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Leaderboard ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}
      >
        {/* Top 5 safest */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.04)' }}>
            <Shield size={15} color="#10B981" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Safest Drivers</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top 5 this week</div>
            </div>
          </div>
          <div style={{ padding: '10px 4px' }}>
            {TOP_DRIVERS.map((d, i) => (
              <DriverRow key={d.name} driver={d} index={i} isFlagged={false} />
            ))}
          </div>
        </div>

        {/* Bottom 5 flagged */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.04)' }}>
            <Flag size={15} color="#EF4444" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Flagged Drivers</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Needs attention this week</div>
            </div>
          </div>
          <div style={{ padding: '10px 4px' }}>
            {FLAGGED_DRIVERS.map((d, i) => (
              <DriverRow key={d.name} driver={d} index={i} isFlagged={true} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Incidents Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Driving Incidents</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>All incidents logged today — {incidents.length} total</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Speeding', 'Phone Use', 'Harsh Brake', 'Rapid Accel'] as const).map(t => (
              <span key={t} style={{ fontSize: 10, fontWeight: 600, background: 'var(--bg-surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 999, padding: '3px 9px', cursor: 'pointer' }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Type', 'Member', 'Speed / Detail', 'Location', 'Time', 'Action Taken', 'Status', 'Actions'].map(col => (
                <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.45 }}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: row.status === 'Pending'
                    ? (i % 2 === 1 ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.02)')
                    : (i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent'),
                  cursor: 'pointer',
                }}
                whileHover={{ backgroundColor: row.status === 'Pending' ? 'rgba(239,68,68,0.07)' : 'rgba(75,128,240,0.04)' } as any}
              >
                <td style={{ padding: '12px 16px' }}>{incidentTypeBadge(row.type)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: row.memberColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {row.memberInitials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.member}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: row.type === 'Speeding' ? '#EF4444' : 'var(--text-secondary)', fontWeight: row.type === 'Speeding' ? 700 : 500 }}>
                  {row.detail}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <MapPin size={11} color="var(--text-muted)" />
                    {row.location}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    <Clock size={11} />
                    {row.time}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{row.actionTaken}</td>
                <td style={{ padding: '12px 16px' }}>{statusBadge(row.status)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <motion.button
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}
                    >
                      <Eye size={12} />
                    </motion.button>
                    <div style={{ position: 'relative' }}>
                      <motion.button
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        <MoreHorizontal size={12} />
                      </motion.button>
                      <AnimatePresence>
                        {openMenu === row.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            style={{ position: 'absolute', right: 0, top: 34, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 6, zIndex: 100, minWidth: 156, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
                          >
                            {['View Driver Profile', 'Send Warning', 'Mark Resolved', 'Export Incident'].map(action => (
                              <div key={action}
                                style={{ padding: '8px 12px', fontSize: 13, color: action === 'Send Warning' ? '#EF4444' : 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                {action}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '13px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>1–10</strong> of <strong style={{ color: 'var(--text-primary)' }}>234</strong> incidents today
          </span>
          <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>{incidents.filter(r => r.status === 'Pending').length} pending action</span>
        </div>
      </motion.div>

      {/* ── Driving Patterns Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 26px', marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Driving Patterns</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Incidents by hour — peak unsafe hours highlighted</div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {[{ color: '#EF4444', label: 'Peak hours' }, { color: '#10B981', label: 'Safe hours' }].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <svg viewBox="0 0 960 190" style={{ width: '100%', display: 'block' }} aria-label="Hourly driving incidents chart">
          {/* grid */}
          {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={20} y1={10 + (1 - f) * 155} x2={950} y2={10 + (1 - f) * 155}
              stroke="var(--border)" strokeWidth={1} strokeDasharray="3 4" />
          ))}

          {HOURLY_INCIDENTS.map((v, i) => {
            const barW = 30
            const gap = (960 - 20 - barW * 24) / 23
            const x = 20 + i * (barW + gap)
            const barH = v === 0 ? 2 : (v / MAX_INC) * 155
            const y = 10 + 155 - barH
            const isPeak = peakHours.has(i)
            return (
              <motion.rect
                key={i}
                x={x} y={y}
                width={barW}
                height={0}
                rx={4} ry={4}
                fill={isPeak ? '#EF4444' : '#10B981'}
                fillOpacity={isPeak ? 0.85 : 0.6}
                animate={{ height: barH, y }}
                initial={{ height: 0, y: 165 }}
                transition={{ duration: 0.65, delay: i * 0.025, ease: 'easeOut' }}
              />
            )
          })}

          {/* x labels every 3 hours */}
          {[0, 3, 6, 9, 12, 15, 18, 21].map(h => {
            const barW = 30
            const gap = (960 - 20 - barW * 24) / 23
            const x = 20 + h * (barW + gap) + barW / 2
            return (
              <text key={h} x={x} y={178} textAnchor="middle" fontSize={10} fill={peakHours.has(h) ? '#EF4444' : 'var(--text-muted)'} fontFamily="Inter, sans-serif" fontWeight={peakHours.has(h) ? '700' : '400'}>
                {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
              </text>
            )
          })}
        </svg>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#EF4444', fontWeight: 600 }}>
            Peak unsafe: 7am–9am, 5pm–8pm
          </div>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#10B981', fontWeight: 600 }}>
            Safest: 10pm–6am
          </div>
        </div>
      </motion.div>

      {/* ── Vehicle Safety Comparison ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 26px', marginBottom: 24 }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Vehicle Safety Stats</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Safety rating by vehicle type — bikes show higher incident rate</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {[
            { label: 'Cars', pct: 78, incidents: 168, color: '#10B981', icon: Car, note: 'Good — stable safety trend' },
            { label: 'Bikes', pct: 61, incidents: 310, color: '#F97316', icon: Car, note: 'Higher risk — more incidents per km' },
          ].map(({ label, pct, incidents, color, note }, i) => (
            <div key={label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}16`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Car size={17} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{note}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{incidents} incidents</div>
                </div>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: 'var(--bg-surface2)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.0, delay: i * 0.15 + 0.55, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 5, background: `linear-gradient(90deg, ${color}, ${color}99)`, position: 'relative', overflow: 'hidden' }}
                >
                  <motion.div
                    animate={{ x: ['0%', '200%'] }}
                    transition={{ duration: 1.5, delay: i * 0.15 + 0.7, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '100%', background: 'rgba(255,255,255,0.2)', borderRadius: 5 }}
                  />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Auto-Alert Rules ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={16} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Auto-Alert Rules</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure automated detection thresholds and triggers</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Rule', 'Category', 'Threshold / Value', 'Status', 'Actions'].map(col => (
                <th key={col} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, i) => (
              <motion.tr
                key={rule.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.58 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                whileHover={{ backgroundColor: 'rgba(75,128,240,0.03)' } as any}
              >
                <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {rule.name}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    background: 'var(--bg-surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '2px 9px',
                    color: 'var(--text-muted)',
                  }}>
                    {rule.category}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)' }}>{rule.value}</span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Toggle enabled={rule.enabled} onToggle={() => toggleRule(rule.id)} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: rule.enabled ? '#10B981' : 'var(--text-muted)' }}>
                      {rule.enabled ? 'Active' : 'Off'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid rgba(var(--gold-rgb),0.3)', background: 'rgba(var(--gold-rgb),0.08)', color: 'var(--gold)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                  >
                    Edit
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <strong style={{ color: rules.filter(r => r.enabled).length > 3 ? '#10B981' : '#F59E0B' }}>{rules.filter(r => r.enabled).length}</strong> of {rules.length} rules active
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '7px 16px', borderRadius: 10, border: '1px solid rgba(var(--gold-rgb),0.3)', background: 'rgba(var(--gold-rgb),0.1)', color: 'var(--gold)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>

    </div>
  )
}
