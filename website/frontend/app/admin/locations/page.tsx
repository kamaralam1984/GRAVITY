'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Battery,
  Navigation,
  Car,
  PersonStanding,
  Minus,
  Plus,
  Layers,
  Filter,
  Bell,
  Shield,
  Clock,
  X,
  Wifi,
  TrendingUp,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
interface ActiveUser {
  id: string
  name: string
  initials: string
  color: string
  location: string
  city: string
  time: string
  battery: number
  motion: 'driving' | 'walking' | 'stationary'
  pinX: number
  pinY: number
}

interface LocationEvent {
  time: string
  label: string
  address: string
  type: 'arrive' | 'depart' | 'stop' | 'sos'
}

/* ─────────────────────────── data ──────────────────────────── */
const ACTIVE_USERS: ActiveUser[] = [
  { id: 'u1',  name: 'Priya Sharma',    initials: 'PS', color: '#4B80F0', location: 'Andheri East',      city: 'Mumbai',    time: '2 min ago',  battery: 45, motion: 'stationary', pinX: 18,  pinY: 64 },
  { id: 'u2',  name: 'Rahul Mehta',     initials: 'RM', color: '#D4A853', location: 'Connaught Place',   city: 'Delhi',     time: '4 min ago',  battery: 67, motion: 'walking',    pinX: 32,  pinY: 22 },
  { id: 'u3',  name: 'Sunita Iyer',     initials: 'SI', color: '#10B981', location: 'Koramangala',       city: 'Bangalore', time: '1 min ago',  battery: 89, motion: 'driving',    pinX: 50,  pinY: 72 },
  { id: 'u4',  name: 'Arjun Kapoor',    initials: 'AK', color: '#8B5CF6', location: 'Bandra West',       city: 'Mumbai',    time: '6 min ago',  battery: 22, motion: 'stationary', pinX: 20,  pinY: 62 },
  { id: 'u5',  name: 'Meera Nair',      initials: 'MN', color: '#EC4899', location: 'Jubilee Hills',     city: 'Hyderabad', time: '9 min ago',  battery: 78, motion: 'driving',    pinX: 44,  pinY: 60 },
  { id: 'u6',  name: 'Karan Gupta',     initials: 'KG', color: '#F59E0B', location: 'Aundh',             city: 'Pune',      time: '3 min ago',  battery: 55, motion: 'walking',    pinX: 30,  pinY: 68 },
  { id: 'u7',  name: 'Anita Reddy',     initials: 'AR', color: '#06B6D4', location: 'Salt Lake',         city: 'Kolkata',   time: '11 min ago', battery: 91, motion: 'stationary', pinX: 72,  pinY: 30 },
  { id: 'u8',  name: 'Vikram Singh',    initials: 'VS', color: '#EF4444', location: 'Vaishali Nagar',    city: 'Jaipur',    time: '5 min ago',  battery: 33, motion: 'driving',    pinX: 28,  pinY: 34 },
  { id: 'u9',  name: 'Deepa Joshi',     initials: 'DJ', color: '#14B8A6', location: 'Adyar',             city: 'Chennai',   time: '8 min ago',  battery: 62, motion: 'walking',    pinX: 52,  pinY: 82 },
  { id: 'u10', name: 'Rohan Patel',     initials: 'RP', color: '#6366F1', location: 'Navrangpura',       city: 'Ahmedabad', time: '2 min ago',  battery: 80, motion: 'driving',    pinX: 22,  pinY: 50 },
  { id: 'u11', name: 'Lakshmi Verma',   initials: 'LV', color: '#84CC16', location: 'Hauz Khas',         city: 'Delhi',     time: '14 min ago', battery: 15, motion: 'stationary', pinX: 35,  pinY: 20 },
  { id: 'u12', name: 'Amit Desai',      initials: 'AD', color: '#FB923C', location: 'Kothrud',           city: 'Pune',      time: '7 min ago',  battery: 74, motion: 'driving',    pinX: 28,  pinY: 70 },
  { id: 'u13', name: 'Neha Chatterjee', initials: 'NC', color: '#A78BFA', location: 'Park Street',       city: 'Kolkata',   time: '3 min ago',  battery: 58, motion: 'walking',    pinX: 74,  pinY: 28 },
  { id: 'u14', name: 'Suresh Rao',      initials: 'SR', color: '#38BDF8', location: 'Malleswaram',       city: 'Bangalore', time: '10 min ago', battery: 42, motion: 'stationary', pinX: 52,  pinY: 75 },
  { id: 'u15', name: 'Kavya Kumar',     initials: 'KK', color: '#F472B6', location: 'Jhotwara',          city: 'Jaipur',    time: '1 min ago',  battery: 95, motion: 'driving',    pinX: 26,  pinY: 36 },
]

