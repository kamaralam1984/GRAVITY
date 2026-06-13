'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'

// ── Types ──────────────────────────────────────────────────────────────────────

type NavSection =
  | 'overview'
  | 'tickets'
  | 'reports'
  | 'content'
  | 'announcements'
  | 'analytics'

interface Ticket {
  id: string
  user: string
  subject: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  created: string
}

interface Report {
  id: string
  reporter: string
  reported: string
  reason: 'spam' | 'harassment' | 'fake'
  date: string
  status: 'pending' | 'reviewed'
}

interface ContentItem {
  id: string
  type: 'SOS_false_alarm' | 'profile_photo' | 'username'
  user: string
  detail: string
  submitted: string
}

interface ActivityItem {
  id: string
  type: 'ticket_resolved' | 'report_reviewed' | 'user_warned'
  user: string
  mod: string
  time: string
  note: string
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const TICKETS: Ticket[] = [
  { id: 'TKT-0041', user: 'Sarah M.',   subject: 'App crash on location share',  priority: 'high',   status: 'open',        created: '2026-06-13 09:12' },
  { id: 'TKT-0040', user: 'James R.',   subject: 'SOS alert not triggering',     priority: 'high',   status: 'in-progress', created: '2026-06-13 08:55' },
  { id: 'TKT-0039', user: 'Priya K.',   subject: 'Geofence not saving',          priority: 'medium', status: 'open',        created: '2026-06-12 21:40' },
  { id: 'TKT-0038', user: 'Tom B.',     subject: 'Billing charge discrepancy',   priority: 'medium', status: 'in-progress', created: '2026-06-12 17:20' },
  { id: 'TKT-0037', user: 'Lisa C.',    subject: 'Cannot invite family member',  priority: 'low',    status: 'open',        created: '2026-06-12 14:05' },
  { id: 'TKT-0036', user: 'Ahmed S.',   subject: 'Map tiles not loading',        priority: 'low',    status: 'resolved',    created: '2026-06-12 11:30' },
]

const REPORTS: Report[] = [
  { id: 'RPT-001', reporter: 'User_884',  reported: 'User_229',  reason: 'spam',       date: '2026-06-13 10:01', status: 'pending'  },
  { id: 'RPT-002', reporter: 'User_512',  reported: 'User_671',  reason: 'harassment', date: '2026-06-13 08:44', status: 'pending'  },
  { id: 'RPT-003', reporter: 'User_130',  reported: 'User_445',  reason: 'fake',       date: '2026-06-12 22:15', status: 'reviewed' },
  { id: 'RPT-004', reporter: 'User_761',  reported: 'User_088',  reason: 'spam',       date: '2026-06-12 19:33', status: 'pending'  },
  { id: 'RPT-005', reporter: 'User_302',  reported: 'User_557',  reason: 'harassment', date: '2026-06-12 15:10', status: 'reviewed' },
]

const CONTENT_ITEMS: ContentItem[] = [
  { id: 'CNT-001', type: 'SOS_false_alarm', user: 'User_334', detail: 'Triggered 4 false SOS alerts this week', submitted: '2026-06-13 09:50' },
  { id: 'CNT-002', type: 'profile_photo',   user: 'User_719', detail: 'Photo flagged for inappropriate content',  submitted: '2026-06-13 07:22' },
  { id: 'CNT-003', type: 'username',         user: 'User_501', detail: 'Username "xXkillrXx" violates policy',    submitted: '2026-06-12 23:05' },
  { id: 'CNT-004', type: 'profile_photo',   user: 'User_158', detail: 'AI flagged: possible minor in photo',      submitted: '2026-06-12 18:40' },
]

const ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'ticket_resolved',  user: 'Ahmed S.',  mod: 'You',        time: '10 min ago', note: 'Map tiles issue resolved — cache cleared'    },
  { id: 'a2', type: 'report_reviewed',  user: 'User_445',  mod: 'You',        time: '32 min ago', note: 'Fake account report — warning issued'          },
  { id: 'a3', type: 'user_warned',      user: 'User_334',  mod: 'You',        time: '1 hr ago',   note: 'Warned for repeated false SOS triggers'        },
  { id: 'a4', type: 'ticket_resolved',  user: 'Ben T.',    mod: 'mod_grace',  time: '2 hr ago',   note: 'Notification delay — escalated to engineering'  },
  { id: 'a5', type: 'report_reviewed',  user: 'User_088',  mod: 'mod_grace',  time: '3 hr ago',   note: 'Spam report dismissed — no violation found'    },
  { id: 'a6', type: 'ticket_resolved',  user: 'Carla W.',  mod: 'mod_raj',    time: '4 hr ago',   note: 'Login issue — password reset sent'             },
]

// ── Colours & Helpers ──────────────────────────────────────────────────────────

