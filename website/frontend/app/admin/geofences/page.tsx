'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { geofencesApi } from '@/lib/api'
import {
  Plus,
  Home,
  GraduationCap,
  Map,
  Eye,
  MoreHorizontal,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Circle,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
interface TriggerRow {
  zoneName: string
  family: string
  type: 'Home' | 'School' | 'Custom'
  trigger: 'Arrival' | 'Departure'
  member: string
  time: string
  id: string
}

interface ZoneRow {
  id: string
  name: string
  family: string
  type: 'Home' | 'School' | 'Custom'
  radius: string
  triggers: number
  created: string
  status: 'Active' | 'Paused'
}

/* ─────────────────────────── data ──────────────────────────── */
const TRIGGERS: TriggerRow[] = [
  { id: 't1',  zoneName: 'Home Zone Sharma',    family: 'Sharma Family',     type: 'Home',   trigger: 'Arrival',   member: 'Mom arrived',          time: '2 min ago'   },
  { id: 't2',  zoneName: 'School Zone DPS',     family: 'Mehta Family',      type: 'School', trigger: 'Departure', member: 'Child left',            time: '8 min ago'   },
  { id: 't3',  zoneName: 'Office Zone BKC',     family: 'Iyer Family',       type: 'Custom', trigger: 'Arrival',   member: 'Dad arrived',           time: '15 min ago'  },
  { id: 't4',  zoneName: 'Home Zone Kapoor',    family: 'Kapoor Circle',     type: 'Home',   trigger: 'Departure', member: 'Kiran left',            time: '23 min ago'  },
  { id: 't5',  zoneName: 'School Ryan Int.',    family: 'Gupta Family',      type: 'School', trigger: 'Arrival',   member: 'Ananya arrived',        time: '31 min ago'  },
  { id: 't6',  zoneName: 'Home Zone Nair',      family: 'Nair Household',    type: 'Home',   trigger: 'Arrival',   member: 'Suresh arrived',        time: '45 min ago'  },
  { id: 't7',  zoneName: 'Gym Zone Gold',       family: 'Reddy Circle',      type: 'Custom', trigger: 'Arrival',   member: 'Anita arrived',         time: '52 min ago'  },
  { id: 't8',  zoneName: 'School KV Sector 8',  family: 'Singh Family',      type: 'School', trigger: 'Departure', member: 'Rahul left',            time: '1 hr ago'    },
  { id: 't9',  zoneName: 'Home Zone Joshi',     family: 'Joshi Household',   type: 'Home',   trigger: 'Arrival',   member: 'Dad arrived',           time: '1.2 hr ago'  },
  { id: 't10', zoneName: 'Market Zone Patel',   family: 'Patel Circle',      type: 'Custom', trigger: 'Departure', member: 'Mom left',              time: '1.5 hr ago'  },
]

const ZONES: ZoneRow[] = [
  { id: 'Z-001', name: 'Home Zone Sharma',   family: 'Sharma Family',   type: 'Home',   radius: '150 m',  triggers: 312, created: 'Jan 14, 2025', status: 'Active' },
  { id: 'Z-002', name: 'School Zone DPS',    family: 'Mehta Family',    type: 'School', radius: '300 m',  triggers: 248, created: 'Feb 2, 2025',  status: 'Active' },
  { id: 'Z-003', name: 'Office Zone BKC',    family: 'Iyer Family',     type: 'Custom', radius: '200 m',  triggers: 189, created: 'Jan 8, 2025',  status: 'Active' },
  { id: 'Z-004', name: 'Home Zone Kapoor',   family: 'Kapoor Circle',   type: 'Home',   radius: '100 m',  triggers: 0,   created: 'Dec 20, 2024', status: 'Paused' },
  { id: 'Z-005', name: 'School Ryan Int.',   family: 'Gupta Family',    type: 'School', radius: '350 m',  triggers: 421, created: 'Mar 10, 2025', status: 'Active' },
  { id: 'Z-006', name: 'Gym Zone Gold',      family: 'Reddy Circle',    type: 'Custom', radius: '80 m',   triggers: 96,  created: 'Jan 22, 2025', status: 'Active' },
  { id: 'Z-007', name: 'Home Zone Nair',     family: 'Nair Household',  type: 'Home',   radius: '120 m',  triggers: 167, created: 'Apr 5, 2025',  status: 'Active' },
  { id: 'Z-008', name: 'School KV Sec 8',    family: 'Singh Family',    type: 'School', radius: '250 m',  triggers: 388, created: 'Feb 18, 2025', status: 'Active' },
]

/* 30-day zone creation data */
const ZONE_CREATION_DATA = [
  12, 18, 14, 22, 28, 25, 19, 30, 35, 28, 24, 32, 38, 29, 26, 33, 41, 37, 28, 35,
  44, 38, 30, 42, 48, 39, 32, 45, 51, 47,
]

/* ─────────────────────────── helpers ───────────────────────── */
function TypeBadge({ type }: { type: TriggerRow['type'] }) {
  const map = {
    Home:   { color: '#4B80F0', bg: 'rgba(75,128,240,0.12)',  icon: Home },
    School: { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  icon: GraduationCap },
    Custom: { color: '#D4A853', bg: 'rgba(212,168,83,0.12)',  icon: Map },
  }
  const { color, bg, icon: Icon } = map[type]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg, color, border: `1px solid ${color}33`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      <Icon size={10} />
      {type}
    </span>
  )
}

