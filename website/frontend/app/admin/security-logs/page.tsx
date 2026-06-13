'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  XCircle,
  Lock,
  Eye,
  Search,
  Filter,
  Download,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  Globe,
  Key,
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  user: string
  email: string
  ip: string
  description: string
  timestamp: string
  resolved: boolean
}

interface BlockedIP {
  id: string
  ip: string
  reason: string
  blocked: string
  events: number
}

const EVENTS: SecurityEvent[] = [
  { id: 'SEC-001', type: 'failed_login', severity: 'high', user: 'Arjun Sharma', email: 'arjun@example.com', ip: '103.24.67.89', description: '5 consecutive failed login attempts', timestamp: '2025-06-12 14:32:07', resolved: false },
  { id: 'SEC-002', type: 'account_locked', severity: 'critical', user: 'Priya Mehta', email: 'priya@example.com', ip: '45.128.3.201', description: 'Account locked after 10 failed attempts', timestamp: '2025-06-12 14:28:15', resolved: false },
  { id: 'SEC-003', type: 'suspicious_login', severity: 'high', user: 'Rahul Kumar', email: 'rahul@example.com', ip: '213.109.45.67', description: 'Login from new country: Russia', timestamp: '2025-06-12 13:55:42', resolved: true },
  { id: 'SEC-004', type: 'rate_limit', severity: 'medium', user: 'API Key #44', email: 'api@partner.com', ip: '185.220.101.4', description: 'Rate limit exceeded: 1000 req/min', timestamp: '2025-06-12 13:41:22', resolved: true },
  { id: 'SEC-005', type: '2fa_disabled', severity: 'medium', user: 'Sunita Nair', email: 'sunita@example.com', ip: '49.37.201.56', description: '2FA disabled from new device', timestamp: '2025-06-12 12:17:09', resolved: false },
  { id: 'SEC-006', type: 'password_changed', severity: 'info', user: 'Deepak Agarwal', email: 'deepak@example.com', ip: '122.160.45.78', description: 'Password changed successfully', timestamp: '2025-06-12 11:50:33', resolved: true },
  { id: 'SEC-007', type: 'data_export', severity: 'medium', user: 'Admin', email: 'admin@trackalways.com', ip: '10.0.0.1', description: 'Large data export: 24,847 user records', timestamp: '2025-06-12 11:22:14', resolved: true },
  { id: 'SEC-008', type: 'failed_login', severity: 'low', user: 'Unknown', email: '-', ip: '91.108.4.176', description: 'Failed login attempt: invalid credentials', timestamp: '2025-06-12 10:44:58', resolved: false },
  { id: 'SEC-009', type: 'ip_blocked', severity: 'high', user: 'System', email: '-', ip: '103.24.67.89', description: 'IP auto-blocked after 20 failed attempts', timestamp: '2025-06-12 09:33:27', resolved: true },
  { id: 'SEC-010', type: 'suspicious_login', severity: 'critical', user: 'Kavitha Iyer', email: 'kavitha@example.com', ip: '45.128.3.201', description: 'Credential stuffing attack detected', timestamp: '2025-06-12 08:15:44', resolved: false },
]

const BLOCKED_IPS: BlockedIP[] = [
  { id: 'BLK-001', ip: '103.24.67.89', reason: 'Brute force attack — 20+ failed logins', blocked: '2025-06-12 09:33', events: 24 },
  { id: 'BLK-002', ip: '45.128.3.201', reason: 'Credential stuffing pattern', blocked: '2025-06-12 08:20', events: 67 },
  { id: 'BLK-003', ip: '185.220.101.4', reason: 'API rate limit abuse', blocked: '2025-06-11 22:14', events: 1000 },
  { id: 'BLK-004', ip: '91.108.4.176', reason: 'Suspicious login attempts', blocked: '2025-06-11 18:47', events: 12 },
]

const SEVERITY_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', dot: '#EF4444' },
  high:     { bg: 'rgba(249,115,22,0.12)', color: '#F97316', dot: '#F97316' },
  medium:   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', dot: '#F59E0B' },
  low:      { bg: 'rgba(75,128,240,0.12)', color: '#4B80F0', dot: '#4B80F0' },
  info:     { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF', dot: '#9CA3AF' },
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  failed_login:     <XCircle size={14} />,
  account_locked:   <Lock size={14} />,
  suspicious_login: <Eye size={14} />,
  rate_limit:       <Activity size={14} />,
  '2fa_disabled':   <Key size={14} />,
  password_changed: <Key size={14} />,
  data_export:      <Download size={14} />,
  ip_blocked:       <Ban size={14} />,
}

