'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getAdminToken } from '@/lib/api'
import {
  Shield,
  AlertTriangle,
  User,
  Globe,
  Clock,
  Search,
  Download,
  RefreshCw,
  Terminal,
  Database,
  Lock,
  Plus,
} from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Types ────────────────────────────────────────────────────────
interface AuditLog {
  id: number
  event_type: string
  actor: string
  action: string
  resource: string
  ip_address: string
  status: string
  details: string
  created_at: string
}

// ── Config ───────────────────────────────────────────────────────
const EVENT_TYPE_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  auth:         { color: '#4B80F0', bg: 'rgba(75,128,240,0.15)',  icon: Lock },
  admin_action: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', icon: User },
  api_call:     { color: '#6B7280', bg: 'rgba(107,114,128,0.15)', icon: Terminal },
  security:     { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   icon: Shield },
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  success: { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  failure: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
}

const LOG_TABS = ['All Events', 'auth', 'admin_action', 'api_call', 'security']

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

function formatFull(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function getEventConfig(eventType: string) {
  return EVENT_TYPE_CONFIG[eventType] ?? { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', icon: Globe }
}

function getStatusConfig(status: string) {
  const key = status?.toLowerCase()
  return STATUS_CONFIG[key] ?? { color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }
}

// ── Page ─────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('All Events')
  const [search, setSearch] = useState('')
  const [newBlockIP, setNewBlockIP] = useState('')
  const [blockedIPs, setBlockedIPs] = useState<{ ip: string; reason: string; blockedAt: string }[]>([])
  const [retention, setRetention] = useState('90')

  const loadLogs = useCallback(async () => {
    try {
      setError(null)
      const res = await adminFetch('/audit/logs?limit=100')
      if (!res.ok) throw new Error('Failed to load audit logs')
      const data = await res.json()
      setLogs(Array.isArray(data) ? data : data.logs ?? [])
    } catch (e: any) {
      setError(e.message ?? 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLogs()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadLogs, 60000)
    return () => clearInterval(interval)
  }, [loadLogs])

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.actor?.toLowerCase().includes(search.toLowerCase()) ||
      log.event_type?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase())
    const matchTab = activeTab === 'All Events' || log.event_type === activeTab
    return matchSearch && matchTab
  })

  // Counts for stat cards
  const totalToday = logs.length
  const securityAlerts = logs.filter(l => l.event_type === 'security').length
  const failedLogins = logs.filter(l => l.event_type === 'auth' && l.status?.toLowerCase() === 'failure').length
  const adminActions = logs.filter(l => l.event_type === 'admin_action').length

  const cardStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px 24px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1300 }}>
      <Link href="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        ← Back to KVL Track Home
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Audit Logs
            </h1>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#10B981' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              LIVE · 60s
            </motion.div>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
            Security and activity monitoring for all admin and user actions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadLogs} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: 'var(--gold)', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {error}
          <button onClick={loadLogs} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Retry</button>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Events', value: loading ? '...' : String(totalToday), sub: 'loaded', color: '#10B981', icon: Terminal },
          { label: 'Security Events', value: loading ? '...' : String(securityAlerts), sub: 'logged', color: '#F97316', icon: AlertTriangle },
          { label: 'Auth Failures', value: loading ? '...' : String(failedLogins), sub: 'in dataset', color: '#F59E0B', icon: Lock },
          { label: 'Admin Actions', value: loading ? '...' : String(adminActions), sub: 'actions logged', color: '#4B80F0', icon: User },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 1 }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {LOG_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              borderColor: activeTab === tab ? 'var(--gold)' : 'var(--border)',
              background: activeTab === tab ? 'rgba(var(--gold-rgb),0.12)' : 'var(--bg-surface)',
              color: activeTab === tab ? 'var(--gold)' : 'var(--text-secondary)' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', maxWidth: 500 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by actor, action, event type..."
          style={{ width: '100%', padding: '9px 14px 9px 34px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Timeline list */}
      {loading ? (
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 24px', color: 'var(--text-muted)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw size={18} />
          </motion.div>
          Loading audit logs...
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>No audit logs found</div>
          ) : filtered.map((log, i) => {
            const cfg = getEventConfig(log.event_type)
            const scfg = getStatusConfig(log.status)
            const IconComp = cfg.icon
            return (
              <motion.div key={log.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  position: 'relative',
                }}>
                {/* Dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: cfg.bg, border: `1px solid ${cfg.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <IconComp size={14} style={{ color: cfg.color }} />
                  </div>
                  {i < filtered.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4, minHeight: 16 }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{log.actor}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{log.action}</span>
                    {log.resource && (
                      <span style={{ fontSize: 11, background: 'var(--bg-surface2)', color: 'var(--text-muted)', borderRadius: 6, padding: '2px 8px', fontFamily: 'monospace' }}>{log.resource}</span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, color: scfg.color, background: scfg.bg, borderRadius: 6, padding: '2px 8px' }}>{log.status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {relativeTime(log.created_at)}
                    </span>
                    {log.ip_address && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace' }}>
                        <Globe size={10} /> {log.ip_address}
                      </span>
                    )}
                    <span style={{
                      background: cfg.bg, color: cfg.color,
                      borderRadius: 6, padding: '1px 6px', fontSize: 10, fontWeight: 600,
                    }}>{log.event_type}</span>
                  </div>
                  {log.details && (
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{log.details}</div>
                  )}
                </div>

                {/* Timestamp */}
                <div style={{ flexShrink: 0, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {formatFull(log.created_at)}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* IP Blocklist */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} style={{ color: '#EF4444' }} />
              IP Blocklist
            </div>
            <span style={{ fontSize: 11, background: 'rgba(239,68,68,0.12)', color: '#EF4444', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>{blockedIPs.length} Blocked</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {blockedIPs.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No IPs blocked</div>
            )}
            {blockedIPs.map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface2)', borderRadius: 8, padding: '10px 12px' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{entry.ip}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{entry.reason} · {entry.blockedAt}</div>
                </div>
                <button onClick={() => setBlockedIPs(prev => prev.filter((_, j) => j !== i))}
                  style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#10B981', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                  Unblock
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newBlockIP} onChange={e => setNewBlockIP(e.target.value)} placeholder="Enter IP address to block..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
            <button onClick={() => {
              if (newBlockIP) {
                setBlockedIPs(prev => [...prev, { ip: newBlockIP, reason: 'Manually blocked', blockedAt: 'just now' }])
                setNewBlockIP('')
              }
            }}
              style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Block
            </button>
          </div>
        </div>

        {/* Log Retention Settings */}
        <div style={{ ...cardStyle }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={16} style={{ color: '#4B80F0' }} />
            Log Retention Settings
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-surface2)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current Retention Period</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{retention} Days</div>
              <div style={{ fontSize: 12, color: '#10B981', marginTop: 2 }}>Logs older than {retention} days are automatically archived</div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Change Retention Period</div>
              <select value={retention} onChange={e => setRetention(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', color: 'var(--text-primary)', fontSize: 13, marginBottom: 10 }}>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days (recommended)</option>
                <option value="180">180 Days</option>
                <option value="365">1 Year</option>
              </select>
              <button style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: 'var(--gold)', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Apply Retention Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
