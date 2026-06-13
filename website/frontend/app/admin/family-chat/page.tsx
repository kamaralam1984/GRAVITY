'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Users,
  Flag,
  Trash2,
  Eye,
  Search,
  Filter,
  Shield,
  AlertTriangle,
  ThumbsUp,
  Send,
  MoreHorizontal,
  CheckCheck,
  Image,
} from 'lucide-react'

/* ──────────────────────────── types ──────────────────────────── */
interface ReportedMessage {
  id: string
  reportedBy: string
  reportedByInitials: string
  reportedByColor: string
  messageFrom: string
  messageFromInitials: string
  messageFromColor: string
  messagePreview: string
  reason: string
  reasonColor: string
  timeAgo: string
}

interface ChatActivity {
  id: string
  family: string
  familyInitials: string
  color: string
  members: number
  messagesToday: number
  media: number
  lastActive: string
  status: 'Active' | 'Quiet' | 'Inactive'
}

interface MediaItem {
  id: string
  family: string
  member: string
  memberInitials: string
  color: string
  timestamp: string
  bg: string
  type: 'photo' | 'video'
}

/* ──────────────────────────── data ───────────────────────────── */
const REPORTED_MESSAGES: ReportedMessage[] = [
  {
    id: 'RPT-001',
    reportedBy: 'Ananya Sharma',
    reportedByInitials: 'AS',
    reportedByColor: '#4B80F0',
    messageFrom: 'Unknown Contact',
    messageFromInitials: 'UC',
    messageFromColor: '#6B7280',
    messagePreview: 'Buy our product now! Special offer just for you...',
    reason: 'Spam',
    reasonColor: '#F59E0B',
    timeAgo: '15 min ago',
  },
  {
    id: 'RPT-002',
    reportedBy: 'Priya Mehta',
    reportedByInitials: 'PM',
    reportedByColor: '#10B981',
    messageFrom: 'Rahul M.',
    messageFromInitials: 'RM',
    messageFromColor: '#EF4444',
    messagePreview: 'This message has been flagged for inappropriate content...',
    reason: 'Inappropriate',
    reasonColor: '#EF4444',
    timeAgo: '1 hr ago',
  },
  {
    id: 'RPT-003',
    reportedBy: 'Suresh Kumar',
    reportedByInitials: 'SK',
    reportedByColor: '#8B5CF6',
    messageFrom: 'Divya R.',
    messageFromInitials: 'DR',
    messageFromColor: '#F59E0B',
    messagePreview: 'Forwarded chain message with unverified health claims...',
    reason: 'Misinformation',
    reasonColor: '#F59E0B',
    timeAgo: '2 hr ago',
  },
  {
    id: 'RPT-004',
    reportedBy: 'Kavita Nair',
    reportedByInitials: 'KN',
    reportedByColor: '#D4A853',
    messageFrom: 'Unknown Contact',
    messageFromInitials: 'UC',
    messageFromColor: '#6B7280',
    messagePreview: 'Win Rs 50,000 instantly! Click this link to claim your prize...',
    reason: 'Phishing',
    reasonColor: '#EF4444',
    timeAgo: '3 hr ago',
  },
  {
    id: 'RPT-005',
    reportedBy: 'Rohit Verma',
    reportedByInitials: 'RV',
    reportedByColor: '#4B80F0',
    messageFrom: 'Neha K.',
    messageFromInitials: 'NK',
    messageFromColor: '#10B981',
    messagePreview: 'Repeated messages sent 47 times within an hour to group...',
    reason: 'Spam',
    reasonColor: '#F59E0B',
    timeAgo: '4 hr ago',
  },
]