const CITY_PINS = [
  { name: 'Mumbai',    x: 19,  y: 63 },
  { name: 'Delhi',     x: 33,  y: 21 },
  { name: 'Bangalore', x: 51,  y: 73 },
  { name: 'Chennai',   x: 53,  y: 83 },
  { name: 'Hyderabad', x: 45,  y: 61 },
  { name: 'Pune',      x: 29,  y: 69 },
  { name: 'Kolkata',   x: 73,  y: 29 },
  { name: 'Jaipur',    x: 27,  y: 35 },
]

const LOCATION_HISTORY: LocationEvent[] = [
  { time: '08:14 AM', label: 'Left Home',       address: '14 Park Street, Mumbai',       type: 'depart' },
  { time: '09:02 AM', label: 'Arrived Office',  address: 'BKC Complex, Andheri East',    type: 'arrive' },
  { time: '01:15 PM', label: 'Left Office',     address: 'BKC Complex, Andheri East',    type: 'depart' },
  { time: '01:38 PM', label: 'Lunch Stop',      address: 'Juhu Chowpatty, Mumbai',       type: 'stop'   },
  { time: '02:45 PM', label: 'Back to Office',  address: 'BKC Complex, Andheri East',    type: 'arrive' },
  { time: '04:12 PM', label: 'Current Location', address: 'Andheri East, Mumbai 400069', type: 'arrive' },
]

const BATTERY_HOURS = [85, 83, 80, 78, 72, 65, 60, 55, 51, 48, 47, 45]

/* ─────────────────────────── helpers ───────────────────────── */
function MotionIcon({ type }: { type: ActiveUser['motion'] }) {
  if (type === 'driving')    return <Car size={12} color="#D4A853" />
  if (type === 'walking')    return <PersonStanding size={12} color="#10B981" />
  return <Minus size={12} color="#6B7280" />
}

function BatteryColor(pct: number): string {
  if (pct <= 20) return '#EF4444'
  if (pct <= 40) return '#F59E0B'
  return '#10B981'
}

