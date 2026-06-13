'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/api'
import {
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Calendar,
  Bell,
  CheckSquare,
  XCircle,
  MoreHorizontal,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
type CheckInStatus = 'Completed' | 'Missed' | 'Pending' | 'Late' | 'Overdue'
type TabType = 'All' | CheckInStatus

interface CheckInRow {
  id: string
  member: string
  initials: string
  avatarColor: string
  family: string
  scheduled: string
  actual: string
  status: CheckInStatus
  location: string
}

interface MissedEntry {
  name: string
  initials: string
  color: string
  family: string
  timeMissed: string
  scheduledFor: string
}

interface RuleRow {
  rule: string
  families: string
  frequency: string
  time: string
  autoReminder: string
}

/* ─────────────────────────── data ──────────────────────────── */
const CHECK_INS: CheckInRow[] = [
  { id: 'CI-001', member: 'Priya Sharma',    initials: 'PS', avatarColor: '#4B80F0', family: 'Sharma Family',    scheduled: '10:00 AM', actual: '10:02 AM', status: 'Completed', location: 'Mumbai'     },
  { id: 'CI-002', member: 'Vihaan Mehta',    initials: 'VM', avatarColor: '#EF4444', family: 'Mehta Family',     scheduled: '10:00 AM', actual: '--',       status: 'Missed',    location: 'Delhi'      },
  { id: 'CI-003', member: 'Dadi Iyer',       initials: 'DI', avatarColor: '#10B981', family: 'Iyer Family',      scheduled: '09:30 AM', actual: '09:28 AM', status: 'Completed', location: 'Bangalore'  },
  { id: 'CI-004', member: 'Ananya Singh',    initials: 'AS', avatarColor: '#F59E0B', family: 'Singh Family',     scheduled: '10:30 AM', actual: '--',       status: 'Pending',   location: 'Chennai'    },
  { id: 'CI-005', member: 'Rahul Gupta',     initials: 'RG', avatarColor: '#8B5CF6', family: 'Gupta Family',     scheduled: '08:00 AM', actual: '08:45 AM', status: 'Late',      location: 'Mumbai'     },
  { id: 'CI-006', member: 'Kavya Reddy',     initials: 'KR', avatarColor: '#EC4899', family: 'Reddy Family',     scheduled: '09:00 AM', actual: '--',       status: 'Overdue',   location: 'Hyderabad'  },
  { id: 'CI-007', member: 'Arjun Kapoor',    initials: 'AK', avatarColor: '#06B6D4', family: 'Kapoor Circle',    scheduled: '08:30 AM', actual: '08:31 AM', status: 'Completed', location: 'Pune'       },
  { id: 'CI-008', member: 'Meera Nair',      initials: 'MN', avatarColor: '#10B981', family: 'Nair Household',   scheduled: '10:00 AM', actual: '10:18 AM', status: 'Late',      location: 'Kochi'      },
  { id: 'CI-009', member: 'Rohan Patel',     initials: 'RP', avatarColor: '#F97316', family: 'Patel Circle',     scheduled: '07:30 AM', actual: '07:30 AM', status: 'Completed', location: 'Ahmedabad'  },
  { id: 'CI-010', member: 'Sunita Joshi',    initials: 'SJ', avatarColor: '#D4A853', family: 'Joshi Household',  scheduled: '11:00 AM', actual: '--',       status: 'Pending',   location: 'Jaipur'     },
  { id: 'CI-011', member: 'Deepa Verma',     initials: 'DV', avatarColor: '#6366F1', family: 'Verma Family',     scheduled: '09:45 AM', actual: '--',       status: 'Missed',    location: 'Lucknow'    },
  { id: 'CI-012', member: 'Kiran Chatterjee',initials: 'KC', avatarColor: '#14B8A6', family: 'Chatterjee Family',scheduled: '08:15 AM', actual: '08:16 AM', status: 'Completed', location: 'Kolkata'    },
]

const MISSED_ENTRIES: MissedEntry[] = [
  { name: 'Vihaan Mehta',  initials: 'VM', color: '#EF4444', family: 'Mehta Family',    timeMissed: '42 min ago', scheduledFor: '10:00 AM' },
  { name: 'Kavya Reddy',   initials: 'KR', color: '#EC4899', family: 'Reddy Family',    timeMissed: '1h 12m ago', scheduledFor: '09:00 AM' },
  { name: 'Deepa Verma',   initials: 'DV', color: '#6366F1', family: 'Verma Family',    timeMissed: '57 min ago', scheduledFor: '09:45 AM' },
  { name: 'Aarav Kumar',   initials: 'AK', color: '#F97316', family: 'Kumar Family',    timeMissed: '2h 5m ago',  scheduledFor: '08:00 AM' },
  { name: 'Nisha Bose',    initials: 'NB', color: '#8B5CF6', family: 'Bose Household',  timeMissed: '1h 40m ago', scheduledFor: '08:30 AM' },
]

const RULES: RuleRow[] = [
  { rule: 'School Drop-off', families: '12,432', frequency: 'Weekdays',  time: '8:30 AM',            autoReminder: 'Yes (15 min before)' },
  { rule: 'Work Commute',    families: '8,234',  frequency: 'Weekdays',  time: '9:00 AM',            autoReminder: 'Yes (10 min before)' },
  { rule: 'Evening Return',  families: '15,234', frequency: 'Daily',     time: '7:00 PM',            autoReminder: 'Yes (20 min before)' },
  { rule: 'Dadi Wellness',   families: '5,432',  frequency: 'Daily',     time: '10:00 AM + 6:00 PM', autoReminder: 'Yes (30 min before)' },
]

const TABS: TabType[] = ['All', 'Completed', 'Missed', 'Pending', 'Overdue']

/* ─────────────────────────── helpers ─────────────────────────── */
function statusStyle(status: CheckInStatus): { bg: string; color: string; border: string } {
  const map: Record<CheckInStatus, { bg: string; color: string; border: string }> = {
    Completed: { bg: 'rgba(16,185,129,0.1)',   color: '#10B981', border: 'rgba(16,185,129,0.25)'  },
    Missed:    { bg: 'rgba(239,68,68,0.1)',    color: '#EF4444', border: 'rgba(239,68,68,0.25)'   },
    Pending:   { bg: 'rgba(212,168,83,0.12)',  color: '#D4A853', border: 'rgba(212,168,83,0.3)'   },
    Late:      { bg: 'rgba(249,115,22,0.1)',   color: '#F97316', border: 'rgba(249,115,22,0.25)'  },
    Overdue:   { bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6', border: 'rgba(139,92,246,0.25)'  },
  }
  return map[status]
}

function StatusBadge({ status }: { status: CheckInStatus }) {
  const s = statusStyle(status)
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 999, padding: '3px 10px',
      fontSize: 11, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {status}
    </span>
  )
}

function Avatar({ initials, color, size = 32 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

/* ─────────────────────────── stat card ─────────────────────────── */
function StatCard({
  icon, label, value, sub, subColor, index,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string; subColor: string; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 26 }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 8,
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{
        fontSize: 30, fontWeight: 800,
        background: 'linear-gradient(135deg, var(--gold) 0%, #e8c46a 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{sub}</div>
    </motion.div>
  )
}

/* ─────────────────────────── page ─────────────────────────── */
export default function CheckInsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('All')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState([
    { value: '8,432', sub: 'On time: 7,891 (93.6%)' },
    { value: '156',   sub: '↑12 from yesterday' },
    { value: '412',   sub: 'Reminders sent today' },
    { value: '34,521', sub: '68.7% of all families' },
  ])

  useEffect(() => {
    const token = localStorage.getItem("gravity_admin_token")
    if (!token) return
    fetch("http://localhost:8000/check-ins/stats", {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(r => r.json())
      .then(d => {
        setStats(prev => prev.map((s, i) => {
          if (i === 0) return { ...s, value: (d.total ?? parseInt(s.value.replace(/,/g, ''))).toLocaleString("en-IN") }
          if (i === 1) return { ...s, value: (d.missed ?? parseInt(s.value.replace(/,/g, ''))).toLocaleString("en-IN") }
          if (i === 2) return { ...s, value: d.completion_rate ? d.completion_rate + "%" : s.value }
          return s
        }))
      })
      .catch(() => {})
  }, [])

  const filtered = CHECK_INS.filter(row => {
    const matchTab = activeTab === 'All' || row.status === activeTab
    const matchSearch = search === '' ||
      row.member.toLowerCase().includes(search.toLowerCase()) ||
      row.family.toLowerCase().includes(search.toLowerCase()) ||
      row.location.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Check-Ins</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Monitor family safety confirmations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, var(--gold) 0%, #c49535 100%)',
            color: '#1a1208', border: 'none', borderRadius: 12,
            padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Create Check-In Rule
        </motion.button>
      </motion.div>

      {/* ── stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard index={0} icon={<CheckSquare size={20} />} label="TODAY"    value={stats[0].value} sub={stats[0].sub} subColor="#10B981" />
        <StatCard index={1} icon={<XCircle size={20} />}     label="MISSED"   value={stats[1].value} sub={stats[1].sub} subColor="#EF4444" />
        <StatCard index={2} icon={<Bell size={20} />}        label="REMINDED" value={stats[2].value} sub={stats[2].sub} subColor="var(--gold)" />
        <StatCard index={3} icon={<Users size={20} />}       label="FAMILIES" value={stats[3].value} sub={stats[3].sub} subColor="var(--text-muted)" />
      </div>

      {/* ── tabs + search ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {/* tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, gap: 2 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '7px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.18s',
                background: activeTab === tab ? 'var(--gold)' : 'transparent',
                color: activeTab === tab ? '#1a1208' : 'var(--text-muted)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* search + filter */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search member, family, city..."
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13,
                color: 'var(--text-primary)', width: 260, outline: 'none',
              }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Filter size={14} /> Filter
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Calendar size={14} /> Today
          </button>
        </div>
      </div>

      {/* ── check-in activity table ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Check-In Activity</span>
            <span style={{ background: 'rgba(var(--gold-rgb),0.12)', color: 'var(--gold)', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
              {filtered.length} records
            </span>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface2)' }}>
                {['Member', 'Family', 'Scheduled', 'Actual', 'Status', 'Location', 'Action'].map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', cursor: 'default' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--gold-rgb),0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')}
                  >
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar initials={row.initials} color={row.avatarColor} size={32} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.member}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: 'var(--text-secondary)' }}>{row.family}</td>
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        {row.scheduled}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, fontFamily: 'monospace', color: row.actual === '--' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: row.actual !== '--' ? 600 : 400 }}>
                      {row.actual}
                    </td>
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
                        {row.location}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <ActionButton status={row.status} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── bottom two-col: missed panel + rules ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>

        {/* ── missed check-ins panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, overflow: 'hidden' }}
        >
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }}
            />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#EF4444' }}>Missed Check-Ins</span>
            <span style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.15)', color: '#EF4444', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>
              {MISSED_ENTRIES.length} urgent
            </span>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MISSED_ENTRIES.map((entry, i) => (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                style={{
                  background: 'var(--bg-surface2)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 14px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={entry.initials} color={entry.color} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{entry.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{entry.family}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>{entry.timeMissed}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Sched: {entry.scheduledFor}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'rgba(75,128,240,0.1)', color: 'var(--primary)', border: '1px solid rgba(75,128,240,0.25)', borderRadius: 9, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <Bell size={12} /> Send Reminder
                  </button>
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 9, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    <CheckCircle size={12} /> Mark Safe
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── check-in rules section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}
        >
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} color="var(--gold)" />
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Check-In Rules</span>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(var(--gold-rgb),0.1)', color: 'var(--gold)', border: '1px solid rgba(var(--gold-rgb),0.25)', borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={13} /> New Rule
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface2)' }}>
                  {['Rule', 'Families Using', 'Frequency', 'Time', 'Auto-Reminder', 'Actions'].map(col => (
                    <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RULES.map((rule, i) => (
                  <motion.tr
                    key={rule.rule}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--gold-rgb),0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')}
                  >
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{rule.rule}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{rule.families}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 9px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{rule.frequency}</span>
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>{rule.time}</td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 600 }}>
                        <CheckCircle size={10} /> {rule.autoReminder}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(75,128,240,0.08)', color: 'var(--primary)', border: '1px solid rgba(75,128,240,0.2)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Edit
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mini summary footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 24 }}>
            {[
              { label: 'Total Rules', value: '4 active' },
              { label: 'Coverage', value: '41,332 families' },
              { label: 'Reminders/day', value: '~2,800 sent' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────────────────────── action button ─────────────────────────── */
function ActionButton({ status }: { status: CheckInStatus }) {
  const map: Record<CheckInStatus, { label: string; bg: string; color: string; border: string }> = {
    Completed: { label: 'View',       bg: 'rgba(75,128,240,0.08)',  color: 'var(--primary)', border: 'rgba(75,128,240,0.2)' },
    Missed:    { label: 'Alert Sent', bg: 'rgba(239,68,68,0.08)',   color: '#EF4444',         border: 'rgba(239,68,68,0.2)' },
    Pending:   { label: 'Remind',     bg: 'rgba(212,168,83,0.1)',   color: 'var(--gold)',     border: 'rgba(212,168,83,0.25)' },
    Late:      { label: 'View',       bg: 'rgba(75,128,240,0.08)',  color: 'var(--primary)', border: 'rgba(75,128,240,0.2)' },
    Overdue:   { label: 'Escalate',   bg: 'rgba(139,92,246,0.1)',   color: '#8B5CF6',         border: 'rgba(139,92,246,0.25)' },
  }
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', dot: '#6B7280' }
  return (
    <button style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 8, padding: '5px 13px',
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
    }}>
      {s.label}
    </button>
  )
}