const CHAT_ACTIVITY: ChatActivity[] = [
  { id: 'FAM-001', family: 'Sharma Family',     familyInitials: 'SF', color: '#4B80F0', members: 5, messagesToday: 234, media: 12, lastActive: '2 min ago',  status: 'Active' },
  { id: 'FAM-002', family: 'Mehta Household',   familyInitials: 'MH', color: '#D4A853', members: 3, messagesToday: 89,  media: 3,  lastActive: '15 min ago', status: 'Active' },
  { id: 'FAM-003', family: 'Iyer Circle',       familyInitials: 'IC', color: '#10B981', members: 7, messagesToday: 412, media: 28, lastActive: '5 min ago',  status: 'Active' },
  { id: 'FAM-004', family: 'Kapoor Family',     familyInitials: 'KF', color: '#8B5CF6', members: 4, messagesToday: 167, media: 9,  lastActive: '30 min ago', status: 'Active' },
  { id: 'FAM-005', family: 'Patel Group',       familyInitials: 'PG', color: '#EF4444', members: 6, messagesToday: 53,  media: 1,  lastActive: '1 hr ago',   status: 'Quiet' },
  { id: 'FAM-006', family: 'Joshi Family',      familyInitials: 'JF', color: '#F59E0B', members: 4, messagesToday: 298, media: 17, lastActive: '8 min ago',  status: 'Active' },
  { id: 'FAM-007', family: 'Reddy Household',   familyInitials: 'RH', color: '#4B80F0', members: 5, messagesToday: 76,  media: 4,  lastActive: '45 min ago', status: 'Quiet' },
  { id: 'FAM-008', family: 'Singh Circle',      familyInitials: 'SC', color: '#10B981', members: 8, messagesToday: 521, media: 34, lastActive: '1 min ago',  status: 'Active' },
  { id: 'FAM-009', family: 'Gupta Family',      familyInitials: 'GF', color: '#D4A853', members: 3, messagesToday: 22,  media: 0,  lastActive: '3 hr ago',   status: 'Quiet' },
  { id: 'FAM-010', family: 'Chatterjee Group',  familyInitials: 'CG', color: '#8B5CF6', members: 6, messagesToday: 189, media: 11, lastActive: '12 min ago', status: 'Active' },
]

const MEDIA_ITEMS: MediaItem[] = [
  { id: 'MED-001', family: 'Sharma Family',    member: 'Priya S.',   memberInitials: 'PS', color: '#4B80F0', timestamp: '10:14 AM', bg: 'linear-gradient(135deg,#4B80F0,#6B96F5)', type: 'photo' },
  { id: 'MED-002', family: 'Iyer Circle',      member: 'Sunita I.',  memberInitials: 'SI', color: '#10B981', timestamp: '10:31 AM', bg: 'linear-gradient(135deg,#10B981,#34D399)', type: 'video' },
  { id: 'MED-003', family: 'Joshi Family',     member: 'Deepa J.',   memberInitials: 'DJ', color: '#F59E0B', timestamp: '10:45 AM', bg: 'linear-gradient(135deg,#F59E0B,#FBBF24)', type: 'photo' },
  { id: 'MED-004', family: 'Singh Circle',     member: 'Arjun S.',   memberInitials: 'AS', color: '#D4A853', timestamp: '11:02 AM', bg: 'linear-gradient(135deg,#C9913A,#D4A853)', type: 'photo' },
  { id: 'MED-005', family: 'Kapoor Family',    member: 'Meera K.',   memberInitials: 'MK', color: '#8B5CF6', timestamp: '11:18 AM', bg: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', type: 'video' },
  { id: 'MED-006', family: 'Chatterjee Group', member: 'Neha C.',    memberInitials: 'NC', color: '#EF4444', timestamp: '11:33 AM', bg: 'linear-gradient(135deg,#EF4444,#F87171)', type: 'photo' },
]

/* hourly message volume (24h) */
const HOURLY_MSGS = [
  420, 180, 90, 60, 80, 220, 580, 1240, 1890, 2100,
  1760, 1540, 1980, 1650, 1420, 1680, 2040, 2380, 2650, 2200,
  1820, 1340, 870, 560,
]
const MAX_MSG = Math.max(...HOURLY_MSGS)

/* ──────────────────────────── helpers ────────────────────────── */
const cardVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
}

function reasonBadge(reason: string, color: string) {
  return (
    <span style={{
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 999,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.03em',
    }}>
      {reason}
    </span>
  )
}

function statusBadge(status: ChatActivity['status']) {
  const map = {
    Active:   { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.3)' },
    Quiet:    { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
    Inactive: { bg: 'rgba(107,114,128,0.12)', color: '#6B7280', border: 'rgba(107,114,128,0.3)' },
  }
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', dot: '#6B7280' }
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      {status}
    </span>
  )
}