const AMBER = '#F59E0B'
const AMBER_DIM = 'rgba(245,158,11,0.12)'
const AMBER_BORDER = 'rgba(245,158,11,0.25)'

const glass: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  backdropFilter: 'blur(12px)',
}

const priorityColor = (p: Ticket['priority']) =>
  p === 'high' ? '#EF4444' : p === 'medium' ? AMBER : '#10B981'

const reasonColor = (r: Report['reason']) =>
  r === 'harassment' ? '#EF4444' : r === 'spam' ? AMBER : '#6B7280'

const activityColor = (t: ActivityItem['type']) =>
  t === 'ticket_resolved' ? '#10B981' : t === 'report_reviewed' ? AMBER : '#EF4444'

const activityLabel = (t: ActivityItem['type']) =>
  t === 'ticket_resolved' ? 'Ticket Resolved' : t === 'report_reviewed' ? 'Report Reviewed' : 'User Warned'

const contentTypeColor = (t: ContentItem['type']) =>
  t === 'SOS_false_alarm' ? '#EF4444' : t === 'profile_photo' ? AMBER : '#6B7280'

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, delay,
}: { label: string; value: string | number; sub?: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      style={{ ...glass, padding: '20px 22px', flex: 1, minWidth: 140 }}
    >
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
    </motion.div>
  )
}

// ── Section Components ─────────────────────────────────────────────────────────

