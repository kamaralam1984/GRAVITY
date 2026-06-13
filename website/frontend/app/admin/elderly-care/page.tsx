'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Users,
  Bell,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  PhoneCall,
  Shield,
  Activity,
  Pill,
  Eye,
} from 'lucide-react'

/* ─────────────────────── brand color ─────────────────────── */
const AMBER = '#F59E0B'
const AMBER_DIM = 'rgba(245,158,11,0.12)'
const AMBER_BORDER = 'rgba(245,158,11,0.28)'

/* ─────────────────────── types ─────────────────────────── */
interface FallAlert {
  name: string
  age: number
  location: string
  city: string
  time: string
  familyStatus: string
  resolved: boolean
}

interface SeniorRow {
  name: string
  age: number
  family: string
  lastSeen: string
  healthScore: number
  medsToday: string
  medsOk: boolean
  status: 'Active' | 'Resting' | 'Alert'
  color: string
}

interface WellnessCheck {
  time: string
  senior: string
  type: string
  familyAdmin: string
  status: 'Scheduled' | 'In Progress' | 'Done'
}

interface MissedMed {
  senior: string
  age: number
  meds: string
}

interface EmergencyContact {
  senior: string
  contact1Name: string
  contact1Phone: string
  contact2Name: string
  lastContact: string
}

/* ─────────────────────── data ──────────────────────────── */
const FALL_ALERTS: FallAlert[] = [
  { name: 'Kamala Devi',  age: 72, location: 'Home',          city: 'Mumbai',    time: '10:23 AM', familyStatus: 'Family notified',  resolved: false },
  { name: 'Suresh Babu',  age: 68, location: 'Park, HSR Layout', city: 'Bangalore', time: '9:45 AM',  familyStatus: 'Family en route',  resolved: false },
  { name: 'Meena Iyer',   age: 75, location: 'Home',          city: 'Chennai',   time: '9:12 AM',  familyStatus: 'Resolved',         resolved: true  },
]

const SENIORS: SeniorRow[] = [
  { name: 'Kamala Sharma',   age: 72, family: 'Sharma Family',     lastSeen: '10:45 AM', healthScore: 78,  medsToday: '3/3', medsOk: true,  status: 'Active',  color: AMBER },
  { name: 'Suresh Mehta',    age: 68, family: 'Mehta Family',      lastSeen: '11:02 AM', healthScore: 85,  medsToday: '2/2', medsOk: true,  status: 'Active',  color: '#10B981' },
  { name: 'Dadi Gupta',      age: 78, family: 'Gupta Family',      lastSeen: '10:30 AM', healthScore: 71,  medsToday: '2/3', medsOk: false, status: 'Resting', color: AMBER },
  { name: 'Ramesh Iyer',     age: 65, family: 'Iyer Family',       lastSeen: '10:58 AM', healthScore: 90,  medsToday: '1/1', medsOk: true,  status: 'Active',  color: '#4B80F0' },
  { name: 'Vimla Patel',     age: 74, family: 'Patel Family',      lastSeen: '09:55 AM', healthScore: 66,  medsToday: '1/2', medsOk: false, status: 'Alert',   color: '#EF4444' },
  { name: 'Nana Agarwal',    age: 82, family: 'Agarwal Family',    lastSeen: '10:10 AM', healthScore: 58,  medsToday: '3/3', medsOk: true,  status: 'Resting', color: AMBER },
  { name: 'Kamakshi Nair',   age: 69, family: 'Nair Family',       lastSeen: '11:05 AM', healthScore: 88,  medsToday: '2/2', medsOk: true,  status: 'Active',  color: '#10B981' },
  { name: 'Ratan Kapoor',    age: 76, family: 'Kapoor Family',     lastSeen: '10:22 AM', healthScore: 73,  medsToday: '1/2', medsOk: false, status: 'Alert',   color: '#EF4444' },
  { name: 'Gita Reddy',      age: 71, family: 'Reddy Family',      lastSeen: '10:47 AM', healthScore: 82,  medsToday: '2/2', medsOk: true,  status: 'Active',  color: '#4B80F0' },
  { name: 'Bhanu Joshi',     age: 60, family: 'Joshi Family',      lastSeen: '10:59 AM', healthScore: 93,  medsToday: '1/1', medsOk: true,  status: 'Active',  color: '#10B981' },
]

const MED_ADHERENCE_BY_TIME = [
  { label: 'Morning',   pct: 97 },
  { label: 'Afternoon', pct: 91 },
  { label: 'Evening',   pct: 93 },
  { label: 'Night',     pct: 96 },
]