function TriggerBadge({ t }: { t: 'Arrival' | 'Departure' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: t === 'Arrival' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t === 'Arrival' ? '#10B981' : '#EF4444', border: `1px solid ${t === 'Arrival' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      {t === 'Arrival' ? '→ In' : '← Out'} {t}
    </span>
  )
}

function StatusBadge({ status }: { status: ZoneRow['status'] }) {
  const s = status === 'Active'
    ? { bg: 'rgba(16,185,129,0.1)', color: '#10B981', dot: '#10B981' }
    : { bg: 'rgba(107,114,128,0.1)', color: '#9CA3AF', dot: '#9CA3AF' }
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.dot}44`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  )
}

/* ─────────────────────────── zone creation line chart (SVG) ── */
function ZoneCreationChart() {
  const W = 600
  const H = 80
  const max = Math.max(...ZONE_CREATION_DATA)
  const pts = ZONE_CREATION_DATA.map((v, i) => {
    const x = (i / (ZONE_CREATION_DATA.length - 1)) * W
    const y = H - (v / max) * H
    return `${x},${y}`
  }).join(' ')

  const fillPts = `0,${H} ${pts} ${W},${H}`

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 8}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="zoneGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#zoneGrad)" />
      <polyline points={pts} fill="none" stroke="var(--gold)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* highlight last point */}
      <circle
        cx={(ZONE_CREATION_DATA.length - 1) / (ZONE_CREATION_DATA.length - 1) * W}
        cy={H - (ZONE_CREATION_DATA[ZONE_CREATION_DATA.length - 1] / max) * H}
        r={4}
        fill="var(--gold)"
      />
    </svg>
  )
}

