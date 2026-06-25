'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getAdminToken } from '@/lib/api'
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  User,
  TrendingUp,
  Mail,
  Plus,
  X,
  RefreshCw,
  Activity,
} from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Types ────────────────────────────────────────────────────────
interface Ticket {
  id: number
  ticket_number: string
  subject: string
  category: string
  priority: 'critical' | 'high' | 'normal' | 'low'
  status: 'open' | 'in_progress' | 'resolved'
  user_email: string
  assigned_to: string | null
  created_at: string
  description: string
}

interface SupportStats {
  total: number
  open: number
  in_progress: number
  resolved: number
  avg_response_hours: number
}

// ── Config ───────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: 'CRITICAL' },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', label: 'High' },
  normal:   { color: '#4B80F0', bg: 'rgba(75,128,240,0.12)', border: 'rgba(75,128,240,0.3)', label: 'Normal' },
  low:      { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', label: 'Low' },
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  open:        { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Open' },
  in_progress: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'In Progress' },
  resolved:    { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Resolved' },
}

const QUICK_REPLIES = [
  'We are investigating this issue and will update you within 2 hours.',
  'Please update to the latest app version and try again.',
  'Your issue has been resolved. Please restart the app to see the changes.',
  'We have escalated this to our technical team for immediate attention.',
  'Could you please share a screenshot of the error you are seeing?',
]

function adminFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = 'Bearer ' + token
  return fetch(BASE + path, { ...options, headers })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function initials(email: string) {
  const parts = email.split('@')[0].split(/[._-]/)
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

// ── Page ─────────────────────────────────────────────────────────
export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<SupportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('All')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [search, setSearch] = useState('')
  const [replyText, setReplyText] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const [tRes, sRes] = await Promise.all([
        adminFetch('/support/tickets?skip=0&limit=50'),
        adminFetch('/support/tickets/stats'),
      ])
      if (!tRes.ok) throw new Error('Failed to load tickets')
      if (!sRes.ok) throw new Error('Failed to load stats')
      const tData = await tRes.json()
      const sData = await sRes.json()
      setTickets(Array.isArray(tData) ? tData : tData.tickets ?? [])
      setStats(sData)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load support data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function resolveTicket(id: number) {
    setActionLoading(true)
    try {
      const res = await adminFetch(`/support/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved' }),
      })
      if (!res.ok) throw new Error('Failed to resolve ticket')
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t))
      if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, status: 'resolved' } : null)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function assignToMe(id: number) {
    setActionLoading(true)
    try {
      const res = await adminFetch(`/support/tickets/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assigned_to: 'Admin' }),
      })
      if (!res.ok) throw new Error('Failed to assign ticket')
      setTickets(prev => prev.map(t => t.id === id ? { ...t, assigned_to: 'Admin' } : t))
      if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, assigned_to: 'Admin' } : null)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.user_email.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (activeTab === 'All') return true
    if (activeTab === 'Open') return t.status === 'open'
    if (activeTab === 'In Progress') return t.status === 'in_progress'
    if (activeTab === 'Resolved') return t.status === 'resolved'
    return true
  })

  const TABS = [
    { label: 'All', count: tickets.length },
    { label: 'Open', count: tickets.filter(t => t.status === 'open').length },
    { label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length },
    { label: 'Resolved', count: tickets.filter(t => t.status === 'resolved').length },
  ]

  const cardStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px 24px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400 }}>
      <Link href="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        ← Back to KVL Track Home
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Support Center
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
            {stats
              ? `Open: ${stats.open} | In Progress: ${stats.in_progress} | Resolved: ${stats.resolved} | Avg Response: ${stats.avg_response_hours?.toFixed(1) ?? '--'}h`
              : 'Loading stats...'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            <Plus size={16} /> New Ticket
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#EF4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {error}
          <button onClick={loadData} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Tickets', value: loading ? '...' : String(stats?.total ?? tickets.length), icon: MessageSquare, color: '#4B80F0' },
          { label: 'Open Tickets', value: loading ? '...' : String(stats?.open ?? 0), icon: AlertCircle, color: '#EF4444' },
          { label: 'In Progress', value: loading ? '...' : String(stats?.in_progress ?? 0), icon: Activity, color: '#F59E0B' },
          { label: 'Avg Response', value: loading ? '...' : `${stats?.avg_response_hours?.toFixed(1) ?? '--'}h`, icon: Clock, color: '#10B981' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Left: table + filters */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button key={tab.label} onClick={() => setActiveTab(tab.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                  borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                  borderColor: activeTab === tab.label ? 'var(--gold)' : 'var(--border)',
                  background: activeTab === tab.label ? 'rgba(var(--gold-rgb),0.12)' : 'var(--bg-surface)',
                  color: activeTab === tab.label ? 'var(--gold)' : 'var(--text-secondary)',
                }}>
                {tab.label}
                <span style={{ fontSize: 11, background: 'var(--bg-surface2)', borderRadius: 6, padding: '1px 6px' }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, ticket number, or subject..."
                style={{ width: '100%', padding: '9px 14px 9px 34px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '40px 24px', color: 'var(--text-muted)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCw size={18} />
              </motion.div>
              Loading tickets...
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Ticket #', 'Subject', 'Category', 'Priority', 'Status', 'User Email', 'Date', 'Actions'].map(col => (
                        <th key={col} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                          No tickets found
                        </td>
                      </tr>
                    ) : filtered.map((ticket, i) => {
                      const pc = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.normal
                      const sc = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open
                      const isSelected = selectedTicket?.id === ticket.id
                      return (
                        <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          onClick={() => setSelectedTicket(isSelected ? null : ticket)}
                          style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s', background: isSelected ? 'var(--bg-surface2)' : 'transparent' }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface2)' }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
                          <td style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace', fontSize: 12 }}>{ticket.ticket_number}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{ticket.category}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: pc.color, background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: 6, padding: '3px 8px' }}>{pc.label}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg, borderRadius: 6, padding: '3px 8px' }}>{sc.label}</span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: 12 }}>{ticket.user_email}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(ticket.created_at)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {ticket.status !== 'resolved' && (
                                <button onClick={e => { e.stopPropagation(); resolveTicket(ticket.id) }} disabled={actionLoading}
                                  style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#10B981', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                                  Resolve
                                </button>
                              )}
                              {!ticket.assigned_to && (
                                <button onClick={e => { e.stopPropagation(); assignToMe(ticket.id) }} disabled={actionLoading}
                                  style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                                  Assign
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Ticket detail panel */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div key={selectedTicket.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              style={{ width: 380, flexShrink: 0, ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '85vh', overflowY: 'auto' }}>

              {/* Panel header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--gold)', fontFamily: 'monospace' }}>{selectedTicket.ticket_number}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedTicket.category}</div>
                </div>
                <button onClick={() => setSelectedTicket(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* User info */}
              <div style={{ background: 'var(--bg-surface2)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4B80F0, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {initials(selectedTicket.user_email)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{selectedTicket.user_email}</div>
                    {selectedTicket.assigned_to && (
                      <div style={{ fontSize: 11, color: '#10B981' }}>Assigned to: {selectedTicket.assigned_to}</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}><Mail size={12} />{selectedTicket.user_email}</div>
              </div>

              {/* Priority + status */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Priority</div>
                  <div style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--bg-surface2)', fontSize: 12, color: PRIORITY_CONFIG[selectedTicket.priority]?.color ?? 'var(--text-primary)', fontWeight: 700 }}>
                    {PRIORITY_CONFIG[selectedTicket.priority]?.label ?? selectedTicket.priority}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
                  <div style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--bg-surface2)', fontSize: 12, color: STATUS_CONFIG[selectedTicket.status]?.color ?? 'var(--text-primary)', fontWeight: 600 }}>
                    {STATUS_CONFIG[selectedTicket.status]?.label ?? selectedTicket.status}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Subject</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>{selectedTicket.subject}</p>
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Issue Description</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, background: 'var(--bg-surface2)', borderRadius: 8, padding: '10px 12px' }}>{selectedTicket.description}</p>
              </div>

              {/* Created */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} /> Created {formatDate(selectedTicket.created_at)}
              </div>

              {/* Quick reply templates */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Quick Replies</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {QUICK_REPLIES.map((qr, i) => (
                    <button key={i} onClick={() => setReplyText(qr)}
                      style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', lineHeight: 1.4, transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      {qr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply textarea */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Your Reply</div>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Type your reply..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: 'var(--gold)', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Send Reply</button>
                  {selectedTicket.status !== 'resolved' && (
                    <button onClick={() => resolveTicket(selectedTicket.id)} disabled={actionLoading}
                      style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#10B981', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {selectedTicket.status !== 'resolved' && !selectedTicket.assigned_to && (
                <button onClick={() => assignToMe(selectedTicket.id)} disabled={actionLoading}
                  style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
                  Assign to Me
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