const MISSED_MEDS: MissedMed[] = [
  { senior: 'Dadi Gupta',      age: 78, meds: 'Afternoon BP medication' },
  { senior: 'Vimla Patel',     age: 74, meds: 'Morning insulin, Evening vitamin' },
  { senior: 'Ratan Kapoor',    age: 76, meds: 'Afternoon pain relief' },
  { senior: 'Nana Mehta',      age: 70, meds: 'Morning metformin' },
  { senior: 'Kamla Verma',     age: 67, meds: 'Evening thyroid medication' },
]

const WELLNESS_CHECKS: WellnessCheck[] = [
  { time: '12:00 PM', senior: 'Dadi Gupta',      type: 'Video Call',    familyAdmin: 'Priya Gupta',     status: 'Scheduled'   },
  { time: '12:30 PM', senior: 'Ramesh Iyer',      type: 'Auto Check-in', familyAdmin: 'System',          status: 'Scheduled'   },
  { time: '12:45 PM', senior: 'Kamala Sharma',    type: 'Phone Call',    familyAdmin: 'Neha Sharma',     status: 'Scheduled'   },
  { time: '1:00 PM',  senior: 'Suresh Mehta',     type: 'Auto Check-in', familyAdmin: 'System',          status: 'Scheduled'   },
  { time: '1:15 PM',  senior: 'Vimla Patel',      type: 'Video Call',    familyAdmin: 'Rohan Patel',     status: 'Scheduled'   },
  { time: '1:30 PM',  senior: 'Nana Agarwal',     type: 'Home Visit',    familyAdmin: 'Sunita Agarwal',  status: 'Scheduled'   },
  { time: '2:00 PM',  senior: 'Kamakshi Nair',    type: 'Auto Check-in', familyAdmin: 'System',          status: 'Scheduled'   },
  { time: '2:15 PM',  senior: 'Ratan Kapoor',     type: 'Phone Call',    familyAdmin: 'Anjali Kapoor',   status: 'Scheduled'   },
  { time: '11:30 AM', senior: 'Gita Reddy',       type: 'Auto Check-in', familyAdmin: 'System',          status: 'Done'        },
  { time: '11:00 AM', senior: 'Bhanu Joshi',      type: 'Video Call',    familyAdmin: 'Kavya Joshi',     status: 'Done'        },
  { time: '11:45 AM', senior: 'Ramesh Iyer',      type: 'Auto Check-in', familyAdmin: 'System',          status: 'In Progress' },
  { time: '12:10 PM', senior: 'Kamala Devi',      type: 'Emergency',     familyAdmin: 'Admin',           status: 'In Progress' },
]

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { senior: 'Kamala Sharma',  contact1Name: 'Neha Sharma',    contact1Phone: '+91 98765 11111', contact2Name: 'Raj Sharma',     lastContact: '2 hrs ago'    },
  { senior: 'Suresh Mehta',   contact1Name: 'Ankit Mehta',    contact1Phone: '+91 98765 22222', contact2Name: 'Sunita Mehta',   lastContact: 'Yesterday'    },
  { senior: 'Dadi Gupta',     contact1Name: 'Priya Gupta',    contact1Phone: '+91 98765 33333', contact2Name: 'Vivek Gupta',    lastContact: '45 min ago'   },
  { senior: 'Ramesh Iyer',    contact1Name: 'Meera Iyer',     contact1Phone: '+91 98765 44444', contact2Name: 'Suresh Iyer',    lastContact: '3 hrs ago'    },
  { senior: 'Vimla Patel',    contact1Name: 'Rohan Patel',    contact1Phone: '+91 98765 55555', contact2Name: 'Kavita Patel',   lastContact: '1 hr ago'     },
  { senior: 'Nana Agarwal',   contact1Name: 'Sunita Agarwal', contact1Phone: '+91 98765 66666', contact2Name: 'Nikhil Agarwal', lastContact: '30 min ago'   },
]

