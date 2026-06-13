'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { healthApi } from '@/lib/api'
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Moon,
  Sun,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  MoreHorizontal,
  Bell,
  Eye,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
interface MetricCard {
  icon: React.ElementType
  name: string
  avg: string
  unit: string
  pctTracking: number
  trend: 'up' | 'down' | 'stable'
  warning: boolean
  color: string
  goal?: string
}

interface HealthAlert {
  member: string
  initials: string
  family: string
  alertType: string
  metric: string
  value: string
  threshold: string
  since: string
  actionLabel: string
  color: string
}

interface MissedFamily {
  family: string
  admin: string
  missed: number
}

/* ─────────────────────────── data ──────────────────────────── */
const METRIC_CARDS: MetricCard[] = [
  { icon: Activity,    name: 'Daily Steps',     avg: '7,834',  unit: 'steps/day',   pctTracking: 68, trend: 'up',     warning: false, color: '#4B80F0', goal: '10,000 goal' },
  { icon: Moon,        name: 'Sleep',           avg: '6.8',    unit: 'hrs/night',   pctTracking: 45, trend: 'down',   warning: true,  color: '#8B5CF6', goal: '8 hrs goal' },
  { icon: Heart,       name: 'Heart Rate',      avg: '72',     unit: 'bpm avg',     pctTracking: 34, trend: 'stable', warning: false, color: '#EF4444' },
  { icon: Droplets,    name: 'Hydration',       avg: '1.8',    unit: 'L/day',       pctTracking: 28, trend: 'down',   warning: true,  color: '#06B6D4', goal: '2.5L goal' },
  { icon: Thermometer, name: 'Calories',        avg: '1,940',  unit: 'kcal/day',    pctTracking: 31, trend: 'stable', warning: false, color: '#F59E0B' },
  { icon: Sun,         name: 'Active Minutes',  avg: '42',     unit: 'min/day',     pctTracking: 52, trend: 'up',     warning: false, color: '#10B981', goal: '60 min goal' },
]

const HEALTH_ALERTS: HealthAlert[] = [
  { member: 'Dadi Sharma',     initials: 'DS', family: 'Sharma Family',     alertType: 'Low Activity',  metric: 'Steps',       value: '892/day',    threshold: '3,000 goal', since: '3 days', actionLabel: 'Send Alert',    color: '#F59E0B' },
  { member: 'Ramesh Iyer',     initials: 'RI', family: 'Iyer Family',       alertType: 'Poor Sleep',    metric: 'Sleep',       value: '4.2 hrs',    threshold: '7 hrs goal', since: '5 days', actionLabel: 'Notify Family', color: '#8B5CF6' },
  { member: 'Sunita Patel',    initials: 'SP', family: 'Patel Family',      alertType: 'Low Hydration', metric: 'Hydration',   value: '0.9 L/day',  threshold: '2.5L goal',  since: '2 days', actionLabel: 'Send Alert',    color: '#06B6D4' },
  { member: 'Nana Mehta',      initials: 'NM', family: 'Mehta Family',      alertType: 'Low Activity',  metric: 'Steps',       value: '1,204/day',  threshold: '3,000 goal', since: '4 days', actionLabel: 'Notify Family', color: '#F59E0B' },
  { member: 'Geeta Kapoor',    initials: 'GK', family: 'Kapoor Family',     alertType: 'Missed Meds',   metric: 'Medications', value: '2 missed',   threshold: '0 missed',   since: '1 day',  actionLabel: 'Send Alert',    color: '#EF4444' },
  { member: 'Bhanu Reddy',     initials: 'BR', family: 'Reddy Family',      alertType: 'High Resting HR', metric: 'Heart Rate', value: '98 bpm',   threshold: '90 bpm max', since: '2 days', actionLabel: 'Notify Family', color: '#EF4444' },
  { member: 'Kamla Joshi',     initials: 'KJ', family: 'Joshi Family',      alertType: 'Poor Sleep',    metric: 'Sleep',       value: '3.8 hrs',    threshold: '7 hrs goal', since: '6 days', actionLabel: 'Send Alert',    color: '#8B5CF6' },
  { member: 'Ratan Gupta',     initials: 'RG', family: 'Gupta Family',      alertType: 'Low Activity',  metric: 'Active Min',  value: '8 min/day',  threshold: '30 min goal', since: '3 days', actionLabel: 'Notify Family', color: '#F59E0B' },
  { member: 'Veena Nair',      initials: 'VN', family: 'Nair Family',       alertType: 'Low Hydration', metric: 'Hydration',   value: '1.1 L/day',  threshold: '2.5L goal',  since: '2 days', actionLabel: 'Send Alert',    color: '#06B6D4' },
  { member: 'Dadu Chatterjee', initials: 'DC', family: 'Chatterjee Family', alertType: 'Missed Meds',   metric: 'Medications', value: '3 missed',   threshold: '0 missed',   since: '2 days', actionLabel: 'Notify Family', color: '#EF4444' },
]

