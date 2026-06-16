'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageSquare, Flag, Eye, Megaphone, BarChart2,
  Shield, Bell, LogOut, CheckCircle, AlertTriangle, Star,
} from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { getToken } from '@/lib/auth'
import ThemeToggle from '@/components/ui/ThemeToggle'
import PanelBackground from '@/components/effects/PanelBackground'

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
  description: string
}

interface Report {
  id: string
  reporter: string
  reported: string
  reason: 'spam' | 'harassment' | 'fake'
  date: string
  status: 'pending' | 'reviewed'
  detail: string
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
  { id: 'TKT-0041', user: 'Sarah M.',  subject: 'App crash on location share',  priority: 'high',   status: 'open',        created: '2026-06-13 09:12', description: 'App crashes consistently when trying to share live location with family circle. Reproducible on iOS 17.4. Please investigate urgently.' },
  { id: 'TKT-0040', user: 'James R.',  subject: 'SOS alert not triggering',     priority: 'high',   status: 'in-progress', created: '2026-06-13 08:55', description: 'SOS button pressed multiple times but no alert was sent to emergency contacts. This is a safety-critical issue.' },
  { id: 'TKT-0039', user: 'Priya K.',  subject: 'Geofence not saving',          priority: 'medium', status: 'open',        created: '2026-06-12 21:40', description: 'Created a geofence for home zone but it disappears after app restart. Tried reinstalling — same issue.' },
  { id: 'TKT-0038', user: 'Tom B.',    subject: 'Billing charge discrepancy',   priority: 'medium', status: 'in-progress', created: '2026-06-12 17:20', description: 'Charged twice for the Premium plan this month. Transaction IDs: TXN-8821, TXN-8834. Please refund the duplicate.' },
  { id: 'TKT-0037', user: 'Lisa C.',   subject: 'Cannot invite family member',  priority: 'low',    status: 'open',        created: '2026-06-12 14:05', description: 'Invite link sent to husband but he gets "invalid link" error. We are both on latest app version.' },
  { id: 'TKT-0036', user: 'Ahmed S.',  subject: 'Map tiles not loading',        priority: 'low',    status: 'resolved',    created: '2026-06-12 11:30', description: 'Map shows blank tiles in certain zoom levels. Appears to be a caching issue. Clearing cache resolved it.' },
]

const REPORTS: Report[] = [
  { id: 'RPT-001', reporter: 'User_884', reported: 'User_229', reason: 'spam',       date: '2026-06-13 10:01', status: 'pending',  detail: 'Sending repeated promotional messages in family circles claiming fake prize wins.' },
  { id: 'RPT-002', reporter: 'User_512', reported: 'User_671', reason: 'harassment', date: '2026-06-13 08:44', status: 'pending',  detail: 'User sending threatening location check-ins and abusive notes through the app.' },
  { id: 'RPT-003', reporter: 'User_130', reported: 'User_445', reason: 'fake',       date: '2026-06-12 22:15', status: 'reviewed', detail: 'Account appears to be impersonating a known individual. Profile photo stolen.' },
  { id: 'RPT-004', reporter: 'User_761', reported: 'User_088', reason: 'spam',       date: '2026-06-12 19:33', status: 'pending',  detail: 'Mass-inviting strangers to circles and spamming SOS triggers.' },
  { id: 'RPT-005', reporter: 'User_302', reported: 'User_557', reason: 'harassment', date: '2026-06-12 15:10', status: 'reviewed', detail: 'Reviewed — no violation found. Reports appear retaliatory.' },
]

const CONTENT_ITEMS: ContentItem[] = [
  { id: 'CNT-001', type: 'SOS_false_alarm', user: 'User_334', detail: 'Triggered 4 false SOS alerts this week',   submitted: '2026-06-13 09:50' },
  { id: 'CNT-002', type: 'profile_photo',   user: 'User_719', detail: 'Photo flagged for inappropriate content',  submitted: '2026-06-13 07:22' },
  { id: 'CNT-003', type: 'username',         user: 'User_501', detail: 'Username "xXkillrXx" violates policy',    submitted: '2026-06-12 23:05' },
  { id: 'CNT-004', type: 'profile_photo',   user: 'User_158', detail: 'AI flagged: possible minor in photo',      submitted: '2026-06-12 18:40' },
]

const ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'ticket_resolved', user: 'Ahmed S.', mod: 'You',       time: '10 min ago', note: 'Map tiles issue resolved — cache cleared'     },
  { id: 'a2', type: 'report_reviewed', user: 'User_445', mod: 'You',       time: '32 min ago', note: 'Fake account report — warning issued'           },
  { id: 'a3', type: 'user_warned',     user: 'User_334', mod: 'You',       time: '1 hr ago',   note: 'Warned for repeated false SOS triggers'         },
  { id: 'a4', type: 'ticket_resolved', user: 'Ben T.',   mod: 'mod_grace', time: '2 hr ago',   note: 'Notification delay — escalated to engineering'  },
  { id: 'a5', type: 'report_reviewed', user: 'User_088', mod: 'mod_grace', time: '3 hr ago',   note: 'Spam report dismissed — no violation found'     },
  { id: 'a6', type: 'ticket_resolved', user: 'Carla W.', mod: 'mod_raj',   time: '4 hr ago',   note: 'Login issue — password reset sent'              },
]

const WEEK_BARS = [
  { day: 'Mon', val: 58 },
  { day: 'Tue', val: 72 },
  { day: 'Wed', val: 45 },
  { day: 'Thu', val: 88 },
  { day: 'Fri', val: 67 },
  { day: 'Sat', val: 32 },
  { day: 'Sun', val: 19 },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

const priorityColor = (p: Ticket['priority']) =>
  p === 'high' ? 'var(--sos)' : p === 'medium' ? 'var(--warm)' : 'var(--safe)'

const reasonColor = (r: Report['reason']) =>
  r === 'harassment' ? 'var(--sos)' : r === 'spam' ? 'var(--warm)' : 'var(--text-muted)'

const activityColor = (t: ActivityItem['type']) =>
  t === 'ticket_resolved' ? 'var(--safe)' : t === 'report_reviewed' ? 'var(--warm)' : 'var(--sos)'

const activityLabel = (t: ActivityItem['type']) =>
  t === 'ticket_resolved' ? 'Ticket Resolved' : t === 'report_reviewed' ? 'Report Reviewed' : 'User Warned'

const contentTypeColor = (t: ContentItem['type']) =>
  t === 'SOS_false_alarm' ? 'var(--sos)' : t === 'profile_photo' ? 'var(--warm)' : 'var(--text-muted)'

const sectionTitles: Record<NavSection, string> = {
  overview:      'Overview',
  tickets:       'Support Tickets',
  reports:       'User Reports',
  content:       'Content Review',
  announcements: 'Announcements',
  analytics:     'Analytics',
}

// ── Nav Items ──────────────────────────────────────────────────────────────────

interface NavItem {
  id: NavSection
  label: string
  icon: React.ReactNode
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',      label: 'Overview',        icon: <Home size={15} />          },
  { id: 'tickets',       label: 'Support',         icon: <MessageSquare size={15} />, badge: '23' },
  { id: 'reports',       label: 'Reports',         icon: <Flag size={15} />,          badge: '7'  },
  { id: 'content',       label: 'Content Review',  icon: <Eye size={15} />            },
  { id: 'announcements', label: 'Broadcasts',      icon: <Megaphone size={15} />      },
  { id: 'analytics',     label: 'Analytics',       icon: <BarChart2 size={15} />      },
]

// ── SIDEBAR ────────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive, moderatorName, logout }: {
  active: NavSection
  setActive: (s: NavSection) => void
  moderatorName: string
  logout: () => void
}) {
  return (
    <aside style={{
      width: 220,
      height: '100vh',
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Top branding */}
      <div style={{ padding: '16px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Shield size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <span style={{
            fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Gravity
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--gold)',
            background: 'rgba(212,168,83,0.14)',
            borderRadius: 4, padding: '1px 6px',
            letterSpacing: '0.04em',
          }}>
            Mod
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--safe)',
            boxShadow: '0 0 6px var(--safe)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {moderatorName}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '4px 8px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                height: 32,
                padding: '0 8px',
                borderRadius: 6,
                margin: '1px 0',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                textAlign: 'left',
                background: isActive ? 'var(--bg-surface2)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'background 0.12s, border-color 0.12s',
              }}
            >
              <span style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1 }}>
                {item.label}
              </span>
              {item.badge && (
                <span style={{
                  height: 18,
                  minWidth: 18,
                  borderRadius: 9,
                  background: 'var(--sos)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 5px',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom status + logout */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--safe)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>On Duty</span>
        </div>
        <button
          onClick={() => logout()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            height: 32,
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'transparent',
            cursor: 'pointer',
            outline: 'none',
            color: 'var(--text-muted)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <LogOut size={13} />
          Log out
        </button>
      </div>
    </aside>
  )
}

// ── HEADER ─────────────────────────────────────────────────────────────────────

function Header({ active, moderatorName }: { active: NavSection; moderatorName: string }) {
  const initials = moderatorName.slice(0, 2).toUpperCase()
  return (
    <div style={{
      height: 52,
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(24px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={active}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {sectionTitles[active]}
        </motion.span>
      </AnimatePresence>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ThemeToggle />
        <div style={{ position: 'relative' }}>
          <button style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', outline: 'none',
            color: 'var(--text-secondary)',
          }}>
            <Bell size={15} />
          </button>
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 15, height: 15, borderRadius: '50%',
            background: 'var(--sos)', border: '2px solid var(--bg-surface)',
            fontSize: 9, fontWeight: 700, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            5
          </span>
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold), #C07A20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
          flexShrink: 0,
        }}>
          {initials}
        </div>
      </div>
    </div>
  )
}