/* ─────────────────────── sub-components ─────────────────────── */
function StatusBadge({ status }: { status: 'Active' | 'Resting' | 'Alert' }) {
  const map = {
    Active:  { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', dot: '#10B981' },
    Resting: { bg: AMBER_DIM,               color: AMBER,     dot: AMBER     },
    Alert:   { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', dot: '#EF4444' },
  }
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', dot: '#6B7280' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.color, borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status}
    </span>
  )
}

function CheckBadge({ status }: { status: 'Scheduled' | 'In Progress' | 'Done' }) {
  const map = {
    Scheduled:   { bg: AMBER_DIM, color: AMBER },
    'In Progress': { bg: 'rgba(75,128,240,0.1)', color: '#4B80F0' },
    Done:        { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
  }
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', dot: '#6B7280' }
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>{status}</span>
  )
}

function DonutChart({ pct, color, size = 120, stroke = 14 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const cx = size / 2
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <motion.circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
      />
    </svg>
  )
}

/* ─────────────────────── main page ──────────────────────────── */
export default function ElderlyCare() {
  const [markedSafe, setMarkedSafe] = useState<Set<string>>(new Set())

  const cardVariants = {
    hidden:  { opacity: 0, y: 18 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const } }),
  }

  const STATS = [
    { label: 'Seniors Monitored',     value: '34,521', sub: 'across 28,432 families', icon: Users,       color: AMBER   },
    { label: 'Wellness Checks Today', value: '89,234', sub: '97.8% on time',           icon: CheckCircle, color: '#10B981' },
    { label: 'Missed Check-ins',      value: '234',    sub: 'auto-alerted families',   icon: Bell,        color: '#F97316' },
    { label: 'Fall Alerts',           value: '3',      sub: 'active now',              icon: AlertCircle, color: '#EF4444' },
  ]

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>

      <style>{`
        @keyframes fallPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%       { box-shadow: 0 0 20px 4px rgba(239,68,68,0.2); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.5); opacity: 0.6; }
        }
      `}</style>

      {/* ── header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 5 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Elderly Care</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: AMBER_DIM, border: `1px solid ${AMBER_BORDER}`,
              color: AMBER, fontSize: 12, fontWeight: 700,
              borderRadius: 999, padding: '5px 14px',
            }}>
              <Shield size={13} />
              34,521 seniors tracked
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Specialized monitoring for senior family members</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: `0 8px 28px ${AMBER}44` }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: AMBER,
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Activity size={15} />
          Generate Report
        </motion.button>
      </motion.div>

      {/* ── 4 stats cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(({ label, value, sub, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            style={{
              background: 'var(--bg-surface)',
              border: color === '#EF4444' ? '1px solid rgba(239,68,68,0.35)' : `1px solid ${color === AMBER ? AMBER_BORDER : 'var(--border)'}`,
              borderRadius: 20, padding: '22px 22px 18px',
              animation: color === '#EF4444' ? 'fallPulse 2s ease-in-out infinite' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              {color === '#EF4444' && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', marginTop: 4 }}
                />
              )}
            </div>
            <div style={{
              fontSize: 30, fontWeight: 800, lineHeight: 1,
              background: `linear-gradient(135deg, ${color}, ${color}99)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 5,
            }}>{value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── fall alerts (urgent) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <AlertCircle size={15} color="#EF4444" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Fall Alerts</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FALL_ALERTS.map((alert, i) => (
            <motion.div
              key={alert.name}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 280, damping: 26 }}
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${alert.resolved ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.45)'}`,
                borderRadius: 20, padding: '20px 22px',
                position: 'relative', overflow: 'hidden',
                animation: !alert.resolved ? 'fallPulse 2s ease-in-out infinite' : 'none',
              }}
            >
              {/* accent top line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: alert.resolved
                  ? 'linear-gradient(90deg, #10B981, rgba(16,185,129,0.3))'
                  : 'linear-gradient(90deg, #EF4444, rgba(239,68,68,0.3))',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!alert.resolved && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{alert.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Age {alert.age}</div>
                  </div>
                </div>
                <span style={{
                  background: alert.resolved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: alert.resolved ? '#10B981' : '#EF4444',
                  fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 9px',
                }}>
                  {alert.resolved ? 'Resolved' : 'URGENT'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <MapPin size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{alert.location}, {alert.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Clock size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{alert.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Bell size={12} color={alert.familyStatus === 'Resolved' ? '#10B981' : AMBER} />
                  <span style={{ fontSize: 12, color: alert.familyStatus === 'Resolved' ? '#10B981' : AMBER, fontWeight: 600 }}>
                    {alert.familyStatus}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {!alert.resolved && (
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <PhoneCall size={12} />
                    Emergency Services
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!alert.resolved) {
                      setMarkedSafe(prev => new Set([...prev, alert.name]))
                    }
                  }}
                  style={{
                    flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    border: alert.resolved ? 'none' : `1px solid rgba(239,68,68,0.3)`,
                    background: alert.resolved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                    color: alert.resolved ? '#10B981' : '#EF4444',
                  }}
                >
                  {alert.resolved ? <><Eye size={12} /> View Details</> : <><CheckCircle size={12} /> Mark Safe</>}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── seniors table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 28 }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Senior Members</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Health overview — all monitored seniors</div>
          </div>
          <span style={{ background: AMBER_DIM, border: `1px solid ${AMBER_BORDER}`, color: AMBER, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '4px 12px' }}>
            34,521 total
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Senior', 'Age', 'Family', 'Last Seen', 'Health Score', 'Meds Today', 'Status', 'Actions'].map(col => (
                <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SENIORS.map((row, i) => (
              <motion.tr
                key={row.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.35 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                whileHover={{ backgroundColor: `${AMBER}08` } as never}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {row.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{row.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: AMBER }}>{row.age}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{row.family}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{row.lastSeen}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 50, height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${row.healthScore}%`, height: '100%', background: row.healthScore >= 80 ? '#10B981' : row.healthScore >= 65 ? AMBER : '#EF4444', borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: row.healthScore >= 80 ? '#10B981' : row.healthScore >= 65 ? AMBER : '#EF4444' }}>{row.healthScore}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: row.medsOk ? '#10B981' : '#EF4444' }}>
                    {row.medsOk ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {row.medsToday}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={row.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: AMBER_DIM, border: `1px solid ${AMBER_BORDER}`, borderRadius: 8, color: AMBER, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Eye size={11} />
                    View
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* ── medication adherence ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 26px', marginBottom: 28 }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Medication Adherence</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.4fr', gap: 28, alignItems: 'start' }}>

          {/* donut */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <DonutChart pct={94.2} color="#10B981" size={130} stroke={14} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #10B981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>94.2%</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Adherence Rate</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Across all 34,521 seniors</div>
            </div>
          </div>

          {/* by time */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>By Time of Day</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MED_ADHERENCE_BY_TIME.map((m, i) => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.pct >= 95 ? '#10B981' : AMBER }}>{m.pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 + i * 0.08 }}
                      style={{ height: '100%', background: m.pct >= 95 ? '#10B981' : AMBER, borderRadius: 99 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* most missed */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Pill size={14} color={AMBER} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Most Missed This Week</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MISSED_MEDS.map((m, i) => (
                <motion.div
                  key={m.senior}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.07 }}
                  style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.senior}</span>
                    <span style={{ fontSize: 10, color: AMBER, fontWeight: 700 }}>Age {m.age}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#EF4444', marginTop: 3 }}>{m.meds}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── wellness check schedule ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 28 }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Wellness Check Schedule</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Upcoming and recent wellness checks — today</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Time', 'Senior', 'Check Type', 'Family Admin', 'Status'].map(col => (
                <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WELLNESS_CHECKS.map((row, i) => (
              <motion.tr
                key={`${row.time}-${row.senior}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 + 0.48 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                whileHover={{ backgroundColor: `${AMBER}06` } as never}
              >
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: AMBER, fontFamily: 'monospace' }}>{row.time}</span>
                </td>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.senior}</td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{
                    background: row.type === 'Emergency' ? 'rgba(239,68,68,0.1)' : row.type === 'Home Visit' ? AMBER_DIM : 'rgba(75,128,240,0.08)',
                    color: row.type === 'Emergency' ? '#EF4444' : row.type === 'Home Visit' ? AMBER : 'var(--primary)',
                    fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 9px',
                  }}>{row.type}</span>
                </td>
                <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{row.familyAdmin}</td>
                <td style={{ padding: '11px 16px' }}><CheckBadge status={row.status} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* ── emergency contacts ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}
      >
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <PhoneCall size={16} color={AMBER} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Emergency Contacts</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Primary contacts for each senior</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Senior', 'Primary Contact', 'Phone', 'Secondary', 'Last Contact'].map(col => (
                <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EMERGENCY_CONTACTS.map((row, i) => (
              <motion.tr
                key={row.senior}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.54 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                whileHover={{ backgroundColor: `${AMBER}06` } as never}
              >
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.senior}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{row.contact1Name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{row.contact1Phone}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${AMBER_BORDER}`, background: AMBER_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: AMBER }}
                    >
                      <PhoneCall size={11} />
                    </motion.button>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{row.contact2Name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: row.lastContact.includes('min') ? '#10B981' : row.lastContact === 'Yesterday' ? 'var(--text-muted)' : AMBER }}>
                    {row.lastContact}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
