'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getAdminToken } from '@/lib/api'
import {
  Route,
  Car,
  Navigation,
  MapPin,
  Clock,
  Users,
  Eye,
  MoreHorizontal,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Types ────────────────────────────────────────────────────────
interface JourneyStats {
  total_journeys: number
  active_journeys: number
  total_km: number
  avg_speed: number
  safety_score: number
}

interface JourneyItem {
  id: number | string
  user_name?: string
  from?: string
  to?: string
  started_at?: string
  distance?: number | string
  speed?: number
  status?: string
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

function initials(name: string): string {
  return (name ?? 'UN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function speedColor(speed: number): string {
  if (speed === 0) return '#6B7280'
  if (speed < 60) return '#10B981'
  if (speed <= 80) return '#F59E0B'
  return '#EF4444'
}

const AVATAR_COLORS = ['#4B80F0', '#10B981', '#D4A853', '#EC4899', '#8B5CF6', '#F97316', '#06B6D4', '#EF4444', '#14B8A6', '#6366F1']

function Avatar({ name, idx }: { name: string; idx: number }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%',
      background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    'active':    { bg: 'rgba(75,128,240,0.1)',  color: '#4B80F0', border: 'rgba(75,128,240,0.25)' },
    'completed': { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', border: 'rgba(16,185,129,0.25)' },
    'delayed':   { bg: 'rgba(249,115,22,0.1)',  color: '#F97316', border: 'rgba(249,115,22,0.25)' },
    'sos':       { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444', border: 'rgba(239,68,68,0.4)' },
  }
  const s = map[status?.toLowerCase()] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', border: 'rgba(107,114,128,0.25)' }
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
      {status ?? 'Unknown'}
    </span>
  )
}

/* Hourly chart (static design) */
const HOURLY_DATA = [
  { hour: '6am', count: 312 }, { hour: '7am', count: 890 }, { hour: '8am', count: 2340 },
  { hour: '9am', count: 3120 }, { hour: '10am', count: 1890 }, { hour: '11am', count: 1200 },
  { hour: '12pm', count: 1450 }, { hour: '1pm', count: 980 }, { hour: '2pm', count: 890 },
  { hour: '3pm', count: 1560 }, { hour: '4pm', count: 2800 }, { hour: '5pm', count: 3450 },
  { hour: '6pm', count: 3890 }, { hour: '7pm', count: 2670 }, { hour: '8pm', count: 1540 },
  { hour: '9pm', count: 720 }, { hour: '10pm', count: 340 },
]

function HourlyChart() {
  const max = Math.max(...HOURLY_DATA.map(d => d.count))
  const peakHours = ['8am', '9am', '5pm', '6pm', '7pm']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, paddingBottom: 24, position: 'relative' }}>
      {HOURLY_DATA.map((d, i) => {
        const isPeak = peakHours.includes(d.hour)
        const barH = Math.max((d.count / max) * 88, 4)
        return (
          <div key={d.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: barH, opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
              style={{
                width: '100%',
                background: isPeak ? 'linear-gradient(180deg, var(--gold) 0%, rgba(212,168,83,0.5) 100%)' : 'rgba(var(--gold-rgb),0.2)',
                borderRadius: '4px 4px 2px 2px', flexShrink: 0,
              }}
            />
            <span style={{ position: 'absolute', bottom: 0, fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {d.hour}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const TOP_CITIES = [
  { city: 'Mumbai',    count: '1,23,432', pct: 92 },
  { city: 'Delhi NCR', count: '98,231',   pct: 74 },
  { city: 'Bangalore', count: '87,654',   pct: 66 },
  { city: 'Hyderabad', count: '54,321',   pct: 41 },
  { city: 'Chennai',   count: '43,210',   pct: 33 },
  { city: 'Pune',      count: '38,976',   pct: 29 },
]

function StatCard({ icon, label, value, sub, subColor, index, pulse }: {
  icon: React.ReactNode; label: string; value: string; sub: string; subColor: string; index: number; pulse?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 26 }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
          {icon}
        </div>
        {pulse ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}
            />
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>LIVE</span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, background: 'linear-gradient(135deg, var(--gold) 0%, #e8c46a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {value}
      </div>
      {pulse && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>}
      <div style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{sub}</div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────
export default function JourneysPage() {
  const [stats, setStats] = useState<JourneyStats | null>(null)
  const [journeys, setJourneys] = useState<JourneyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      // Load stats + active journeys in parallel
      const [sRes, jRes] = await Promise.all([
        adminFetch('/journeys/stats'),
        adminFetch('/journeys/active'),
      ])

      if (sRes.ok) {
        const sData = await sRes.json()
        setStats(sData)
      }

      if (jRes.ok) {
        const jData = await jRes.json()
        const list = Array.isArray(jData)
          ? jData
          : jData.journeys ?? jData.active ?? []
        setJourneys(list)
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load journeys data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const activeCount = stats?.active_journeys ?? journeys.filter(j => j.status === 'active').length

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Journeys</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Manage live route sharing and journey stats</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          {!loading && activeCount > 0 && (
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '10px 18px' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>{activeCount} Active Journeys</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Error banner */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {error}
          <button onClick={loadData} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Retry</button>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard index={0} icon={<Route size={20} />}      label="Active Journeys"  value={loading ? '...' : String(stats?.active_journeys ?? activeCount)} sub="Live count"              subColor="#10B981" pulse />
        <StatCard index={1} icon={<TrendingUp size={20} />} label="TOTAL JOURNEYS"   value={loading ? '...' : String(stats?.total_journeys ?? '—')}            sub="All time"               subColor="#10B981" />
        <StatCard index={2} icon={<Clock size={20} />}      label="AVG SPEED"        value={loading ? '...' : stats?.avg_speed ? `${stats.avg_speed.toFixed(0)} km/h` : '—'} sub="Average journey speed" subColor="var(--gold)" />
        <StatCard index={3} icon={<Navigation size={20} />} label="TOTAL DISTANCE"   value={loading ? '...' : stats?.total_km ? `${stats.total_km.toLocaleString()} km` : '—'}  sub="Total distance"         subColor="var(--text-muted)" />
      </div>

      {/* Safety score card (if available) */}
      {!loading && stats?.safety_score !== undefined && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>Safety Score</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: stats.safety_score >= 80 ? '#10B981' : stats.safety_score >= 60 ? '#F59E0B' : '#EF4444' }}>
              {stats.safety_score}
              <span style={{ fontSize: 16, color: 'var(--text-muted)', marginLeft: 4 }}>/100</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 10, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.safety_score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: stats.safety_score >= 80 ? 'linear-gradient(90deg, #10B981, #059669)' : stats.safety_score >= 60 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #EF4444, #DC2626)',
                  borderRadius: 99,
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: stats.safety_score >= 80 ? '#10B981' : '#F59E0B', marginTop: 6, fontWeight: 500 }}>
              {stats.safety_score >= 80 ? 'Excellent safety rating' : stats.safety_score >= 60 ? 'Good — room for improvement' : 'Needs attention'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Journeys table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Route size={18} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Recent Journeys</span>
            {journeys.length > 0 && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}
              >
                {journeys.length} loaded
              </motion.span>
            )}
          </div>
          <button onClick={loadData} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 13 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCw size={16} />
              </motion.div>
              Loading journeys...
            </div>
          ) : journeys.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No journeys data available
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface2)' }}>
                  {['Member', 'From', 'To', 'Started', 'Distance', 'Speed', 'Status', 'Actions'].map(col => (
                    <th key={col} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {journeys.map((row, i) => {
                  const rowKey = String(row.id)
                  const isHovered = hoveredRow === rowKey
                  const isSOS = row.status?.toLowerCase() === 'sos'
                  const name = row.user_name ?? `User #${row.id}`
                  return (
                    <motion.tr
                      key={rowKey}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onMouseEnter={() => setHoveredRow(rowKey)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        background: isHovered ? 'rgba(var(--gold-rgb),0.05)' : isSOS ? 'rgba(239,68,68,0.05)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <Avatar name={name} idx={i} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          <MapPin size={11} color="var(--text-muted)" />
                          {row.from ?? '—'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          <Navigation size={11} color="var(--gold)" />
                          {row.to ?? '—'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {row.started_at ? fmtTime(row.started_at) : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {row.distance ? `${row.distance} km` : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: speedColor(row.speed ?? 0) }}>
                          {row.speed ? `${row.speed} km/h` : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <StatusBadge status={row.status ?? 'unknown'} />
                      </td>
                      <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(75,128,240,0.08)', color: 'var(--primary)', border: '1px solid rgba(75,128,240,0.2)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <Eye size={11} /> Track
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Top cities + hourly chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <TrendingUp size={16} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Top Cities</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOP_CITIES.map((city, i) => (
              <motion.div key={city.city} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{city.city}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>{city.count}</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${city.pct}%` }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold), rgba(var(--gold-rgb),0.5))', borderRadius: 3 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Clock size={16} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Journeys by Hour</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>6 AM — 10 PM</span>
            <span style={{ background: 'rgba(var(--gold-rgb),0.12)', color: 'var(--gold)', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>Peak highlighted</span>
          </div>
          <HourlyChart />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {['Morning Rush', 'Midday', 'Afternoon', 'Evening Rush', 'Night'].map(label => (
              <span key={label} style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  )
}