function MotionBadge({ type }: { type: ActiveUser['motion'] }) {
  const map = {
    driving:    { label: 'Driving',    bg: 'rgba(212,168,83,0.12)',  color: '#D4A853' },
    walking:    { label: 'Walking',    bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    stationary: { label: 'Stationary', bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF' },
  }
  const s = map[type]
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
      {s.label}
    </span>
  )
}

/* ─────────────────────────── battery mini chart ───────────────── */
function BatteryChart({ hours }: { hours: number[] }) {
  const max = Math.max(...hours)
  const min = Math.min(...hours)
  const H = 48
  const W = 220
  const pts = hours.map((v, i) => {
    const x = (i / (hours.length - 1)) * W
    const y = H - ((v - min) / (max - min + 0.01)) * H
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {hours.map((v, i) => (
        <circle
          key={i}
          cx={(i / (hours.length - 1)) * W}
          cy={H - ((v - min) / (max - min + 0.01)) * H}
          r={i === hours.length - 1 ? 4 : 2}
          fill={i === hours.length - 1 ? 'var(--gold)' : 'rgba(var(--gold-rgb),0.4)'}
        />
      ))}
    </svg>
  )
}

/* ─────────────────────────── selected member panel ──────────────── */
function MemberDetailPanel({ user, onClose }: { user: ActiveUser; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      style={{
        width: 300,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', boxShadow: `0 4px 14px ${user.color}55`, flexShrink: 0 }}>
            {user.initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{user.city}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={13} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Battery', value: `${user.battery}%`, color: BatteryColor(user.battery) },
            { label: 'Motion',  value: user.motion,        color: '#D4A853' },
            { label: 'Last Seen', value: user.time,        color: 'var(--text-primary)' },
            { label: 'Status',  value: 'Online',           color: '#10B981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--bg-surface2)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color, textTransform: 'capitalize' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* location history timeline */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today&apos;s Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {LOCATION_HISTORY.map((event, i) => {
              const dotColor = event.type === 'arrive' ? '#10B981' : event.type === 'depart' ? '#D4A853' : event.type === 'sos' ? '#EF4444' : '#6B7280'
              const isLast = i === LOCATION_HISTORY.length - 1
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', gap: 10, position: 'relative' }}
                >
                  {/* line + dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 4, zIndex: 1, boxShadow: isLast ? `0 0 0 3px ${dotColor}33` : 'none' }} />
                    {!isLast && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 24, marginTop: 2 }} />}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{event.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{event.address}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={9} />
                      {event.time}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* battery chart */}
        <div style={{ background: 'var(--bg-surface2)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Battery Today</div>
          <BatteryChart hours={BATTERY_HOURS} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>8 AM</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Now</span>
          </div>
        </div>

        {/* action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            <Bell size={14} />
            Send Alert
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(var(--gold-rgb),0.3)', background: 'rgba(var(--gold-rgb),0.08)', color: 'var(--gold)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            <Shield size={14} />
            Create Geofence Here
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────── main page ─────────────────────── */
export default function LocationsPage() {
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null)
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street')
  const [zoom, setZoom] = useState(5)

  const cardVariants = {
    hidden:   { opacity: 0, y: 18 },
    visible:  (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
  }

  const STATS = [
    { label: 'Online Now',  value: '98,432',  color: '#10B981', bg: 'rgba(16,185,129,0.08)',  icon: Wifi },
    { label: 'In Motion',   value: '23,456',  color: '#D4A853', bg: 'rgba(212,168,83,0.08)',  icon: Navigation },
    { label: 'At Home',     value: '67,891',  color: '#4B80F0', bg: 'rgba(75,128,240,0.08)',  icon: Shield },
    { label: 'SOS Active',  value: '3',       color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   icon: Bell },
  ]

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Live Locations</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '4px 12px' }}>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', letterSpacing: '0.05em' }}>LIVE</span>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>142,891</span> devices tracked across India
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
          <Filter size={14} />
          Filter View
        </motion.button>
      </motion.div>

      {/* ── stats strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STATS.map(({ label, value, color, bg, icon: Icon }, i) => (
          <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -3, boxShadow: '0 10px 36px rgba(0,0,0,0.1)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}99)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
            {label === 'SOS Active' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', marginLeft: 'auto', flexShrink: 0 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* ── split view ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', height: 'calc(100vh - 340px)', minHeight: 520 }}>

        {/* LEFT: member list */}
        <div style={{ width: 300, flexShrink: 0, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Active Members</div>
            <div style={{ position: 'relative' }}>
              <input
                placeholder="Search members..."
                style={{ width: '100%', padding: '7px 12px 7px 30px', background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
              />
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width={12} height={12} fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {ACTIVE_USERS.map((user, i) => {
              const isSelected = selectedUser?.id === user.id
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedUser(isSelected ? null : user)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    background: isSelected ? 'rgba(var(--gold-rgb),0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--gold)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                  whileHover={{ backgroundColor: 'rgba(var(--gold-rgb),0.05)' }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', boxShadow: isSelected ? `0 4px 12px ${user.color}55` : 'none' }}>
                      {user.initials}
                    </div>
                    <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid var(--bg-surface)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{user.location}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Battery size={10} color={BatteryColor(user.battery)} />
                      <span style={{ fontSize: 10, color: BatteryColor(user.battery), fontWeight: 600 }}>{user.battery}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MotionIcon type={user.motion} />
                      <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{user.time}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CENTER: map */}
        <div style={{ flex: 1, position: 'relative', background: '#0D1B2A', overflow: 'hidden' }}>
          {/* map background grid */}
          <style>{`
            @keyframes radarPulse {
              0%   { transform: scale(0.6); opacity: 0.7; }
              100% { transform: scale(2.2); opacity: 0; }
            }
            @keyframes pinPulse {
              0%, 100% { box-shadow: 0 0 0 0 currentColor; }
              50%       { box-shadow: 0 0 0 8px transparent; }
            }
            @keyframes sosGlow {
              0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
              50%       { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
            }
          `}</style>

          {/* subtle grid lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`v${i}`} x1={`${(i / 15) * 100}%`} y1="0" x2={`${(i / 15) * 100}%`} y2="100%" stroke="#4B80F0" strokeWidth={1} />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i / 11) * 100}%`} x2="100%" y2={`${(i / 11) * 100}%`} stroke="#4B80F0" strokeWidth={1} />
            ))}
          </svg>

          {/* India outline approximation (decorative SVG blob) */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
            <polygon points="25%,10% 75%,10% 85%,40% 80%,55% 65%,70% 55%,90% 45%,90% 30%,60% 15%,40%" fill="#4B80F0" />
          </svg>

          {/* radar pulse (center) */}
          <div style={{ position: 'absolute', left: '48%', top: '52%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
            {[0, 0.5, 1].map(d => (
              <div key={d} style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', border: '1.5px solid rgba(75,128,240,0.4)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: `radarPulse 3s ${d}s ease-out infinite` }} />
            ))}
          </div>

          {/* city labels */}
          {CITY_PINS.map(city => (
            <div
              key={city.name}
              style={{ position: 'absolute', left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em', textAlign: 'center', whiteSpace: 'nowrap', marginBottom: 2 }}>{city.name}</div>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(75,128,240,0.5)', margin: '0 auto' }} />
            </div>
          ))}

          {/* user pins */}
          {ACTIVE_USERS.map((user, i) => {
            const isSelected = selectedUser?.id === user.id
            return (
              <motion.div
                key={user.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 20 }}
                onClick={() => setSelectedUser(isSelected ? null : user)}
                style={{
                  position: 'absolute',
                  left: `${user.pinX}%`,
                  top: `${user.pinY}%`,
                  transform: 'translate(-50%,-50%)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 20 : 10,
                }}
              >
                {/* pulse ring */}
                <div style={{
                  position: 'absolute', inset: -6, borderRadius: '50%',
                  background: `${user.color}22`,
                  animation: 'radarPulse 2.5s ease-out infinite',
                  animationDelay: `${i * 0.3}s`,
                }} />
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: user.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    boxShadow: isSelected
                      ? `0 0 0 3px ${user.color}, 0 0 24px ${user.color}88`
                      : `0 4px 16px ${user.color}55`,
                    position: 'relative',
                    border: isSelected ? `2px solid #fff` : '2px solid transparent',
                  }}
                >
                  {user.initials}
                  {/* pin tail */}
                  <div style={{
                    position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: `8px solid ${user.color}`,
                  }} />
                </motion.div>
                {/* tooltip on select */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{
                        position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                        marginBottom: 12, background: 'rgba(13,27,42,0.95)', border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 10, padding: '8px 12px', whiteSpace: 'nowrap', backdropFilter: 'blur(8px)',
                        pointerEvents: 'none',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{user.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{user.location}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          {/* map mode badge */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.06em' }}>
            {mapMode === 'street' ? 'STREET VIEW' : 'SATELLITE VIEW'} • ZOOM {zoom}x
          </div>

          {/* map controls overlay */}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* zoom */}
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(13,27,42,0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
              <motion.button whileHover={{ background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }}
                onClick={() => setZoom(z => Math.min(z + 1, 20))}
                style={{ width: 34, height: 34, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Plus size={14} />
              </motion.button>
              <motion.button whileHover={{ background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }}
                onClick={() => setZoom(z => Math.max(z - 1, 1))}
                style={{ width: 34, height: 34, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={14} />
              </motion.button>
            </div>

            {/* satellite/street toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setMapMode(m => m === 'street' ? 'satellite' : 'street')}
              style={{ width: 34, height: 34, background: 'rgba(13,27,42,0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#D4A853', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <Layers size={14} />
            </motion.button>

            {/* filter */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ width: 34, height: 34, background: 'rgba(13,27,42,0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <Filter size={14} />
            </motion.button>
          </div>

          {/* top stats overlay */}
          <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
            {[
              { label: 'Driving',    count: ACTIVE_USERS.filter(u => u.motion === 'driving').length,    color: '#D4A853' },
              { label: 'Walking',    count: ACTIVE_USERS.filter(u => u.motion === 'walking').length,    color: '#10B981' },
              { label: 'Stationary', count: ACTIVE_USERS.filter(u => u.motion === 'stationary').length, color: '#6B7280' },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ background: 'rgba(13,27,42,0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 10px', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{count} {label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: selected member detail */}
        <AnimatePresence>
          {selectedUser && (
            <MemberDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── bottom trend ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ marginTop: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <TrendingUp size={18} color="var(--gold)" />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Peak tracking activity at <strong style={{ color: 'var(--text-primary)' }}>9:00 AM</strong> and <strong style={{ color: 'var(--text-primary)' }}>6:30 PM</strong> daily</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last refresh: <strong style={{ color: 'var(--safe)' }}>12 sec ago</strong></span>
        </div>
      </motion.div>
    </div>
  )
}