function Overview() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Open Tickets"    value={23}     sub="3 high priority"         color={AMBER}     delay={0} />
        <StatCard label="Pending Reports" value={7}      sub="2 harassment"             color="#EF4444"   delay={0.06} />
        <StatCard label="Resolved Today"  value={45}     sub="+12 vs yesterday"         color="#10B981"   delay={0.12} />
        <StatCard label="Avg Response"    value="2.3h"   sub="Target: under 4h"         color="var(--text-primary)" delay={0.18} />
      </div>

      {/* Recent Activity + Quick Actions */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {/* Activity Feed */}
        <div style={{ ...glass, flex: 2, minWidth: 280, padding: '20px 22px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Recent Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: activityColor(item.type),
                  marginTop: 5, flexShrink: 0,
                  boxShadow: `0 0 6px ${activityColor(item.type)}`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: activityColor(item.type) }}>
                      {activityLabel(item.type)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.time}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{item.note}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Affected: <strong style={{ color: 'var(--text-secondary)' }}>{item.user}</strong> — by {item.mod}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ ...glass, flex: 1, minWidth: 220, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Quick Actions
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 16px', borderRadius: 10, border: `1px solid ${AMBER_BORDER}`,
              background: AMBER_DIM, color: AMBER, fontWeight: 700, fontSize: 13.5,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            Review Oldest Ticket →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 700, fontSize: 13.5,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            Check Pending Reports →
          </motion.button>
          <div style={{ marginTop: 12, padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>On Duty Today</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>3 moderators active</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>You · mod_grace · mod_raj</div>
          </div>
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Queue Health</div>
            <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: 'var(--bg-surface3)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 3, background: '#10B981' }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>72% within SLA</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SupportTickets() {
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')

  const filtered = filter === 'all' ? TICKETS : TICKETS.filter(t => t.status === filter)
  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ ...glass, overflow: 'hidden' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '14px 18px', border: 'none', background: 'transparent',
                color: filter === tab.key ? AMBER : 'var(--text-muted)',
                fontWeight: filter === tab.key ? 700 : 500,
                fontSize: 13.5, cursor: 'pointer',
                borderBottom: filter === tab.key ? `2px solid ${AMBER}` : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.18s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'User', 'Subject', 'Priority', 'Status', 'Created', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket, i) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '13px 18px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>{ticket.id}</td>
                  <td style={{ padding: '13px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>{ticket.user}</td>
                  <td style={{ padding: '13px 18px', color: 'var(--text-secondary)', maxWidth: 220 }}>{ticket.subject}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                      background: `${priorityColor(ticket.priority)}18`,
                      color: priorityColor(ticket.priority),
                      border: `1px solid ${priorityColor(ticket.priority)}30`,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                      background: ticket.status === 'resolved' ? 'rgba(16,185,129,0.1)' : ticket.status === 'in-progress' ? AMBER_DIM : 'rgba(239,68,68,0.08)',
                      color: ticket.status === 'resolved' ? '#10B981' : ticket.status === 'in-progress' ? AMBER : '#EF4444',
                    }}>
                      {ticket.status}
                    </span>
                  </td>
                  <td style={{ padding: '13px 18px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{ticket.created}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '5px 14px', borderRadius: 7, border: `1px solid ${AMBER_BORDER}`,
                        background: AMBER_DIM, color: AMBER, fontWeight: 600, fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

function UserReports() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {REPORTS.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{ ...glass, padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 80 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{report.id}</span>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Reporter:</span> {report.reporter}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Reported:</span> {report.reported}
              </div>
            </div>
            <div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                background: `${reasonColor(report.reason)}18`,
                color: reasonColor(report.reason),
                border: `1px solid ${reasonColor(report.reason)}30`,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {report.reason}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{report.date}</div>
            <div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                background: report.status === 'reviewed' ? 'rgba(16,185,129,0.1)' : AMBER_DIM,
                color: report.status === 'reviewed' ? '#10B981' : AMBER,
              }}>
                {report.status}
              </span>
            </div>
            {report.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionBtn label="Warn User"         color="#EF4444" />
                <ActionBtn label="Dismiss"           color="#10B981" />
                <ActionBtn label="Escalate to Admin" color={AMBER} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ActionBtn({ label, color }: { label: string; color: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        padding: '5px 12px', borderRadius: 7,
        border: `1px solid ${color}30`,
        background: `${color}12`,
        color, fontWeight: 600, fontSize: 12, cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </motion.button>
  )
}

function ContentReview() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CONTENT_ITEMS.filter(c => !dismissed.has(c.id)).map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ delay: i * 0.07 }}
            style={{ ...glass, padding: '18px 22px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}
          >
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 7,
              background: `${contentTypeColor(item.type)}18`,
              color: contentTypeColor(item.type),
              border: `1px solid ${contentTypeColor(item.type)}30`,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {item.type.replace(/_/g, ' ')}
            </span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{item.user}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{item.detail}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.submitted}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setDismissed(prev => new Set([...prev, item.id]))}
                style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Approve
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setDismissed(prev => new Set([...prev, item.id]))}
                style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Reject
              </motion.button>
            </div>
          </motion.div>
        ))}
        {dismissed.size === CONTENT_ITEMS.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...glass, padding: '40px 20px', textAlign: 'center', color: '#10B981', fontWeight: 700, fontSize: 15 }}>
            All items reviewed
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function Announcements() {
  const [form, setForm] = useState({ title: '', message: '', target: 'all_users', type: 'info' })
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!form.title || !form.message) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ title: '', message: '', target: 'all_users', type: 'info' })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--bg-surface2)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  const selectStyle: React.CSSProperties = { ...inputStyle }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ ...glass, padding: '28px 28px', maxWidth: 640 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 22, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Send Announcement
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Title
            </label>
            <input
              style={inputStyle}
              placeholder="Announcement title..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Message
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
              placeholder="Write your announcement..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                Target Audience
              </label>
              <select style={selectStyle} value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}>
                <option value="all_users">All Users</option>
                <option value="premium">Premium</option>
                <option value="new_users">New Users</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                Type
              </label>
              <select style={selectStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSend}
            style={{
              padding: '12px 24px', borderRadius: 10,
              background: sent ? 'rgba(16,185,129,0.15)' : `linear-gradient(135deg, ${AMBER}, #D97706)`,
              color: sent ? '#10B981' : '#fff',
              border: sent ? '1px solid rgba(16,185,129,0.3)' : 'none',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: sent ? 'none' : `0 4px 18px rgba(245,158,11,0.35)`,
              transition: 'all 0.3s',
            }}
          >
            {sent ? 'Announcement Sent!' : 'Send Announcement'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

const WEEK_BARS = [
  { day: 'Mon', val: 58 },
  { day: 'Tue', val: 72 },
  { day: 'Wed', val: 45 },
  { day: 'Thu', val: 88 },
  { day: 'Fri', val: 67 },
  { day: 'Sat', val: 32 },
  { day: 'Sun', val: 19 },
]

function Analytics() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Tickets This Week" value={67}     sub="vs 54 last week"       color={AMBER}     delay={0}    />
        <StatCard label="Resolution Rate"   value="94%"   sub="Top 10% of teams"      color="#10B981"   delay={0.06} />
        <StatCard label="User Satisfaction" value="4.6/5" sub="Based on 183 ratings"  color="#6366F1"   delay={0.12} />
        <StatCard label="Escalations"       value={3}     sub="2 resolved today"      color="#EF4444"   delay={0.18} />
      </div>

      {/* Bar chart */}
      <div style={{ ...glass, padding: '24px 28px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Tickets Resolved — This Week
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
          {WEEK_BARS.map((bar, i) => (
            <div key={bar.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, color: AMBER, fontWeight: 700 }}>{bar.val}</div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(bar.val / 88) * 100}px` }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  background: i === 3
                    ? `linear-gradient(180deg, ${AMBER}, #D97706)`
                    : `rgba(245,158,11,0.35)`,
                  minWidth: 24,
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{bar.day}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Nav Config ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: NavSection; label: string; icon: string; badge?: string }[] = [
  { id: 'overview',      label: 'Overview',       icon: '📊' },
  { id: 'tickets',       label: 'Support Tickets', icon: '🎫', badge: '23' },
  { id: 'reports',       label: 'User Reports',    icon: '🚨', badge: '7' },
  { id: 'content',       label: 'Content Review',  icon: '🔍', badge: '4' },
  { id: 'announcements', label: 'Announcements',   icon: '📢' },
  { id: 'analytics',     label: 'Analytics',       icon: '📈' },
]

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ModeratorPage() {
  const { user, logout } = useAuth()
  const [active, setActive] = useState<NavSection>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const moderatorName = user?.name || user?.email?.split('@')[0] || 'Moderator'
  const initials = moderatorName.slice(0, 2).toUpperCase()

  const sectionTitles: Record<NavSection, string> = {
    overview: 'Overview',
    tickets: 'Support Tickets',
    reports: 'User Reports',
    content: 'Content Review',
    announcements: 'Announcements',
    analytics: 'Analytics',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .mod-sidebar { display: none !important; }
          .mod-bottom-nav { display: flex !important; }
          .mod-header-name { display: none !important; }
        }
        @media (min-width: 769px) {
          .mod-bottom-nav { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        height: 60, borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 16, position: 'sticky', top: 0, zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #C9913A, #D4A853)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 15, color: '#fff',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            boxShadow: '0 4px 14px rgba(184,114,10,0.4)',
          }}>
            G
          </div>
          <div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 14, letterSpacing: '0.08em', color: 'var(--text-primary)', lineHeight: 1 }}>
              GRAVITY
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#fff', borderRadius: 4, padding: '1px 6px',
              marginTop: 2, display: 'inline-block',
            }}>
              MODERATOR
            </span>
          </div>
        </div>

        {/* Center: page title */}
        <div className="mod-header-name" style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {sectionTitles[active]}
          </span>
        </div>

        {/* Right: name + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `linear-gradient(135deg, ${AMBER}, #D97706)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              boxShadow: '0 2px 10px rgba(245,158,11,0.35)',
            }}>
              {initials}
            </div>
            <div className="mod-header-name">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{moderatorName}</div>
              <div style={{ fontSize: 11, color: AMBER, fontWeight: 600, lineHeight: 1.3 }}>Moderator</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={logout}
            style={{
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
              color: '#EF4444', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Logout
          </motion.button>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar (desktop) */}
        <aside className="mod-sidebar" style={{
          width: 224, flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto',
          padding: '16px 10px',
          display: 'flex', flexDirection: 'column',
        }}>
          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActive(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 3,
                  border: 'none', background: active === item.id ? AMBER_DIM : 'transparent',
                  borderLeft: active === item.id ? `3px solid ${AMBER}` : '3px solid transparent',
                  color: active === item.id ? AMBER : 'var(--text-secondary)',
                  fontWeight: active === item.id ? 700 : 500,
                  fontSize: 13.5, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.18s',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: active === item.id ? AMBER_BORDER : 'var(--bg-surface2)',
                    color: active === item.id ? AMBER : 'var(--text-muted)',
                    borderRadius: 6, padding: '1px 6px', minWidth: 20, textAlign: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '24px 20px', paddingBottom: 80, overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {/* Section heading */}
              <div style={{ marginBottom: 22 }}>
                <h1 style={{
                  fontSize: 22, fontWeight: 800, color: 'var(--text-primary)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0, lineHeight: 1.2,
                }}>
                  {sectionTitles[active]}
                </h1>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: '5px 0 0' }}>
                  {active === 'overview'      && 'Your moderation activity at a glance.'}
                  {active === 'tickets'       && 'Manage and respond to user support tickets.'}
                  {active === 'reports'       && 'Review user-submitted reports and take action.'}
                  {active === 'content'       && 'Review flagged content awaiting approval or rejection.'}
                  {active === 'announcements' && 'Broadcast messages to platform users.'}
                  {active === 'analytics'     && 'Track moderation performance and trends.'}
                </p>
              </div>

              {active === 'overview'      && <Overview />}
              {active === 'tickets'       && <SupportTickets />}
              {active === 'reports'       && <UserReports />}
              {active === 'content'       && <ContentReview />}
              {active === 'announcements' && <Announcements />}
              {active === 'analytics'     && <Analytics />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mod-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 64, background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        display: 'none', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              border: 'none', background: 'transparent',
              color: active === item.id ? AMBER : 'var(--text-muted)',
              cursor: 'pointer', padding: '6px 10px', borderRadius: 10,
              position: 'relative', flex: 1,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: active === item.id ? 700 : 500, lineHeight: 1 }}>
              {item.label.split(' ')[0]}
            </span>
            {item.badge && (
              <span style={{
                position: 'absolute', top: 2, right: 6,
                fontSize: 9, fontWeight: 700, background: '#EF4444',
                color: '#fff', borderRadius: '50%', width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