function SeverityBadge({ s }: { s: string }) {
  const style = SEVERITY_STYLES[s] || SEVERITY_STYLES.info
  return (
    <span style={{ background: style.bg, color: style.color, border: `1px solid ${style.dot}30`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  )
}

const BG = '#0B0D13', SURFACE = '#111420', ELEVATED = '#161926'
const BORDER = 'rgba(255,255,255,0.07)', GOLD = '#D4A853', MUTED = 'rgba(255,255,255,0.4)'

const STATS = [
  { label: 'Total Events', value: '47,832', sub: 'All time', color: '#4B80F0', icon: <Shield size={20} /> },
  { label: 'Critical Alerts', value: '12', sub: 'Unresolved', color: '#EF4444', icon: <AlertTriangle size={20} /> },
  { label: 'Failed Logins', value: '234', sub: 'Today', color: '#F97316', icon: <XCircle size={20} /> },
  { label: 'Blocked IPs', value: '89', sub: 'Currently active', color: '#8B5CF6', icon: <Ban size={20} /> },
]

export default function SecurityLogsPage() {
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [activeTab, setActiveTab] = useState<'events' | 'blocked'>('events')
  const [blockIP, setBlockIP] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  const filtered = EVENTS.filter(e => {
    const matchSearch = !search || e.user.toLowerCase().includes(search.toLowerCase()) || e.ip.includes(search) || e.description.toLowerCase().includes(search.toLowerCase())
    const matchSev = severityFilter === 'All' || e.severity === severityFilter.toLowerCase()
    const matchType = typeFilter === 'All' || e.type === typeFilter
    return matchSearch && matchSev && matchType
  })

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const displayed = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const securityScore = 82

  return (
    <div style={{ background: BG, minHeight: '100vh', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 4px rgba(16,185,129,0.2)' }} />
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600, letterSpacing: '0.05em' }}>LIVE MONITORING</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Security Logs</h1>
            <p style={{ fontSize: 14, color: MUTED, margin: '4px 0 0' }}>Real-time security event monitoring and IP management</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowBlockModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Ban size={14} /> Block IP
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: `1px solid ${BORDER}`, background: SURFACE, color: MUTED, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {STATS.map((s, i) => (
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

        {/* Security Score + Top attacks row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 28 }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 16 }}>SECURITY SCORE</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: '#10B981', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{securityScore}</span>
              <span style={{ fontSize: 20, color: MUTED, marginBottom: 8 }}>/100</span>
            </div>
            <div style={{ background: ELEVATED, borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 12 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${securityScore}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #10B981, #059669)', borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 13, color: '#10B981' }}>Good — 2 issues to resolve</div>
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 16 }}>TOP ATTACK VECTORS (LAST 30 DAYS)</div>
            {[
              { label: 'Brute Force Login', count: 234, max: 234, color: '#EF4444' },
              { label: 'Credential Stuffing', count: 89, max: 234, color: '#F97316' },
              { label: 'API Abuse', count: 67, max: 234, color: '#F59E0B' },
              { label: 'Suspicious Sessions', count: 45, max: 234, color: '#4B80F0' },
            ].map(v => (
              <div key={v.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{v.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: v.color }}>{v.count}</span>
                </div>
                <div style={{ background: ELEVATED, borderRadius: 999, height: 6, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(v.count / v.max) * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ height: '100%', background: v.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: SURFACE, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}`, width: 'fit-content' }}>
          {(['events', 'blocked'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: activeTab === tab ? ELEVATED : 'transparent', color: activeTab === tab ? 'white' : MUTED }}>
              {tab === 'events' ? 'Security Events' : `Blocked IPs (${BLOCKED_IPS.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'events' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search events, IPs, users..."
                  style={{ width: '100%', padding: '10px 12px 10px 34px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1) }}
                style={{ padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                {['All', 'Critical', 'High', 'Medium', 'Low', 'Info'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
                style={{ padding: '10px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                <option>All</option>
                {['failed_login', 'account_locked', 'suspicious_login', 'rate_limit', '2fa_disabled', 'ip_blocked'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 130px 120px 80px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, background: ELEVATED }}>
                {['Event ID', 'Description', 'Severity', 'User / IP', 'Timestamp', 'Status'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {displayed.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 130px 120px 80px', padding: '14px 20px', borderBottom: i < displayed.length - 1 ? `1px solid ${BORDER}` : 'none', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: MUTED }}>{e.id}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ color: SEVERITY_STYLES[e.severity]?.color }}>{EVENT_ICONS[e.type]}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{e.description}</span>
                    </div>
                    <span style={{ fontSize: 11, color: MUTED }}>Type: {e.type}</span>
                  </div>
                  <div><SeverityBadge s={e.severity} /></div>
                  <div>
                    <div style={{ fontSize: 12, color: 'white' }}>{e.user}</div>
                    <div style={{ fontSize: 11, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Globe size={10} /> {e.ip}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: MUTED }}>{e.timestamp}</div>
                  <div>
                    <span style={{ background: e.resolved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: e.resolved ? '#10B981' : '#EF4444', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                      {e.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: MUTED }}>Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} events</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '7px 12px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: page === 1 ? MUTED : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ padding: '7px 12px', background: page === p ? GOLD : SURFACE, border: `1px solid ${page === p ? GOLD : BORDER}`, borderRadius: 8, color: page === p ? 'black' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  style={{ padding: '7px 12px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: page === pages ? MUTED : 'white', cursor: page === pages ? 'not-allowed' : 'pointer' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'blocked' && (
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px 140px 80px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, background: ELEVATED }}>
              {['IP Address', 'Block Reason', 'Events', 'Blocked At', 'Action'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {BLOCKED_IPS.map((ip, i) => (
              <motion.div key={ip.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px 140px 80px', padding: '14px 20px', borderBottom: i < BLOCKED_IPS.length - 1 ? `1px solid ${BORDER}` : 'none', alignItems: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#EF4444', fontWeight: 600 }}>{ip.ip}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{ip.reason}</div>
                <div style={{ fontSize: 13, color: GOLD, fontWeight: 700 }}>{ip.events.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{ip.blocked}</div>
                <button style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  Unblock
                </button>
              </motion.div>
            ))}
          </div>
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
                  <input placeholder="Reason for blocking..."
                    style={{ width: '100%', padding: '10px 14px', background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowBlockModal(false)} style={{ flex: 1, padding: '11px 0', background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setShowBlockModal(false)} style={{ flex: 1, padding: '11px 0', background: '#EF4444', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Block IP</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
