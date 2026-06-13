'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAdminToken } from '@/lib/api'
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
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Types ────────────────────────────────────────────────────────
interface GeofenceEvent {
  id: number
  geofence_id: number
  geofence_name: string
  user_id: number
  user_name: string
  event_type: 'enter' | 'exit'
  occurred_at: string
  family_id?: number
  family_name?: string
}

// ── Helpers ───────────────────────────────────────────────────────
function adminFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = 'Bearer ' + token
  return fetch(BASE + path, { ...options, headers })
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Sub-components ───────────────────────────────────────────────
function TriggerBadge({ t }: { t: 'enter' | 'exit' }) {
  const isEnter = t === 'enter'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: isEnter ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      color: isEnter ? '#10B981' : '#EF4444',
      border: `1px solid ${isEnter ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
      borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    }}>
      {isEnter ? '→ Enter' : '← Exit'}
    </span>
  )
}

/* 30-day zone creation data (static chart, real events in table) */
const ZONE_CREATION_DATA = [
  12, 18, 14, 22, 28, 25, 19, 30, 35, 28, 24, 32, 38, 29, 26, 33, 41, 37, 28, 35,
  44, 38, 30, 42, 48, 39, 32, 45, 51, 47,
]

function ZoneCreationChart() {
  const W = 600, H = 80
  const max = Math.max(...ZONE_CREATION_DATA)
  const pts = ZONE_CREATION_DATA.map((v, i) => {
    const x = (i / (ZONE_CREATION_DATA.length - 1)) * W
    const y = H - (v / max) * H
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 8}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="zoneGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#zoneGrad)" />
      <polyline points={pts} fill="none" stroke="var(--gold)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle
        cx={(ZONE_CREATION_DATA.length - 1) / (ZONE_CREATION_DATA.length - 1) * W}
        cy={H - (ZONE_CREATION_DATA[ZONE_CREATION_DATA.length - 1] / max) * H}
        r={4} fill="var(--gold)"
      />
    </svg>
  )
}

const cardVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
}

// ── Page ─────────────────────────────────────────────────────────
export default function GeofencesPage() {
  const [events, setEvents] = useState<GeofenceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<number | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      setError(null)
      const res = await adminFetch('/geofences/events?limit=50')
      if (!res.ok) throw new Error('Failed to load geofence events')
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : data.events ?? [])
    } catch (e: any) {
      setError(e.message ?? 'Failed to load geofence data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEvents() }, [loadEvents])

  // Derived stats from events
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const alertsToday = events.filter(e => new Date(e.occurred_at) >= todayStart).length
  const uniqueZones = new Set(events.map(e => e.geofence_id)).size
  const enterEvents = events.filter(e => e.event_type === 'enter').length

  const STATS = [
    { label: 'Unique Zones (events)', value: loading ? '...' : String(uniqueZones), color: '#10B981', icon: Circle },
    { label: 'Events Today',          value: loading ? '...' : String(alertsToday),  color: '#D4A853', icon: TrendingUp },
    { label: 'Entry Events',          value: loading ? '...' : String(enterEvents),  color: '#4B80F0', icon: Map },
    { label: 'Exit Events',           value: loading ? '...' : String(events.length - enterEvents), color: '#8B5CF6', icon: Plus },
  ]

  const ZONE_TYPES = [
    { label: 'Home Zones',   count: '45,234', pct: 58, color: '#4B80F0', bg: 'rgba(75,128,240,0.08)',  icon: Home },
    { label: 'School Zones', count: '18,450', pct: 24, color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: GraduationCap },
    { label: 'Custom Zones', count: '14,748', pct: 18, color: '#D4A853', bg: 'rgba(212,168,83,0.08)', icon: Map },
  ]

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Geofence Zones</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            Real-time geofence event monitoring
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={loadEvents}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            <RefreshCw size={14} /> Refresh
          </motion.button>
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

      {/* Error banner */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#EF4444', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {error}
          <button onClick={loadEvents} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Retry</button>
        </div>
      )}

      {/* Stats strip */}
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

      {/* Zone type cards */}
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

      {/* Zone creation chart */}
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

      {/* Recent geofence events table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Geofence Events</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Live entry/exit events from the API</div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} onClick={loadEvents}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Filter size={12} /> Refresh
          </motion.button>
        </div>

        {loading ? (
          <div style={{ padding: '32px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <RefreshCw size={16} />
            </motion.div>
            Loading events...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
                {['Zone Name', 'User', 'Family', 'Event Type', 'Time', 'Action'].map(col => (
                  <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No geofence events found</td>
                </tr>
              ) : events.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 + 0.5 }}
                  style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                >
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.geofence_name || `Zone #${row.geofence_id}`}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{row.user_name || `User #${row.user_id}`}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{row.family_name || (row.family_id ? `Family #${row.family_id}` : '—')}</td>
                  <td style={{ padding: '12px 16px' }}><TriggerBadge t={row.event_type} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{relativeTime(row.occurred_at)}</td>
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
        )}
      </motion.div>

    </div>
  )
}
