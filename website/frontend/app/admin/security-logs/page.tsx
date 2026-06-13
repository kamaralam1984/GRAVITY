'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAdminToken } from '@/lib/api'
import {
  Shield,
  AlertTriangle,
  XCircle,
  Lock,
  Eye,
  Search,
  Download,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  Globe,
  Key,
  RefreshCw,
} from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Types ────────────────────────────────────────────────────────
interface SecurityLog {
  id: number
  event_type: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  user_id: number | null
  ip_address: string
  description: string
  metadata_json: any
  resolved: boolean
  created_at: string
}

interface SecurityStats {
  total: number
  critical: number
  by_type: Record<string, number>
  recent_threats: number
}

// ── Styles ───────────────────────────────────────────────────────
const SEVERITY_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', dot: '#EF4444' },
  high:     { bg: 'rgba(249,115,22,0.12)', color: '#F97316', dot: '#F97316' },
  medium:   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', dot: '#F59E0B' },
  low:      { bg: 'rgba(16,185,129,0.12)', color: '#10B981', dot: '#10B981' },
  info:     { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF', dot: '#9CA3AF' },
}

const BG = '#0B0D13', SURFACE = '#111420', ELEVATED = '#161926'
const BORDER = 'rgba(255,255,255,0.07)', GOLD = '#D4A853', MUTED = 'rgba(255,255,255,0.4)'