/* ─────────────────────────── main page ─────────────────────── */
export default function GeofencesPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [recentTriggers, setRecentTriggers] = useState(TRIGGERS)

  useEffect(() => {
    geofencesApi.events(20)
      .then((events: any[]) => {
        if (events && events.length > 0) {
          setRecentTriggers(events.map((e: any, idx: number) => ({
            id: `t${idx + 1}`,
            zoneName: e.geofence_name ?? "Unknown Zone",
            family: "Family",
            type: "Custom" as const,
            trigger: (e.event_type === "enter" ? "Arrival" : "Departure") as "Arrival" | "Departure",
            member: e.user_name ?? "Unknown",
            time: e.occurred_at ? new Date(e.occurred_at).toLocaleTimeString("en-IN") : "",
          })))
        }
      })
      .catch(() => {})
  }, [])

  const cardVariants = {
    hidden:   { opacity: 0, y: 18 },
    visible:  (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
  }

  const STATS = [
    { label: 'Active Zones',              value: '78,432',  color: '#10B981', icon: Circle },
    { label: 'Triggers Today',            value: '234,891', color: '#D4A853', icon: TrendingUp },
    { label: 'Avg Triggers / Zone / Day', value: '3.0',     color: '#4B80F0', icon: Map },
    { label: 'Created This Week',         value: '892',     color: '#8B5CF6', icon: Plus },
  ]

  const ZONE_TYPES = [
    { label: 'Home Zones',   count: '45,234', pct: 58, color: '#4B80F0', bg: 'rgba(75,128,240,0.08)',  icon: Home },
    { label: 'School Zones', count: '18,450', pct: 24, color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: GraduationCap },
    { label: 'Custom Zones', count: '14,748', pct: 18, color: '#D4A853', bg: 'rgba(212,168,83,0.08)', icon: Map },
  ]

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Geofence Zones</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>78,432</span> active zones monitored in real-time
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            <Download size={14} /> Export
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--gold)', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
            <Plus size={15} /> Create Zone
          </motion.button>
        </div>
      </motion.div>

      {/* ── stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STATS.map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}99)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── zone type cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {ZONE_TYPES.map(({ label, count, pct, color, bg, icon: Icon }, i) => (
          <motion.div key={label} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -4, boxShadow: '0 14px 48px rgba(0,0,0,0.12)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{pct}%</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{count} zones</div>
            {/* progress bar */}
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.12 + 0.4, duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 99 }}
              />
            </div>
            <motion.button whileHover={{ gap: 10 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: color, cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0, transition: 'gap 0.15s' }}>
              View All <ArrowRight size={13} />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* ── zone creation chart ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Zone Creation Activity</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>New zones created per day — last 30 days</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 3, background: 'var(--gold)', borderRadius: 99 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Zones created</span>
          </div>
        </div>
        <ZoneCreationChart />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>May 13</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Jun 11</span>
        </div>
      </motion.div>

      {/* ── recent triggers table ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Triggers</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Live geofence entry/exit events</div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Filter size={12} /> Filter
          </motion.button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Zone Name', 'Family', 'Type', 'Trigger', 'Member', 'Time', 'Action'].map(col => (
                <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentTriggers.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 + 0.5 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                whileHover={{ backgroundColor: 'rgba(var(--gold-rgb),0.04)' }}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.zoneName}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{row.family}</td>
                <td style={{ padding: '12px 16px' }}><TypeBadge type={row.type} /></td>
                <td style={{ padding: '12px 16px' }}><TriggerBadge t={row.trigger} /></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{row.member}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.time}</td>
                <td style={{ padding: '12px 16px' }}>
                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.25)', borderRadius: 8, color: 'var(--gold)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Eye size={12} /> View
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* ── zones table ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>All Zones</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Manage geofence zones</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Zone ID', 'Name', 'Family', 'Type', 'Radius', 'Triggers', 'Created', 'Status', 'Actions'].map(col => (
                <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ZONES.map((zone, i) => (
              <motion.tr
                key={zone.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.6 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                whileHover={{ backgroundColor: 'rgba(var(--gold-rgb),0.04)' }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px' }}>{zone.id}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{zone.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{zone.family}</td>
                <td style={{ padding: '12px 16px' }}><TypeBadge type={zone.type} /></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{zone.radius}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: zone.triggers > 200 ? 'var(--gold)' : 'var(--text-primary)' }}>{zone.triggers.toLocaleString()}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{zone.created}</td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={zone.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}>
                      <Eye size={13} />
                    </motion.button>
                    <div style={{ position: 'relative' }}>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setOpenMenu(openMenu === zone.id ? null : zone.id)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <MoreHorizontal size={13} />
                      </motion.button>
                      <AnimatePresence>
                        {openMenu === zone.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            style={{ position: 'absolute', right: 0, top: 34, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 6, zIndex: 100, minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                            {['Edit Zone', 'Pause Zone', 'View Triggers', 'Delete Zone'].map(action => (
                              <div key={action}
                                style={{ padding: '8px 12px', fontSize: 13, color: action === 'Delete Zone' ? '#EF4444' : 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
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

        {/* pagination */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface2)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing <strong style={{ color: 'var(--text-primary)' }}>1–8</strong> of <strong style={{ color: 'var(--text-primary)' }}>78,432</strong> zones</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={15} />
            </motion.button>
            {[1, 2, 3].map(p => (
              <motion.button key={p} whileHover={{ scale: 1.05 }}
                style={{ width: 32, height: 32, borderRadius: 8, border: p === 1 ? 'none' : '1px solid var(--border)', background: p === 1 ? 'var(--gold)' : 'var(--bg-surface)', color: p === 1 ? '#fff' : 'var(--text-secondary)', fontWeight: p === 1 ? 700 : 400, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p}
              </motion.button>
            ))}
            <span style={{ fontSize: 13, color: 'var(--text-muted)', padding: '0 4px' }}>...</span>
            <motion.button whileHover={{ scale: 1.05 }}
              style={{ width: 42, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              7843
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gold)' }}>
              <ChevronRight size={15} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