// ── OVERVIEW ───────────────────────────────────────────────────────────────────

interface TicketStats {
  open: number
  resolved_today: number
  pending_reports: number
  csat: number
  avg_response: string
  active_users: number
}

function Overview({ ticketStats }: { ticketStats: TicketStats }) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      {/* KPI bar */}
      <div style={{
        height: 72,
        flexShrink: 0,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 0,
      }}>
        {[
          { label: 'Open Tickets',     value: String(ticketStats.open),               trend: null, trendUp: null },
          { label: 'Resolved Today',   value: String(ticketStats.resolved_today),      trend: null, trendUp: null },
          { label: 'Pending Reports',  value: String(ticketStats.pending_reports),     trend: null, trendUp: null },
          { label: 'CSAT',             value: ticketStats.csat.toFixed(1) + '★',       trend: null, trendUp: null },
          { label: 'Avg Response',     value: ticketStats.avg_response,                trend: null, trendUp: null },
        ].map((kpi, i, arr) => (
          <div key={kpi.label} style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 3,
            padding: '0 24px',
            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {kpi.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {kpi.value}
              </span>
              {kpi.trend && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: kpi.trendUp ? 'var(--safe)' : 'var(--sos)',
                }}>
                  {kpi.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px 24px',
        display: 'flex',
        gap: 20,
      }}>
        {/* Activity feed — left 62% */}
        <div style={{ flex: 1.6, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 12,
          }}>
            Recent Activity
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ACTIVITY.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: 16 }}>
                {/* Dot + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 7 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: activityColor(item.type),
                    flexShrink: 0,
                  }} />
                  {i < ACTIVITY.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 24, background: 'var(--border)', marginTop: 4 }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {activityLabel(item.type)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {item.time}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                    {item.note}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    by Mod: {item.mod}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's summary — right 38% */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            Today's Summary
          </div>

          <button style={{
            width: '100%',
            height: 40,
            borderRadius: 8,
            border: '1px solid rgba(212,168,83,0.25)',
            background: 'rgba(212,168,83,0.06)',
            color: 'var(--gold)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            textAlign: 'left',
            padding: '0 14px',
          }}>
            Review Oldest Ticket →
          </button>

          <button style={{
            width: '100%',
            height: 40,
            borderRadius: 8,
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.05)',
            color: 'var(--sos)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            textAlign: 'left',
            padding: '0 14px',
          }}>
            Handle Pending Reports →
          </button>

          {/* CSAT callout */}
          <div style={{
            borderRadius: 8,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '14px 16px',
            marginTop: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Star size={14} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                You're doing great
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your CSAT is <strong style={{ color: 'var(--gold)' }}>4.6 / 5</strong> based on 183 ratings this week — top 10% of the team.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── TICKETS ────────────────────────────────────────────────────────────────────

function SupportTickets({ realTickets, loadingTickets }: { realTickets: any[]; loadingTickets: boolean }) {
  const displayTickets: Ticket[] = realTickets.length > 0
    ? realTickets.map((t: any) => ({
        id: t.ticket_number || t.id || 'TKT-?',
        user: t.user_email || t.user || 'Unknown',
        subject: t.subject || 'No subject',
        priority: (t.priority === 'critical' ? 'high' : t.priority === 'normal' ? 'medium' : t.priority) as Ticket['priority'] || 'medium',
        status: (t.status === 'in_progress' ? 'in-progress' : t.status) as Ticket['status'] || 'open',
        created: t.created_at ? new Date(t.created_at).toLocaleString() : '',
        description: t.description || '',
      }))
    : TICKETS

  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [selected, setSelected] = useState<Ticket | null>(displayTickets[0] ?? null)
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, Ticket['status']>>({})

  const filtered = displayTickets.filter(t => {
    if (filter === 'open') return t.status !== 'resolved'
    if (filter === 'resolved') return t.status === 'resolved'
    return true
  })

  const getStatus = (t: Ticket) => ticketStatuses[t.id] ?? t.status

  return (
    <motion.div
      key="tickets"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ display: 'flex', height: '100%', overflow: 'hidden' }}
    >
      {/* Left pane — 45% */}
      <div style={{
        width: '45%',
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Filter row */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 4,
          flexShrink: 0,
        }}>
          {(['all', 'open', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: filter === f ? '1px solid rgba(212,168,83,0.35)' : '1px solid var(--border)',
                background: filter === f ? 'rgba(212,168,83,0.1)' : 'transparent',
                color: filter === f ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: filter === f ? 600 : 400,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.12s',
              }}
            >
              {f === 'all' ? 'All' : f === 'open' ? 'Open' : 'Resolved'}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(ticket => {
            const isSelected = selected?.id === ticket.id
            const status = getStatus(ticket)
            return (
              <div
                key={ticket.id}
                onClick={() => setSelected(ticket)}
                style={{
                  height: 64,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  borderLeft: isSelected ? '2px solid var(--gold)' : '2px solid transparent',
                  background: isSelected ? 'var(--bg-surface2)' : 'transparent',
                  transition: 'background 0.12s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 2,
                  boxSizing: 'border-box',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface2)' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ticket.id}</span>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: priorityColor(ticket.priority), flexShrink: 0 }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ticket.created.split(' ')[1]}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ticket.subject}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ticket.user}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    borderRadius: 4, padding: '1px 6px',
                    background: status === 'resolved' ? 'rgba(16,185,129,0.12)' : status === 'in-progress' ? 'rgba(212,168,83,0.12)' : 'rgba(239,68,68,0.1)',
                    color: status === 'resolved' ? 'var(--safe)' : status === 'in-progress' ? 'var(--gold)' : 'var(--sos)',
                  }}>
                    {status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right pane — 55% */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {selected ? (
          <div>
            {/* ID + priority */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selected.id}</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                padding: '2px 8px', borderRadius: 4,
                background: selected.priority === 'high' ? 'rgba(239,68,68,0.12)' : selected.priority === 'medium' ? 'rgba(212,168,83,0.12)' : 'rgba(16,185,129,0.1)',
                color: priorityColor(selected.priority),
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {selected.priority}
              </span>
            </div>

            {/* Subject heading */}
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.3 }}>
              {selected.subject}
            </div>

            {/* User info row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg-surface2)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
              }}>
                {selected.user.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{selected.user}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.created}</span>
            </div>

            {/* Status selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {(['open', 'in-progress', 'resolved'] as const).map(s => {
                const cur = ticketStatuses[selected.id] ?? selected.status
                return (
                  <button
                    key={s}
                    onClick={() => setTicketStatuses(prev => ({ ...prev, [selected.id]: s }))}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: cur === s ? 600 : 400,
                      cursor: 'pointer',
                      outline: 'none',
                      border: cur === s
                        ? s === 'resolved' ? '1px solid rgba(16,185,129,0.4)' : s === 'in-progress' ? '1px solid rgba(212,168,83,0.4)' : '1px solid rgba(239,68,68,0.3)'
                        : '1px solid var(--border)',
                      background: cur === s
                        ? s === 'resolved' ? 'rgba(16,185,129,0.1)' : s === 'in-progress' ? 'rgba(212,168,83,0.1)' : 'rgba(239,68,68,0.08)'
                        : 'transparent',
                      color: cur === s
                        ? s === 'resolved' ? 'var(--safe)' : s === 'in-progress' ? 'var(--gold)' : 'var(--sos)'
                        : 'var(--text-muted)',
                      transition: 'all 0.12s',
                    }}
                  >
                    {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                )
              })}
            </div>

            {/* Description */}
            <div style={{
              background: 'var(--bg-surface2)',
              borderRadius: 8,
              padding: 16,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 16,
            }}>
              {selected.description}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setTicketStatuses(prev => ({ ...prev, [selected.id]: 'resolved' }))}
                style={{
                  padding: '8px 18px', borderRadius: 7,
                  border: '1px solid rgba(16,185,129,0.3)',
                  background: 'rgba(16,185,129,0.1)',
                  color: 'var(--safe)', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', outline: 'none',
                }}
              >
                Resolve
              </button>
              <button style={{
                padding: '8px 18px', borderRadius: 7,
                border: '1px solid rgba(99,102,241,0.3)',
                background: 'rgba(99,102,241,0.08)',
                color: '#818CF8', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', outline: 'none',
              }}>
                Assign
              </button>
              <button style={{
                padding: '8px 18px', borderRadius: 7,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)', fontWeight: 500, fontSize: 13,
                cursor: 'pointer', outline: 'none',
              }}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 13,
          }}>
            Select a ticket to view details
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── REPORTS ────────────────────────────────────────────────────────────────────

function UserReports() {
  const [selected, setSelected] = useState<Report | null>(REPORTS[0])
  const [reportStatuses, setReportStatuses] = useState<Record<string, Report['status']>>({})

  const getStatus = (r: Report) => reportStatuses[r.id] ?? r.status

  return (
    <motion.div
      key="reports"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ display: 'flex', height: '100%', overflow: 'hidden' }}
    >
      {/* Left pane */}
      <div style={{
        width: '45%',
        flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          {REPORTS.filter(r => getStatus(r) === 'pending').length} pending
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {REPORTS.map(report => {
            const isSelected = selected?.id === report.id
            const status = getStatus(report)
            return (
              <div
                key={report.id}
                onClick={() => setSelected(report)}
                style={{
                  height: 64,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  borderLeft: isSelected ? '2px solid var(--gold)' : '2px solid transparent',
                  background: isSelected ? 'var(--bg-surface2)' : 'transparent',
                  transition: 'background 0.12s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 2,
                  boxSizing: 'border-box',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface2)' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{report.id}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    borderRadius: 4, padding: '1px 6px',
                    background: status === 'reviewed' ? 'rgba(16,185,129,0.12)' : 'rgba(212,168,83,0.12)',
                    color: status === 'reviewed' ? 'var(--safe)' : 'var(--gold)',
                  }}>
                    {status}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {report.reporter} → {report.reported}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: reasonColor(report.reason), flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{report.reason}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right pane */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {selected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selected.id}</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                padding: '2px 8px', borderRadius: 4,
                background: `color-mix(in srgb, ${reasonColor(selected.reason)} 12%, transparent)`,
                color: reasonColor(selected.reason),
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {selected.reason}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              Report: {selected.reporter} reported {selected.reported}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{selected.date}</div>

            <div style={{
              background: 'var(--bg-surface2)',
              borderRadius: 8,
              padding: 16,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 16,
            }}>
              {selected.detail}
            </div>

            {(reportStatuses[selected.id] ?? selected.status) === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setReportStatuses(prev => ({ ...prev, [selected.id]: 'reviewed' }))}
                  style={{
                    padding: '8px 18px', borderRadius: 7,
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.08)',
                    color: 'var(--sos)', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  Warn User
                </button>
                <button
                  onClick={() => setReportStatuses(prev => ({ ...prev, [selected.id]: 'reviewed' }))}
                  style={{
                    padding: '8px 18px', borderRadius: 7,
                    border: '1px solid rgba(16,185,129,0.3)',
                    background: 'rgba(16,185,129,0.08)',
                    color: 'var(--safe)', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => setReportStatuses(prev => ({ ...prev, [selected.id]: 'reviewed' }))}
                  style={{
                    padding: '8px 18px', borderRadius: 7,
                    border: '1px solid rgba(212,168,83,0.3)',
                    background: 'rgba(212,168,83,0.08)',
                    color: 'var(--gold)', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  Escalate
                </button>
              </div>
            )}
            {(reportStatuses[selected.id] ?? selected.status) === 'reviewed' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'var(--safe)', fontSize: 13, fontWeight: 600,
              }}>
                <CheckCircle size={16} />
                Report reviewed
              </div>
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Select a report to review
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── CONTENT REVIEW ─────────────────────────────────────────────────────────────

function ContentReview() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = CONTENT_ITEMS.filter(c => !dismissed.has(c.id))

  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ padding: '20px 24px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <AnimatePresence>
          {visible.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                marginBottom: 6,
              }}
            >
              {/* Type indicator */}
              <div style={{
                width: 3, height: 40, borderRadius: 2, flexShrink: 0,
                background: contentTypeColor(item.type),
              }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                    background: `color-mix(in srgb, ${contentTypeColor(item.type)} 12%, transparent)`,
                    color: contentTypeColor(item.type),
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {item.type.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.id}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.user}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{item.detail}</div>
              </div>

              {/* Timestamp */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {item.submitted.split(' ')[1]}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => setDismissed(prev => new Set([...prev, item.id]))}
                  style={{
                    padding: '6px 14px', borderRadius: 6,
                    border: '1px solid rgba(16,185,129,0.3)',
                    background: 'rgba(16,185,129,0.08)',
                    color: 'var(--safe)', fontWeight: 600, fontSize: 12,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => setDismissed(prev => new Set([...prev, item.id]))}
                  style={{
                    padding: '6px 14px', borderRadius: 6,
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.08)',
                    color: 'var(--sos)', fontWeight: 600, fontSize: 12,
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {dismissed.size === CONTENT_ITEMS.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '48px 24px', textAlign: 'center',
              color: 'var(--safe)', fontWeight: 600, fontSize: 14,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}
          >
            <CheckCircle size={36} />
            Queue is clear — all items reviewed
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ── ANNOUNCEMENTS ──────────────────────────────────────────────────────────────

function Announcements() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    platforms: { ios: true, android: true, web: false },
  })
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    if (!form.title || !form.message) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ title: '', message: '', platforms: { ios: true, android: true, web: false } })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 7,
    border: '1px solid var(--border)',
    background: 'var(--bg-surface2)',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <motion.div
      key="announcements"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ padding: '20px 24px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}
    >
      <div style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Megaphone size={16} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Send Broadcast</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              style={inputStyle}
              placeholder="Announcement title..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div>
            <label style={labelStyle}>Message</label>
            <textarea
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.6 }}
              placeholder="Write your announcement..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>

          {/* Platform checkboxes */}
          <div>
            <label style={labelStyle}>Platforms</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['ios', 'android', 'web'] as const).map(p => (
                <label key={p} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 13, color: 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 500,
                }}>
                  <input
                    type="checkbox"
                    checked={form.platforms[p]}
                    onChange={e => setForm(f => ({ ...f, platforms: { ...f.platforms, [p]: e.target.checked } }))}
                    style={{ accentColor: 'var(--gold)', width: 14, height: 14 }}
                  />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSend}
            style={{
              height: 40, borderRadius: 8, cursor: 'pointer', outline: 'none',
              background: sent ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, var(--gold), #C07A20)',
              color: sent ? 'var(--safe)' : '#fff',
              border: sent ? '1px solid rgba(16,185,129,0.3)' : 'none',
              fontWeight: 600, fontSize: 13,
              transition: 'all 0.25s',
            }}
          >
            {sent ? 'Broadcast sent' : 'Send Announcement'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── ANALYTICS ──────────────────────────────────────────────────────────────────

function Analytics() {
  const maxVal = Math.max(...WEEK_BARS.map(b => b.val))

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ padding: '20px 24px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}
    >
      {/* Mini stat row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Tickets This Week', value: '67',   sub: 'vs 54 last week', color: 'var(--warm)' },
          { label: 'Resolution Rate',   value: '94%',  sub: 'Top 10% of team', color: 'var(--safe)' },
          { label: 'CSAT',              value: '4.6★', sub: '183 ratings',     color: 'var(--gold)' },
          { label: 'Escalations',       value: '3',    sub: '2 resolved today', color: 'var(--sos)' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 140,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8, padding: '20px 20px 16px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 7 }}>
          <BarChart2 size={15} style={{ color: 'var(--gold)' }} />
          Tickets Resolved — This Week
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
          {WEEK_BARS.map((bar, i) => (
            <div key={bar.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{bar.val}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.round((bar.val / maxVal) * 108)}px` }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  borderRadius: '4px 4px 0 0',
                  background: i === 3
                    ? 'linear-gradient(180deg, var(--gold), #C07A20)'
                    : 'rgba(212,168,83,0.28)',
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance metrics */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8, padding: '16px 20px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
          Performance Metrics
        </div>
        {[
          { label: 'SLA Compliance',    val: 94, color: 'var(--safe)'    },
          { label: 'First Reply Speed', val: 78, color: 'var(--gold)'    },
          { label: 'Escalation Rate',   val: 12, color: 'var(--sos)'     },
          { label: 'CSAT Target',       val: 88, color: 'var(--primary)' },
        ].map((m, i) => (
          <div key={m.label} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
              <span style={{ fontSize: 12, color: m.color, fontWeight: 700 }}>{m.val}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--bg-surface2)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.val}%` }}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.65, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 3, background: m.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────

export default function ModeratorPage() {
  const { user, logout } = useAuth()
  const [active, setActive] = useState<NavSection>('overview')
  const [realTickets, setRealTickets] = useState<any[]>([])
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    open: 23,
    resolved_today: 45,
    pending_reports: 7,
    csat: 4.6,
    avg_response: '2.3h',
    active_users: 0,
  })
  const [loadingTickets, setLoadingTickets] = useState(false)

  useEffect(() => {
    setLoadingTickets(true)
    const authToken = getToken() || ''

    fetch('/support/tickets?limit=50', {
      headers: authToken ? { Authorization: 'Bearer ' + authToken } : {},
    })
      .then(r => r.ok ? r.json() : { tickets: [], total: 0 })
      .then(d => {
        const tickets = d.tickets || d || []
        if (Array.isArray(tickets) && tickets.length > 0) {
          setRealTickets(tickets)
          const open = tickets.filter((t: any) => t.status === 'open').length
          const resolved_today = tickets.filter((t: any) => t.status === 'resolved').length
          setTicketStats(prev => ({ ...prev, open, resolved_today }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTickets(false))
  }, [])

  const moderatorName = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2) + '.'
    : user?.email?.split('@')[0] || 'Rahul M.'

  const displayName = user?.name
    ? user.name.split(' ')[0] + ' ' + (user.name.split(' ')[1]?.[0] ?? '') + '.'
    : 'Rahul M.'

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      <PanelBackground />

      {/* Sidebar */}
      <Sidebar
        active={active}
        setActive={setActive}
        moderatorName={displayName}
        logout={logout}
      />

      {/* Right: header + content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header active={active} moderatorName={displayName} />

        {/* Section content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {active === 'overview'      && <Overview key="overview" ticketStats={ticketStats} />}
            {active === 'tickets'       && <SupportTickets key="tickets" realTickets={realTickets} loadingTickets={loadingTickets} />}
            {active === 'reports'       && <UserReports key="reports" />}
            {active === 'content'       && <ContentReview key="content" />}
            {active === 'announcements' && <Announcements key="announcements" />}
            {active === 'analytics'     && <Analytics key="analytics" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
