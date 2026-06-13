'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/api'
import {
  AlertTriangle,
  MapPin,
  Battery,
  Phone,
  Eye,
  CheckCircle,
  Clock,
  Bell,
  Shield,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  MoreHorizontal,
  Plus,
  Zap,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
interface ActiveAlert {
  id: string
  member: string
  initials: string
  location: string
  city: string
  activeFor: string
  family: string
  battery: number
  color: string
  phone: string
}

interface HistoryRow {
  alertId: string
  member: string
  location: string
  triggerTime: string
  resolveTime: string
  duration: string
  resolvedBy: string
  status: 'Resolved'
}

interface EscalationContact {
  name: string
  role: string
  phone: string
  color: string
}

/* ─────────────────────────── data ──────────────────────────── */
const ACTIVE_ALERTS: ActiveAlert[] = [
  { id: 'SOS-001', member: 'Priya Sharma',  initials: 'PS', location: 'Andheri East', city: 'Mumbai',    activeFor: '8 min',  family: 'Sharma Family', battery: 45, color: '#4B80F0', phone: '+91 98765 43210' },
  { id: 'SOS-002', member: 'Rahul Mehta',   initials: 'RM', location: 'Connaught Place', city: 'Delhi', activeFor: '23 min', family: 'Mehta Family',  battery: 67, color: '#D4A853', phone: '+91 87654 32109' },
  { id: 'SOS-003', member: 'Sunita Iyer',   initials: 'SI', location: 'Koramangala', city: 'Bangalore', activeFor: '2 min',  family: 'Iyer Family',   battery: 89, color: '#10B981', phone: '+91 76543 21098' },
]

const HISTORY: HistoryRow[] = [
  { alertId: 'SOS-084', member: 'Kavya Kumar',     location: 'Vaishali Nagar, Jaipur',      triggerTime: 'Jun 12, 9:14 AM',  resolveTime: 'Jun 12, 9:18 AM',  duration: '4 min',  resolvedBy: 'Admin',  status: 'Resolved' },
  { alertId: 'SOS-083', member: 'Meera Nair',      location: 'Jubilee Hills, Hyderabad',    triggerTime: 'Jun 12, 8:02 AM',  resolveTime: 'Jun 12, 8:05 AM',  duration: '3 min',  resolvedBy: 'System', status: 'Resolved' },
  { alertId: 'SOS-082', member: 'Arjun Kapoor',    location: 'Bandra West, Mumbai',         triggerTime: 'Jun 11, 11:47 PM', resolveTime: 'Jun 11, 11:52 PM', duration: '5 min',  resolvedBy: 'Admin',  status: 'Resolved' },
  { alertId: 'SOS-081', member: 'Deepa Joshi',     location: 'Adyar, Chennai',              triggerTime: 'Jun 11, 8:33 PM',  resolveTime: 'Jun 11, 8:38 PM',  duration: '5 min',  resolvedBy: 'Family', status: 'Resolved' },
  { alertId: 'SOS-080', member: 'Vikram Singh',    location: 'Salt Lake, Kolkata',          triggerTime: 'Jun 11, 6:15 PM',  resolveTime: 'Jun 11, 6:18 PM',  duration: '3 min',  resolvedBy: 'Admin',  status: 'Resolved' },
  { alertId: 'SOS-079', member: 'Anita Reddy',     location: 'Koramangala, Bangalore',      triggerTime: 'Jun 11, 4:20 PM',  resolveTime: 'Jun 11, 4:25 PM',  duration: '5 min',  resolvedBy: 'System', status: 'Resolved' },
  { alertId: 'SOS-078', member: 'Karan Gupta',     location: 'Aundh, Pune',                 triggerTime: 'Jun 11, 2:09 PM',  resolveTime: 'Jun 11, 2:16 PM',  duration: '7 min',  resolvedBy: 'Admin',  status: 'Resolved' },
  { alertId: 'SOS-077', member: 'Lakshmi Verma',   location: 'Hauz Khas, Delhi',            triggerTime: 'Jun 11, 12:55 PM', resolveTime: 'Jun 11, 1:01 PM',  duration: '6 min',  resolvedBy: 'Family', status: 'Resolved' },
  { alertId: 'SOS-076', member: 'Rohan Patel',     location: 'Navrangpura, Ahmedabad',      triggerTime: 'Jun 11, 10:44 AM', resolveTime: 'Jun 11, 10:47 AM', duration: '3 min',  resolvedBy: 'System', status: 'Resolved' },
  { alertId: 'SOS-075', member: 'Neha Chatterjee', location: 'Park Street, Kolkata',        triggerTime: 'Jun 11, 9:28 AM',  resolveTime: 'Jun 11, 9:33 AM',  duration: '5 min',  resolvedBy: 'Admin',  status: 'Resolved' },
]

const ESCALATION_CONTACTS: EscalationContact[] = [
  { name: 'Ravi Sharma',   role: 'Emergency Coordinator', phone: '+91 98001 11111', color: '#4B80F0' },
  { name: 'Priti Menon',   role: 'Regional Lead — South', phone: '+91 98002 22222', color: '#10B981' },
  { name: 'Aryan Bose',    role: 'Regional Lead — North', phone: '+91 98003 33333', color: '#D4A853' },
  { name: 'Swati Kulkarni', role: 'On-Call Support',      phone: '+91 98004 44444', color: '#8B5CF6' },
]

/* Timeline points for today */
const TIMELINE_EVENTS = [
  { time: '9:14',  label: 'SOS-084', color: '#D4A853' },
  { time: '8:02',  label: 'SOS-083', color: '#10B981' },
  { time: '11:47', label: 'SOS-082', color: '#D4A853', yesterday: true },
  { time: '8:33',  label: 'SOS-081', color: '#D4A853', yesterday: true },
  { time: '6:15',  label: 'SOS-080', color: '#10B981', yesterday: true },
]

/* ─────────────────────────── helpers ─────────────────────────── */
function ResolvedBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      <CheckCircle size={10} />
      Resolved
    </span>
  )
}