const MISSED_FAMILIES: MissedFamily[] = [
  { family: 'Sharma Family',     admin: 'Priya Sharma',     missed: 14 },
  { family: 'Mehta Family',      admin: 'Ankit Mehta',      missed: 11 },
  { family: 'Joshi Family',      admin: 'Sunita Joshi',     missed: 9  },
  { family: 'Chatterjee Family', admin: 'Ravi Chatterjee',  missed: 8  },
  { family: 'Iyer Family',       admin: 'Meera Iyer',       missed: 6  },
]

/* 30-day rolling data (normalized 0-100) */
const CHART_DAYS = Array.from({ length: 30 }, (_, i) => i + 1)
function randSeed(day: number, offset: number) {
  return Math.sin(day * 0.4 + offset) * 0.5 + 0.5
}
const STEPS_DATA  = CHART_DAYS.map(d => 48 + randSeed(d, 1) * 34)
const SLEEP_DATA  = CHART_DAYS.map(d => 38 + randSeed(d, 3) * 30)
const ACTIVE_DATA = CHART_DAYS.map(d => 42 + randSeed(d, 7) * 38)

function buildPath(data: number[], w: number, h: number): string {
  const max = 100, min = 0, range = max - min
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return [x, y] as [number, number]
  })
  return pts
    .map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`))
    .join(' ')
}

/* ─────────────────────────── sub-components ─────────────────────── */
function TrendBadge({ trend, warning }: { trend: 'up' | 'down' | 'stable'; warning: boolean }) {
  if (trend === 'up')
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
        <TrendingUp size={10} /> Up
      </span>
    )
  if (trend === 'down' && warning)
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
        <TrendingDown size={10} /> Below goal
      </span>
    )
  if (trend === 'down')
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
        <TrendingDown size={10} /> Down
      </span>
    )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(107,114,128,0.1)', color: 'var(--text-muted)', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
      Stable
    </span>
  )
}

function CircleProgress({ pct, color, size = 80, stroke = 6 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const cx = size / 2
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <motion.circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
      />
    </svg>
  )
}

/* ─────────────────────────── main page ──────────────────────────── */
export default function HealthPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [healthStats, setHealthStats] = useState({
    usersTracking: '28,432',
    avgSteps: '7,834',
    medReminders: '12,456',
    alerts: '23',
  })

  useEffect(() => {
    healthApi.stats()
      .then((d: any) => {
        setHealthStats(prev => ({
          ...prev,
          usersTracking: d.users_tracking ? d.users_tracking.toLocaleString("en-IN") : prev.usersTracking,
          avgSteps: d.avg_daily_steps ? d.avg_daily_steps.toLocaleString("en-IN") : prev.avgSteps,
          avgSleep: d.avg_sleep_hours ?? prev.avgSteps,
        }))
      })
      .catch(() => {})
  }, [])

  const cardVariants = {
    hidden:  { opacity: 0, y: 18 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const } }),
  }

  const STATS = [
    {
      label: 'Users Tracking Health',
      value: healthStats.usersTracking,
      sub: '56.4% of all users',
      change: '+8.2%',
      changeUp: true,
      icon: Users,
      color: '#4B80F0',
    },
    {
      label: 'Avg Daily Steps',
      value: healthStats.avgSteps,
      sub: 'vs 8,000 goal',
      change: '-166 steps',
      changeUp: false,
      icon: Activity,
      color: '#F59E0B',
    },
    {
      label: 'Med Reminders Today',
      value: healthStats.medReminders,
      sub: '94.2% acknowledged',
      change: '+94.2%',
      changeUp: true,
      icon: Bell,
      color: '#10B981',
    },
    {
      label: 'Health Alerts',
      value: healthStats.alerts,
      sub: 'members below threshold',
      change: 'Needs attention',
      changeUp: false,
      icon: AlertCircle,
      color: '#F97316',
    },
  ]

  /* Med bar chart */
  const MED_TYPES = [
    { label: 'Vitamins',    pct: 45, color: '#4B80F0' },
    { label: 'BP Meds',     pct: 23, color: '#EF4444' },
    { label: 'Diabetes',    pct: 18, color: '#F59E0B' },
    { label: 'Other',       pct: 14, color: '#8B5CF6' },
  ]

  const W = 520, H = 100

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Health</h1>
            <span style={{
              background: 'linear-gradient(135deg, var(--gold), #C9913A)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              borderRadius: 6,
              padding: '3px 8px',
            }}>NEW</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Monitor family health across all users</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(75,128,240,0.25)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Heart size={15} />
          Health Reports
        </motion.button>
      </motion.div>

      {/* ── 4 overview stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(({ label, value, sub, change, changeUp, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 22px 18px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: changeUp ? '#10B981' : '#F97316',
                background: changeUp ? 'rgba(16,185,129,0.1)' : 'rgba(249,115,22,0.1)',
                borderRadius: 999, padding: '3px 9px',
              }}>{change}</span>
            </div>
            <div style={{
              fontSize: 30, fontWeight: 800, lineHeight: 1,
              background: `linear-gradient(135deg, ${color}, ${color}99)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 5,
            }}>{value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── 6 health metric cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Health Metrics Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {METRIC_CARDS.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
              style={{
                background: 'var(--bg-surface)',
                border: m.warning ? `1px solid rgba(239,68,68,0.3)` : '1px solid var(--border)',
                borderRadius: 20,
                padding: '20px 22px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {m.warning && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #EF4444, rgba(239,68,68,0.3))' }} />
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <m.icon size={20} color={m.color} />
                </div>
                <TrendBadge trend={m.trend} warning={m.warning} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {m.avg}
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>{m.unit}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4, marginBottom: 10 }}>{m.name}</div>
              {m.goal && (
                <div style={{ fontSize: 11, color: m.warning ? '#EF4444' : 'var(--text-muted)', marginBottom: 8 }}>{m.goal}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 99, marginRight: 10, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pctTracking}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 + i * 0.06 }}
                    style={{ height: '100%', background: m.color, borderRadius: 99 }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{m.pctTracking}% tracking</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── medication reminder stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 26px', marginBottom: 28 }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Medication Reminder Stats</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', gap: 28 }}>

          {/* left — totals + donut */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <CircleProgress pct={94.2} color="#10B981" size={110} stroke={10} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #10B981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>94.2%</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACK rate</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>34,567</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>active reminders</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>across 18,432 users</div>
            </div>
          </div>

          {/* middle — bar chart by type */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>By Medication Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MED_TYPES.map((m, i) => (
                <div key={m.label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.pct}%</span>
                  </div>
                  <div style={{ height: 7, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 + i * 0.08 }}
                      style={{ height: '100%', background: m.color, borderRadius: 99 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right — top families with misses */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Most Missed Today</div>
              <span style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>723 total</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MISSED_FAMILIES.map((f, i) => (
                <motion.div
                  key={f.family}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{f.family}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Admin: {f.admin}</div>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 800,
                    color: f.missed > 10 ? '#EF4444' : f.missed > 7 ? '#F97316' : '#F59E0B',
                  }}>{f.missed}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── health alerts table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 28 }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Health Alerts</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Members below health thresholds — 23 active</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 999, padding: '4px 12px' }}>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#F97316' }}>Needs Attention</span>
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Member', 'Family', 'Alert Type', 'Metric', 'Value', 'Threshold', 'Since', 'Action'].map(col => (
                <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEALTH_ALERTS.map((row, i) => (
              <motion.tr
                key={row.member}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.45 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                whileHover={{ backgroundColor: 'rgba(249,115,22,0.03)' } as never}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {row.initials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{row.member}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{row.family}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: `${row.color}18`, color: row.color, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 9px' }}>{row.alertType}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{row.metric}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>{row.value}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{row.threshold}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 12, color: parseInt(row.since) >= 4 ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>{row.since}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      style={{ padding: '5px 12px', background: 'rgba(75,128,240,0.1)', border: '1px solid rgba(75,128,240,0.25)', borderRadius: 8, color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {row.actionLabel}
                    </motion.button>
                    <div style={{ position: 'relative' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setOpenMenu(openMenu === row.member ? null : row.member)}
                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        <MoreHorizontal size={12} />
                      </motion.button>
                      <AnimatePresence>
                        {openMenu === row.member && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            style={{ position: 'absolute', right: 0, top: 32, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 6, zIndex: 100, minWidth: 150, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
                          >
                            {['View Profile', 'Health History', 'Contact Family'].map(action => (
                              <div
                                key={action}
                                style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
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
      </motion.div>

      {/* ── wellness trend chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 26px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>30-Day Wellness Trend</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Rolling average across all users — normalized scale</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Avg Steps (norm.)',  color: '#4B80F0' },
              { label: 'Sleep hrs (norm.)',  color: '#8B5CF6' },
              { label: 'Active min (norm.)', color: '#10B981' },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 3, borderRadius: 99, background: color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <svg width={W} height={H + 30} style={{ display: 'block', minWidth: W }}>
            {/* grid lines */}
            {[0, 25, 50, 75, 100].map(v => {
              const y = H - (v / 100) * H
              return (
                <line key={v} x1={0} y1={y} x2={W} y2={y}
                  stroke="var(--border)" strokeWidth={1} strokeDasharray="3 4" opacity={0.5} />
              )
            })}

            {/* area fills */}
            {[
              { data: STEPS_DATA,  color: '#4B80F0' },
              { data: SLEEP_DATA,  color: '#8B5CF6' },
              { data: ACTIVE_DATA, color: '#10B981' },
            ].map(({ data, color }) => (
              <motion.path
                key={color}
                d={buildPath(data, W, H)}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
              />
            ))}

            {/* x-axis labels */}
            {[1, 7, 14, 21, 30].map(d => {
              const x = ((d - 1) / 29) * W
              return (
                <text key={d} x={x} y={H + 22} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontFamily="sans-serif">
                  Day {d}
                </text>
              )
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Steps trend', value: '+4.2%', color: '#4B80F0', up: true },
            { label: 'Sleep trend', value: '-6.8%', color: '#8B5CF6', up: false },
            { label: 'Active min trend', value: '+11.3%', color: '#10B981', up: true },
          ].map(({ label, value, color, up }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {up ? <TrendingUp size={14} color={color} /> : <TrendingDown size={14} color={color} />}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