/* ──────────────────────────── components ─────────────────────── */
function ReportCard({ report, index }: { report: ReportedMessage; index: number }) {
  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -2, boxShadow: '0 10px 32px rgba(239,68,68,0.12)' }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 18,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: report.reasonColor, borderRadius: '18px 0 0 18px' }} />

      <div style={{ paddingLeft: 6 }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: report.reportedByColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {report.reportedByInitials}
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Reported by</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{report.reportedBy}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>→</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: report.messageFromColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {report.messageFromInitials}
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Message from</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{report.messageFrom}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {reasonBadge(report.reason, report.reasonColor)}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{report.timeAgo}</span>
          </div>
        </div>

        {/* blurred message preview */}
        <div style={{
          background: 'var(--bg-surface2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 14,
          fontSize: 13,
          color: 'var(--text-secondary)',
          filter: 'blur(3px)',
          userSelect: 'none',
          fontStyle: 'italic',
          transition: 'filter 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'blur(0px)')}
          onMouseLeave={e => (e.currentTarget.style.filter = 'blur(3px)')}
          title="Hover to reveal"
        >
          {report.messagePreview}
        </div>

        {/* action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface2)', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <Eye size={12} />
            View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <Trash2 size={12} />
            Remove
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#10B981', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <ThumbsUp size={12} />
            Dismiss
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────── page ───────────────────────────── */
export default function FamilyChatPage() {
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const STATS = [
    { label: 'Messages Today', value: '1,23,456', trend: '↑23.4%', trendUp: true, sub: 'across all families', color: '#4B80F0', icon: MessageCircle },
    { label: 'Active Chats',   value: '34,891',   trend: null,       trendUp: true, sub: 'families chatting now', color: '#10B981', icon: Users },
    { label: 'Reported Messages', value: '12',    trend: null,       trendUp: false, sub: 'needs review', color: '#EF4444', icon: Flag },
    { label: 'Media Shared',   value: '8,432',    trend: null,       trendUp: true, sub: 'photos/videos today', color: '#D4A853', icon: Image },
  ]

  const filteredActivity = CHAT_ACTIVITY.filter(c =>
    c.family.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Family Chat
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #C9913A, #D4A853)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              borderRadius: 6,
              padding: '3px 8px',
            }}>
              NEW
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Monitor family conversations and handle community reports
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 12,
            background: 'rgba(var(--gold-rgb),0.1)',
            border: '1px solid rgba(var(--gold-rgb),0.3)',
            color: 'var(--gold)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
          }}
        >
          <Shield size={14} />
          Chat Guidelines
        </motion.button>
      </motion.div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(({ label, value, trend, trendUp, sub, color, icon: Icon }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px 22px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}16`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={color} />
              </div>
              {trend && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: trendUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  color: trendUp ? '#10B981' : '#EF4444',
                  padding: '2px 8px', borderRadius: 999,
                }}>
                  {trend}
                </span>
              )}
            </div>
            <div
              className="gradient-text-gold"
              style={{ fontSize: 28, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 4 }}
            >
              {value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Reported Messages (priority) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid rgba(239,68,68,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(239,68,68,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Reported Messages</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Requires moderation review</div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 10px' }}
            >
              12 pending
            </motion.div>
          </div>
          <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, cursor: 'pointer' }}>View all</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '20px 22px' }}>
          {REPORTED_MESSAGES.slice(0, 3).map((r, i) => (
            <ReportCard key={r.id} report={r} index={i} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, padding: '0 22px 20px' }}>
          {REPORTED_MESSAGES.slice(3).map((r, i) => (
            <ReportCard key={r.id} report={r} index={i + 3} />
          ))}
        </div>
      </motion.div>

      {/* ── Chat Activity Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Chat Activity</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>All family conversations today</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
              <Search size={13} color="var(--text-muted)" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search families..."
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', width: 160 }}
              />
            </div>
            <motion.button whileHover={{ scale: 1.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface2)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              <Filter size={13} />
              Filter
            </motion.button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Family', 'Members', 'Messages Today', 'Media', 'Last Active', 'Status', 'Actions'].map(col => (
                <th key={col} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredActivity.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.42 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent', cursor: 'pointer' }}
                whileHover={{ backgroundColor: 'rgba(75,128,240,0.04)' } as any}
              >
                <td style={{ padding: '13px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {row.familyInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.family}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Users size={12} color="var(--text-muted)" />
                    {row.members}
                  </div>
                </td>
                <td style={{ padding: '13px 18px' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: row.messagesToday > 300 ? '#D4A853' : 'var(--text-primary)' }}>
                    {row.messagesToday.toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Image size={12} color="var(--text-muted)" />
                    {row.media}
                  </div>
                </td>
                <td style={{ padding: '13px 18px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.lastActive}</td>
                <td style={{ padding: '13px 18px' }}>{statusBadge(row.status)}</td>
                <td style={{ padding: '13px 18px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <motion.button
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(75,128,240,0.3)', background: 'rgba(75,128,240,0.08)', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <Eye size={12} />
                      View Chat
                    </motion.button>
                    <div style={{ position: 'relative' }}>
                      <motion.button
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        <MoreHorizontal size={13} />
                      </motion.button>
                      <AnimatePresence>
                        {openMenu === row.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            style={{ position: 'absolute', right: 0, top: 34, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 6, zIndex: 100, minWidth: 150, boxShadow: '0 8px 32px rgba(0,0,0,0.14)' }}
                          >
                            {['View All Messages', 'Export Chat Log', 'Send Warning', 'Mute Chat'].map(action => (
                              <div
                                key={action}
                                style={{ padding: '8px 12px', fontSize: 13, color: action === 'Mute Chat' ? '#EF4444' : 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
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

        <div style={{ padding: '13px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredActivity.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>10</strong> families
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Updated live</span>
        </div>
      </motion.div>

      {/* ── Message Volume Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '22px 26px', marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Message Volume</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>24-hour activity — messages per hour</div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#D4A853' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Messages</span>
            </div>
          </div>
        </div>

        <svg viewBox="0 0 960 200" style={{ width: '100%', display: 'block' }} aria-label="24-hour message volume bar chart">
          <defs>
            <linearGradient id="goldBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A853" stopOpacity="1" />
              <stop offset="100%" stopColor="#C9913A" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* grid lines */}
          {[0.25, 0.5, 0.75, 1].map(f => (
            <line key={f} x1={20} y1={10 + (1 - f) * 160} x2={950} y2={10 + (1 - f) * 160}
              stroke="var(--border)" strokeWidth={1} strokeDasharray="3 4" />
          ))}

          {/* bars */}
          {HOURLY_MSGS.map((v, i) => {
            const barW = 30
            const gap = (960 - 20 - barW * 24) / 23
            const x = 20 + i * (barW + gap)
            const barH = (v / MAX_MSG) * 160
            const y = 10 + 160 - barH
            const isPeak = v > 1800
            return (
              <motion.rect
                key={i}
                x={x} y={y}
                width={barW}
                height={0}
                rx={4} ry={4}
                fill={isPeak ? 'url(#goldBarGrad)' : 'rgba(212,168,83,0.45)'}
                animate={{ height: barH, y }}
                initial={{ height: 0, y: 170 }}
                transition={{ duration: 0.7, delay: i * 0.03, ease: 'easeOut' }}
              />
            )
          })}

          {/* x axis labels (every 3 hours) */}
          {[0, 3, 6, 9, 12, 15, 18, 21].map(h => {
            const barW = 30
            const gap = (960 - 20 - barW * 24) / 23
            const x = 20 + h * (barW + gap) + barW / 2
            return (
              <text key={h} x={x} y={188} textAnchor="middle" fontSize={10} fill="var(--text-muted)" fontFamily="Inter, sans-serif">
                {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
              </text>
            )
          })}
        </svg>
      </motion.div>

      {/* ── Media Moderation ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Media Moderation</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Recently shared photos and videos</div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 999, padding: '3px 10px' }}>
            8,432 today
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, padding: '20px 22px' }}>
          {MEDIA_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 + 0.5 }}
              whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.12)' }}
              style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-surface2)' }}
            >
              {/* thumbnail placeholder */}
              <div style={{ height: 110, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Image size={28} color="rgba(255,255,255,0.7)" />
                {item.type === 'video' && (
                  <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                    VIDEO
                  </div>
                )}
              </div>

              {/* info */}
              <div style={{ padding: '10px 10px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.family}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff' }}>
                    {item.memberInitials}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.member}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }}>{item.timestamp}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    style={{ width: '100%', padding: '5px', borderRadius: 7, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#10B981', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                  >
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    style={{ width: '100%', padding: '5px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                  >
                    Remove
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