function ResolvedByBadge({ by }: { by: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    Admin:  { color: '#4B80F0', bg: 'rgba(75,128,240,0.1)' },
    System: { color: '#D4A853', bg: 'rgba(212,168,83,0.1)' },
    Family: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  }
  const s = map[by] || map['Admin']
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>{by}</span>
  )
}

/* ─────────────────────────── active alert card ─────────────── */
function ActiveAlertCard({ alert, index, onResolve }: { alert: ActiveAlert; index: number; onResolve: (id: string) => void }) {
  const urgency = parseInt(alert.activeFor) > 10 ? 'high' : 'medium'
  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 280, damping: 26 }}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid rgba(239,68,68,${urgency === 'high' ? '0.5' : '0.35'})`,
        borderRadius: 20,
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes sosCardGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%       { box-shadow: 0 0 28px 4px rgba(239,68,68,0.22); }
        }
        @keyframes sosBadgePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.12); opacity: 0.8; }
        }
      `}</style>

      {/* pulsing glow */}
      <motion.div
        animate={{ opacity: [0, 0.25, 0] }}
        transition={{ repeat: Infinity, duration: urgency === 'high' ? 1.5 : 2.5 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.05)', pointerEvents: 'none', borderRadius: 20 }}
      />

      {/* red side bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: urgency === 'high' ? '#EF4444' : 'rgba(239,68,68,0.7)', borderRadius: '20px 0 0 20px' }} />

      <div style={{ paddingLeft: 4 }}>
        {/* top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* SOS badge */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{
                background: '#EF4444',
                color: '#fff',
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: '0.08em',
                borderRadius: 8,
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={12} />
              SOS
            </motion.div>

            {/* avatar */}
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: alert.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: `0 4px 16px ${alert.color}55`, flexShrink: 0 }}>
              {alert.initials}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{alert.member}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{alert.family}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>Active {alert.activeFor}</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', marginLeft: 4 }}>{alert.id}</span>
          </div>
        </div>

        {/* info row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
          {[
            { icon: MapPin,   label: 'Location',  value: `${alert.location}, ${alert.city}`, color: '#EF4444' },
            { icon: Battery,  label: 'Battery',   value: `${alert.battery}%`,                 color: alert.battery < 30 ? '#EF4444' : alert.battery < 50 ? '#F59E0B' : '#10B981' },
            { icon: Phone,    label: 'Phone',     value: alert.phone,                          color: 'var(--primary)' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ background: 'var(--bg-surface2)', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Icon size={11} color={color} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onResolve(alert.id)}
            style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, letterSpacing: '0.02em' }}
          >
            <CheckCircle size={15} />
            RESOLVE ALERT
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            <Eye size={14} />
            View Live Location
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────── main page ─────────────────────── */
export default function AlertsPage() {
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>(ACTIVE_ALERTS)
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [settingsTab, setSettingsTab] = useState<'thresholds' | 'rules' | 'contacts'>('thresholds')

  useEffect(() => {
    adminApi.sosAlerts()
      .then(d => {
        if (d.alerts) {
          const active = d.alerts.filter((a: any) => a.status === "active")
          const resolved = d.alerts.filter((a: any) => a.status !== "active")
          if (active.length > 0) {
            setActiveAlerts(active.map((a: any) => ({
              id: `SOS-${String(a.id).padStart(3,"0")}`,
              member: a.user_name ?? "Unknown",
              initials: (a.user_name ?? "UN").split(" ").map((w: string) => w[0]).slice(0, 2).join(""),
              family: a.family_name ?? "Unknown",
              location: a.place_name ?? "Unknown location",
              city: "",
              activeFor: a.triggered_at ? `${Math.round((Date.now() - new Date(a.triggered_at).getTime()) / 60000)} min` : "",
              time: a.triggered_at ? new Date(a.triggered_at).toLocaleTimeString("en-IN") : "",
              battery: 45,
              status: "active",
              color: '#4B80F0',
              phone: a.phone ?? "",
            })))
          }
        }
      })
      .catch(() => {})
  }, [])

  const cardVariants = {
    hidden:  { opacity: 0, y: 18 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
  }

  function handleResolve(id: string) {
    setResolvedId(id)
    const numericId = parseInt(id.replace('SOS-', ''), 10)
    adminApi.resolveSOS(numericId).catch(() => {})
    setTimeout(() => {
      setActiveAlerts(prev => prev.filter(a => a.id !== id))
      setResolvedId(null)
    }, 800)
  }

  const STATS = [
    { label: 'Total SOS This Month', value: '89',    color: '#EF4444', icon: AlertTriangle },
    { label: 'Avg Resolution Time',  value: '4.2m',  color: '#D4A853', icon: Clock },
    { label: 'Auto-Resolved',        value: '12',    color: '#10B981', icon: Zap },
    { label: 'Manually Resolved',    value: '77',    color: '#4B80F0', icon: Shield },
  ]

  const timelineHours = [
    { hour: '00:00', count: 0 }, { hour: '02:00', count: 1 }, { hour: '04:00', count: 0 },
    { hour: '06:00', count: 0 }, { hour: '08:00', count: 2 }, { hour: '09:14', count: 1, active: true },
  ]

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>

      <style>{`
        @keyframes sosRingOut {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      {/* ── header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Emergency Alerts</h1>
            {/* live badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '4px 12px' }}>
              <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', letterSpacing: '0.05em' }}>LIVE</span>
            </div>
            {/* active alert count */}
            <AnimatePresence mode="wait">
              {activeAlerts.length > 0 && (
                <motion.div
                  key={activeAlerts.length}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 999, padding: '4px 14px' }}>
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em' }}>{activeAlerts.length} ACTIVE</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Monitor and respond to SOS emergencies in real-time</p>
        </div>
      </motion.div>

      {/* ── ACTIVE ALERT CARDS ── */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ marginBottom: 28 }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={14} />
              Requires Immediate Attention
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              <AnimatePresence>
                {activeAlerts.map((alert, i) => (
                  <AnimatePresence key={alert.id}>
                    {resolvedId !== alert.id && (
                      <motion.div exit={{ opacity: 0, scale: 0.9, y: -10 }} transition={{ duration: 0.4 }}>
                        <ActiveAlertCard alert={alert} index={i} onResolve={handleResolve} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STATS.map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}99)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── timeline ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 28px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Today&apos;s SOS Timeline
        </div>
        <div style={{ position: 'relative', paddingBottom: 20 }}>
          {/* horizontal line */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 20, height: 2, background: 'var(--border)', borderRadius: 99 }} />
          {/* fill portion */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '40%' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            style={{ position: 'absolute', left: 0, top: 20, height: 2, background: 'linear-gradient(90deg, var(--sos), rgba(239,68,68,0.3))', borderRadius: 99 }}
          />

          {/* events */}
          <div style={{ display: 'flex', gap: 0 }}>
            {['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'Now'].map((hr, i, arr) => {
              const isActive = hr === '09:00'
              const hasDot = hr === '09:00' || hr === '06:00'
              return (
                <div key={hr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: i === arr.length - 1 ? 'flex-end' : 'center', position: 'relative' }}>
                  {hasDot && (
                    <div style={{ position: 'relative', marginBottom: 6 }}>
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                          transition={{ repeat: Infinity, duration: 1.8 }}
                          style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: '#EF4444' }}
                        />
                      )}
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: isActive ? '#EF4444' : '#D4A853', border: '2px solid var(--bg-surface)', position: 'relative', zIndex: 1 }} />
                      {isActive && (
                        <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                          3 ACTIVE
                        </div>
                      )}
                    </div>
                  )}
                  {!hasDot && <div style={{ height: 18 }} />}
                  <span style={{ fontSize: 9, color: isActive ? '#EF4444' : 'var(--text-muted)', fontWeight: isActive ? 700 : 400, marginTop: 6, whiteSpace: 'nowrap' }}>{hr}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
          {[
            { color: '#EF4444', label: 'Active alert' },
            { color: '#D4A853', label: 'Resolved today' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── SOS history table ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>SOS History</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Last 30 days — all resolved</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Alert ID', 'Member', 'Location', 'Triggered', 'Resolved', 'Duration', 'Resolved By', 'Status', 'Actions'].map(col => (
                <th key={col} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((row, i) => (
              <motion.tr
                key={row.alertId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.45 }}
                style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent' }}
                whileHover={{ backgroundColor: 'rgba(239,68,68,0.03)' }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '2px 8px' }}>{row.alertId}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.member}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{row.location}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.triggerTime}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.resolveTime}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: parseInt(row.duration) > 5 ? '#EF4444' : '#10B981' }}>{row.duration}</span>
                </td>
                <td style={{ padding: '12px 16px' }}><ResolvedByBadge by={row.resolvedBy} /></td>
                <td style={{ padding: '12px 16px' }}><ResolvedBadge /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}>
                      <Eye size={13} />
                    </motion.button>
                    <div style={{ position: 'relative' }}>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setOpenMenu(openMenu === row.alertId ? null : row.alertId)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <MoreHorizontal size={13} />
                      </motion.button>
                      <AnimatePresence>
                        {openMenu === row.alertId && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            style={{ position: 'absolute', right: 0, top: 34, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 6, zIndex: 100, minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                            {['View Full Timeline', 'Export Report', 'View Member Profile'].map(action => (
                              <div key={action}
                                style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
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

        {/* pagination */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface2)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing <strong style={{ color: 'var(--text-primary)' }}>1–10</strong> of <strong style={{ color: 'var(--text-primary)' }}>89</strong> alerts this month</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={15} />
            </motion.button>
            {[1, 2, 3].map(p => (
              <motion.button key={p} whileHover={{ scale: 1.05 }}
                style={{ width: 32, height: 32, borderRadius: 8, border: p === 1 ? 'none' : '1px solid var(--border)', background: p === 1 ? '#EF4444' : 'var(--bg-surface)', color: p === 1 ? '#fff' : 'var(--text-secondary)', fontWeight: p === 1 ? 700 : 400, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p}
              </motion.button>
            ))}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}>
              <ChevronRight size={15} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── settings panel ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={16} color="var(--text-secondary)" />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Alert Settings</div>
        </div>

        {/* tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {(['thresholds', 'rules', 'contacts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSettingsTab(tab)}
              style={{
                padding: '12px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: settingsTab === tab ? 700 : 500,
                color: settingsTab === tab ? 'var(--gold)' : 'var(--text-secondary)',
                borderBottom: settingsTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: -1, textTransform: 'capitalize', letterSpacing: '0.01em',
                transition: 'all 0.15s',
              }}
            >
              {tab === 'thresholds' ? 'SOS Thresholds' : tab === 'rules' ? 'Auto-Notification Rules' : 'Escalation Contacts'}
            </button>
          ))}
        </div>

        <div style={{ padding: '22px 24px' }}>
          <AnimatePresence mode="wait">
            {settingsTab === 'thresholds' && (
              <motion.div key="thresholds" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {[
                    { label: 'SOS Hold Duration', value: '3 seconds', desc: 'Time user must hold SOS button to trigger alert' },
                    { label: 'Auto-resolve Timeout', value: '30 minutes', desc: 'Auto-resolve if no response after this time' },
                    { label: 'Battery Alert Threshold', value: '15%', desc: 'Alert admin when member battery drops below this' },
                    { label: 'GPS Accuracy Required', value: '50 meters', desc: 'Minimum GPS accuracy before SOS is accepted' },
                  ].map(({ label, value, desc }) => (
                    <div key={label} style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{desc}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, var(--gold), #C9913A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</span>
                        <motion.button whileHover={{ scale: 1.05 }}
                          style={{ padding: '5px 12px', background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.25)', borderRadius: 8, color: 'var(--gold)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          Edit
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {settingsTab === 'rules' && (
              <motion.div key="rules" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { rule: 'Notify family members immediately on SOS trigger', enabled: true },
                    { rule: 'Send SMS to emergency contacts within 60 seconds', enabled: true },
                    { rule: 'Auto-escalate to regional coordinator after 10 min unresolved', enabled: true },
                    { rule: 'Notify admin panel with sound alert on new SOS', enabled: true },
                    { rule: 'Send post-resolve report to family admin', enabled: false },
                    { rule: 'Auto-call nearest emergency contact if unresolved > 15 min', enabled: false },
                  ].map(({ rule, enabled }, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Bell size={14} color={enabled ? '#10B981' : 'var(--text-muted)'} />
                        <span style={{ fontSize: 13, color: enabled ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>{rule}</span>
                      </div>
                      <div style={{ width: 40, height: 22, borderRadius: 999, background: enabled ? '#10B981' : 'var(--border)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}>
                        <div style={{ position: 'absolute', top: 3, left: enabled ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {settingsTab === 'contacts' && (
              <motion.div key="contacts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {ESCALATION_CONTACTS.map((contact, i) => (
                    <motion.div key={contact.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: contact.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {contact.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{contact.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{contact.role}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{contact.phone}</span>
                        <motion.button whileHover={{ scale: 1.08 }}
                          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}>
                          <Phone size={13} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.08 }}
                          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <X size={13} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'rgba(var(--gold-rgb),0.1)', border: '1px solid rgba(var(--gold-rgb),0.25)', borderRadius: 10, color: 'var(--gold)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <Plus size={14} />
                  Add Escalation Contact
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