function SeverityBadge({ s }: { s: string }) {
  const style = SEVERITY_STYLES[s] || SEVERITY_STYLES.info
  return (
    <span style={{ background: style.bg, color: style.color, border: `1px solid ${style.dot}30`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function adminFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = 'Bearer ' + token
  return fetch(BASE + path, { ...options, headers })
}

// ── Page ─────────────────────────────────────────────────────────
export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockIP, setBlockIP] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [resolvingId, setResolvingId] = useState<number | null>(null)
  const PER_PAGE = 15

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const [lRes, sRes] = await Promise.all([
        adminFetch('/security/logs?limit=100'),
        adminFetch('/security/stats'),
      ])
      if (!lRes.ok) throw new Error('Failed to load security logs')
      const lData = await lRes.json()
      setLogs(Array.isArray(lData) ? lData : lData.logs ?? [])
      if (sRes.ok) {
        const sData = await sRes.json()
        setStats(sData)
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to load security data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  async function resolveLog(id: number) {
    setResolvingId(id)
    try {
      const res = await adminFetch(`/security/logs/${id}/resolve`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to resolve')
      setLogs(prev => prev.map(l => l.id === id ? { ...l, resolved: true } : l))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setResolvingId(null)
    }
  }

  const eventTypes = Array.from(new Set(logs.map(l => l.event_type)))

  const filtered = logs.filter(e => {
    const matchSearch = !search || (e.description?.toLowerCase().includes(search.toLowerCase()) || e.ip_address?.includes(search) || e.event_type?.toLowerCase().includes(search.toLowerCase()))
    const matchSev = severityFilter === 'All' || e.severity === severityFilter.toLowerCase()
    const matchType = typeFilter === 'All' || e.event_type === typeFilter
    return matchSearch && matchSev && matchType
  })

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const displayed = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const criticalCount = logs.filter(l => l.severity === 'critical' && !l.resolved).length
  const unresolvedCount = logs.filter(l => !l.resolved).length

  return (
    <div style={{ background: BG, minHeight: '100vh', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }}
              />
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600, letterSpacing: '0.05em' }}>LIVE MONITORING — AUTO-REFRESH 30s</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Security Logs</h1>
            <p style={{ fontSize: 14, color: MUTED, margin: '4px 0 0' }}>Real-time security event monitoring</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: `1px solid ${BORDER}`, background: SURFACE, color: MUTED, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => setShowBlockModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Ban size={14} /> Block IP
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: `1px solid ${BORDER}`, background: SURFACE, color: MUTED, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#EF4444', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> {error}
            <button onClick={loadData} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Retry</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Events', value: loading ? '...' : String(stats?.total ?? logs.length), sub: 'All time', color: '#4B80F0', icon: <Shield size={20} /> },
            { label: 'Critical Alerts', value: loading ? '...' : String(stats?.critical ?? criticalCount), sub: 'Unresolved', color: '#EF4444', icon: <AlertTriangle size={20} /> },
            { label: 'Unresolved', value: loading ? '...' : String(unresolvedCount), sub: 'Need attention', color: '#F97316', icon: <XCircle size={20} /> },
            { label: 'Recent Threats', value: loading ? '...' : String(stats?.recent_threats ?? 0), sub: 'Last 24h', color: '#8B5CF6', icon: <Ban size={20} /> },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 2 }}>{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, IPs, descriptions..."
              style={{ width: '100%', padding: '10px 12px 10px 34px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1) }}
            style={{ padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            {['All', 'Critical', 'High', 'Medium', 'Low', 'Info'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            style={{ padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
            <option>All</option>
            {eventTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: MUTED }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <RefreshCw size={18} />
            </motion.div>
            Loading security logs...
          </div>
        )}

        {/* Table */}
        {!loading && (
          <>
            <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 110px 140px 100px 100px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, background: ELEVATED }}>
                {['Time', 'Description / Type', 'Severity', 'IP Address', 'Status', 'Action'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>

              {displayed.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: MUTED, fontSize: 13 }}>No events found</div>
              ) : displayed.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ display: 'grid', gridTemplateColumns: '160px 1fr 110px 140px 100px 100px', padding: '14px 20px', borderBottom: i < displayed.length - 1 ? `1px solid ${BORDER}` : 'none', alignItems: 'center', background: e.severity === 'critical' && !e.resolved ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                  <div style={{ fontSize: 11, color: MUTED, fontFamily: 'monospace' }}>{formatTime(e.created_at)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2 }}>{e.description}</div>
                    <span style={{ fontSize: 11, color: MUTED }}>Type: {e.event_type}</span>
                  </div>
                  <div><SeverityBadge s={e.severity} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Globe size={11} color={MUTED} />
                    <span style={{ fontSize: 12, color: 'white', fontFamily: 'monospace' }}>{e.ip_address || '—'}</span>
                  </div>
                  <div>
                    <span style={{
                      background: e.resolved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: e.resolved ? '#10B981' : '#EF4444',
                      borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                    }}>
                      {e.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                  <div>
                    {!e.resolved && (
                      <button onClick={() => resolveLog(e.id)} disabled={resolvingId === e.id}
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        {resolvingId === e.id ? '...' : 'Resolve'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: MUTED }}>
                Showing {filtered.length === 0 ? 0 : ((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} events
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '7px 12px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: page === 1 ? MUTED : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ padding: '7px 12px', background: page === p ? GOLD : SURFACE, border: `1px solid ${page === p ? GOLD : BORDER}`, borderRadius: 8, color: page === p ? 'black' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages || pages === 0}
                  style={{ padding: '7px 12px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: page >= pages ? MUTED : 'white', cursor: page >= pages ? 'not-allowed' : 'pointer' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Block IP Modal */}
        <AnimatePresence>
          {showBlockModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28, width: '100%', maxWidth: 440 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>Block IP Address</h3>
                  <button onClick={() => setShowBlockModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}><X size={18} /></button>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6 }}>IP ADDRESS</label>
                  <input value={blockIP} onChange={e => setBlockIP(e.target.value)} placeholder="e.g. 103.24.67.89"
                    style={{ width: '100%', padding: '10px 14px', background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, display: 'block', marginBottom: 6 }}>REASON</label>
                  <input value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Reason for blocking..."
                    style={{ width: '100%', padding: '10px 14px', background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowBlockModal(false)} style={{ flex: 1, padding: '11px 0', background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => { setShowBlockModal(false); setBlockIP(''); setBlockReason('') }} style={{ flex: 1, padding: '11px 0', background: '#EF4444', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Block IP</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
