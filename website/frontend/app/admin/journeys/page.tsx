'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { journeysApi } from '@/lib/api'
import {
  Route,
  Car,
  Navigation,
  MapPin,
  Clock,
  Users,
  Play,
  Square,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Fuel,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
type JourneyStatus = 'En Route' | 'Arrived' | 'Delayed' | 'SOS'

interface JourneyRow {
  id: string
  member: string
  initials: string
  avatarColor: string
  from: string
  to: string
  started: string
  eta: string
  distance: string
  speed: number
  passengers: number
  status: JourneyStatus
}

/* ─────────────────────────── data ──────────────────────────── */
const ACTIVE_JOURNEYS: JourneyRow[] = [
  { id: 'J-001', member: 'Rahul Sharma',   initials: 'RS', avatarColor: '#4B80F0', from: 'Home (Andheri)',      to: 'Office (BKC)',       started: '8:45 AM',  eta: '9:20 AM',  distance: '12.4 km', speed: 45, passengers: 1, status: 'En Route' },
  { id: 'J-002', member: 'Priya Mehta',    initials: 'PM', avatarColor: '#10B981', from: 'School',              to: 'Home (Vasant)',       started: '3:15 PM',  eta: '3:45 PM',  distance: '8.2 km',  speed: 35, passengers: 3, status: 'En Route' },
  { id: 'J-003', member: 'Arjun Iyer',     initials: 'AI', avatarColor: '#D4A853', from: 'Phoenix Mall',        to: 'Home (Koramangala)', started: '6:30 PM',  eta: '7:00 PM',  distance: '15.1 km', speed: 52, passengers: 2, status: 'En Route' },
  { id: 'J-004', member: 'Diya Singh',     initials: 'DS', avatarColor: '#EC4899', from: 'Office (Sector 62)',  to: 'Home (Indirapuram)', started: '6:15 PM',  eta: '7:10 PM',  distance: '18.3 km', speed: 28, passengers: 1, status: 'Delayed'  },
  { id: 'J-005', member: 'Kavya Reddy',    initials: 'KR', avatarColor: '#8B5CF6', from: 'Airport (RGIA)',      to: 'Home (Banjara)',      started: '5:00 PM',  eta: '5:50 PM',  distance: '22.0 km', speed: 67, passengers: 2, status: 'En Route' },
  { id: 'J-006', member: 'Rohan Patel',    initials: 'RP', avatarColor: '#F97316', from: 'Gym (Navrangpura)',   to: 'Home',               started: '7:30 AM',  eta: '7:48 AM',  distance: '4.5 km',  speed: 0,  passengers: 1, status: 'Arrived'  },
  { id: 'J-007', member: 'Sunita Kapoor',  initials: 'SK', avatarColor: '#06B6D4', from: 'Home (Bandra)',       to: 'Hospital (Lilavati)',started: '9:00 AM',  eta: '9:25 AM',  distance: '6.8 km',  speed: 42, passengers: 2, status: 'En Route' },
  { id: 'J-008', member: 'Ananya Joshi',   initials: 'AJ', avatarColor: '#EF4444', from: 'College (BITS)',      to: 'Home (Aundh)',        started: '4:45 PM',  eta: '--',        distance: '11.2 km', speed: 0,  passengers: 1, status: 'SOS'      },
  { id: 'J-009', member: 'Vikram Nair',    initials: 'VN', avatarColor: '#14B8A6', from: 'Station (Churchgate)',to: 'Home (Dadar)',        started: '8:00 PM',  eta: '8:30 PM',  distance: '7.9 km',  speed: 38, passengers: 1, status: 'En Route' },
  { id: 'J-010', member: 'Meena Verma',    initials: 'MV', avatarColor: '#6366F1', from: 'Market (Sarojini)',   to: 'Home (RK Puram)',     started: '5:30 PM',  eta: '5:55 PM',  distance: '9.3 km',  speed: 55, passengers: 1, status: 'En Route' },
]

/* hourly journey counts 6am -> 10pm */
const HOURLY_DATA = [
  { hour: '6am', count: 312 },
  { hour: '7am', count: 890 },
  { hour: '8am', count: 2340 },
  { hour: '9am', count: 3120 },
  { hour: '10am', count: 1890 },
  { hour: '11am', count: 1200 },
  { hour: '12pm', count: 1450 },
  { hour: '1pm', count: 980 },
  { hour: '2pm', count: 890 },
  { hour: '3pm', count: 1560 },
  { hour: '4pm', count: 2800 },
  { hour: '5pm', count: 3450 },
  { hour: '6pm', count: 3890 },
  { hour: '7pm', count: 2670 },
  { hour: '8pm', count: 1540 },
  { hour: '9pm', count: 720 },
  { hour: '10pm', count: 340 },
]

const TOP_CITIES = [
  { city: 'Mumbai',    count: '1,23,432', pct: 92 },
  { city: 'Delhi NCR', count: '98,231',   pct: 74 },
  { city: 'Bangalore', count: '87,654',   pct: 66 },
  { city: 'Hyderabad', count: '54,321',   pct: 41 },
  { city: 'Chennai',   count: '43,210',   pct: 33 },
  { city: 'Pune',      count: '38,976',   pct: 29 },
]

const VEHICLE_DATA = [
  { type: 'Car',   pct: 67, color: '#4B80F0' },
  { type: 'Bike',  pct: 18, color: '#D4A853' },
  { type: 'Walk',  pct: 12, color: '#10B981' },
  { type: 'Auto',  pct: 3,  color: '#8B5CF6' },
]

/* ─────────────────────────── helpers ─────────────────────────── */
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

function speedColor(speed: number): string {
  if (speed === 0) return '#6B7280'
  if (speed < 60) return '#10B981'
  if (speed <= 80) return '#F59E0B'
  return '#EF4444'
}

function StatusBadge({ status }: { status: JourneyStatus }) {
  const map: Record<JourneyStatus, { bg: string; color: string; border: string; pulse: boolean }> = {
    'En Route': { bg: 'rgba(75,128,240,0.1)',   color: '#4B80F0', border: 'rgba(75,128,240,0.25)',  pulse: false },
    'Arrived':  { bg: 'rgba(16,185,129,0.1)',   color: '#10B981', border: 'rgba(16,185,129,0.25)', pulse: false },
    'Delayed':  { bg: 'rgba(249,115,22,0.1)',   color: '#F97316', border: 'rgba(249,115,22,0.25)', pulse: false },
    'SOS':      { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444', border: 'rgba(239,68,68,0.4)',   pulse: true  },
  }
  const s = map[status] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', dot: '#6B7280' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 999, padding: '3px 10px',
      fontSize: 11, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {s.pulse ? (
        <motion.span
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }}
        />
      ) : (
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
      )}
      {status}
    </span>
  )
}

/* ─────────────────────────── stat card ─────────────────────────── */
function StatCard({
  icon, label, value, sub, subColor, index, pulse,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string; subColor: string; index: number; pulse?: boolean
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
        {pulse ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}
            />
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>LIVE</span>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        )}
      </div>
      <div style={{
        fontSize: 30, fontWeight: 800,
        background: 'linear-gradient(135deg, var(--gold) 0%, #e8c46a 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {value}
      </div>
      {pulse && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>}
      <div style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{sub}</div>
    </motion.div>
  )
}

/* ─────────────────────────── hourly chart ─────────────────────────── */
function HourlyChart() {
  const max = Math.max(...HOURLY_DATA.map(d => d.count))
  const peakHours = ['8am', '9am', '5pm', '6pm', '7pm']

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, paddingBottom: 24, position: 'relative' }}>
      {HOURLY_DATA.map((d, i) => {
        const isPeak = peakHours.includes(d.hour)
        const barH = Math.max((d.count / max) * 88, 4)
        return (
          <div key={d.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: barH, opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
              style={{
                width: '100%',
                background: isPeak
                  ? 'linear-gradient(180deg, var(--gold) 0%, rgba(212,168,83,0.5) 100%)'
                  : 'rgba(var(--gold-rgb),0.2)',
                borderRadius: '4px 4px 2px 2px',
                flexShrink: 0,
              }}
            />
            <span style={{ position: 'absolute', bottom: 0, fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {d.hour}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────── donut chart ─────────────────────────── */
function DonutChart() {
  const size = 100
  const r = 36
  const cx = 50, cy = 50
  const circumference = 2 * Math.PI * r

  let cumulative = 0
  const segments = VEHICLE_DATA.map(d => {
    const dash = (d.pct / 100) * circumference
    const gap = circumference - dash
    const offset = circumference - (cumulative / 100) * circumference
    cumulative += d.pct
    return { ...d, dash, gap, offset }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        {/* background track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
        {segments.map((seg, i) => (
          <motion.circle
            key={seg.type}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={14}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="butt"
            transform="rotate(-90 50 50)"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${seg.dash} ${seg.gap}` }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
          />
        ))}
        <text x="50" y="46" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="800">67%</text>
        <text x="50" y="58" textAnchor="middle" fill="var(--text-muted)" fontSize="7">Car</text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {VEHICLE_DATA.map(v => (
          <div key={v.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: v.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, width: 32 }}>{v.type}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{v.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────── heatmap / city grid ─────────────────────────── */
function CityHeatmap() {
  const routes = [
    { x1: '10%', y1: '30%', x2: '55%', y2: '45%', color: '#4B80F0', opacity: 0.8, strokeWidth: 2.5 },
    { x1: '55%', y1: '45%', x2: '80%', y2: '60%', color: '#4B80F0', opacity: 0.6, strokeWidth: 1.5 },
    { x1: '20%', y1: '70%', x2: '55%', y2: '45%', color: '#10B981', opacity: 0.7, strokeWidth: 2 },
    { x1: '55%', y1: '45%', x2: '70%', y2: '20%', color: '#D4A853', opacity: 0.75, strokeWidth: 2 },
    { x1: '15%', y1: '50%', x2: '45%', y2: '65%', color: '#8B5CF6', opacity: 0.6, strokeWidth: 1.5 },
    { x1: '45%', y1: '65%', x2: '75%', y2: '80%', color: '#8B5CF6', opacity: 0.5, strokeWidth: 1 },
    { x1: '30%', y1: '20%', x2: '55%', y2: '45%', color: '#EC4899', opacity: 0.65, strokeWidth: 1.8 },
    { x1: '60%', y1: '35%', x2: '85%', y2: '25%', color: '#F97316', opacity: 0.55, strokeWidth: 1.2 },
    { x1: '5%',  y1: '80%', x2: '35%', y2: '55%', color: '#10B981', opacity: 0.5, strokeWidth: 1.5 },
    { x1: '65%', y1: '70%', x2: '90%', y2: '50%', color: '#4B80F0', opacity: 0.5, strokeWidth: 1 },
  ]

  const nodes = [
    { x: '10%', y: '30%', color: '#4B80F0', size: 8,  label: 'Andheri' },
    { x: '55%', y: '45%', color: '#D4A853', size: 14, label: 'BKC Hub' },
    { x: '20%', y: '70%', color: '#10B981', size: 7,  label: 'Bandra'  },
    { x: '80%', y: '60%', color: '#4B80F0', size: 6,  label: 'Vashi'   },
    { x: '70%', y: '20%', color: '#D4A853', size: 8,  label: 'Thane'   },
    { x: '30%', y: '20%', color: '#EC4899', size: 6,  label: 'Juhu'    },
    { x: '75%', y: '80%', color: '#8B5CF6', size: 6,  label: 'Navi M.' },
  ]

  return (
    <div style={{ position: 'relative', height: 220, background: 'rgba(0,0,0,0.3)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* grid lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
        {[...Array(8)].map((_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * 11}%`} y1="0" x2={`${(i + 1) * 11}%`} y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {[...Array(6)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i + 1) * 14}%`} x2="100%" y2={`${(i + 1) * 14}%`} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}

        {/* animated route lines */}
        {routes.map((rt, i) => (
          <motion.line
            key={i}
            x1={rt.x1} y1={rt.y1} x2={rt.x2} y2={rt.y2}
            stroke={rt.color}
            strokeWidth={rt.strokeWidth}
            strokeOpacity={rt.opacity}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: rt.opacity }}
            transition={{ delay: 0.4 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.label}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 + i * 0.07, type: 'spring', stiffness: 300 }}
          style={{
            position: 'absolute',
            left: node.x, top: node.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.5 + i * 0.3 }}
              style={{
                position: 'absolute', inset: -node.size / 2,
                borderRadius: '50%', background: node.color,
                opacity: 0.3,
              }}
            />
            <div style={{
              width: node.size, height: node.size,
              borderRadius: '50%', background: node.color,
              border: '2px solid rgba(255,255,255,0.3)',
              position: 'relative', zIndex: 1,
            }} />
          </div>
          <div style={{
            position: 'absolute', top: node.size + 3, left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 8, color: 'rgba(255,255,255,0.6)',
            whiteSpace: 'nowrap', fontWeight: 600,
          }}>
            {node.label}
          </div>
        </motion.div>
      ))}

      {/* overlay label */}
      <div style={{ position: 'absolute', top: 10, left: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Navigation size={12} color="var(--gold)" />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Mumbai Live Routes</span>
      </div>

      {/* active count */}
      <div style={{ position: 'absolute', top: 10, right: 14 }}>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 999, padding: '3px 10px' }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>1,234 active</span>
        </motion.div>
      </div>
    </div>
  )
}

/* ─────────────────────────── page ─────────────────────────── */
export default function JourneysPage() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [activeJourneys, setActiveJourneys] = useState(ACTIVE_JOURNEYS)

  useEffect(() => {
    journeysApi.active()
      .then((d: any) => {
        if (d.journeys && d.journeys.length > 0) {
          setActiveJourneys(d.journeys.map((j: any, idx: number) => ({
            id: `J-${String(j.id ?? idx + 1).padStart(3, "0")}`,
            member: j.user_name ?? "Unknown",
            initials: (j.user_name ?? "UN").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
            avatarColor: '#4B80F0',
            from: j.from ?? "Home",
            to: j.to ?? "Office",
            started: j.started_at ? new Date(j.started_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--",
            eta: "--",
            distance: j.distance ? `${j.distance} km` : "--",
            speed: j.speed ?? 0,
            passengers: j.passengers ?? 1,
            status: (j.status ?? "En Route") as JourneyStatus,
          })))
        }
      })
      .catch(() => {})
    journeysApi.stats()
      .then((_d: any) => { /* stats update if needed in future */ })
      .catch(() => {})
  }, [])

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
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Journeys</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Manage live route sharing</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 12, padding: '10px 18px',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>5,432 Active Journeys</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard index={0} icon={<Route size={20} />}      label="Real-time count"     value="5,432"    sub="Across all cities"     subColor="#10B981" pulse />
        <StatCard index={1} icon={<TrendingUp size={20} />} label="COMPLETED TODAY"     value="23,891"   sub="+8% from yesterday"    subColor="#10B981" />
        <StatCard index={2} icon={<Clock size={20} />}      label="AVG DURATION"        value="28 min"   sub="vs 31 min last week"   subColor="var(--gold)" />
        <StatCard index={3} icon={<Navigation size={20} />} label="TOTAL DISTANCE"      value="4,23,891 km" sub="Total distance today" subColor="var(--text-muted)" />
      </div>

      {/* ── active journeys table ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Route size={18} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Active Journeys</span>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}
            >
              Live
            </motion.span>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface2)' }}>
                {['Member', 'From', 'To', 'Started', 'ETA', 'Distance', 'Speed', 'Passengers', 'Status', 'Actions'].map(col => (
                  <th key={col} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeJourneys.map((row, i) => {
                const isActive = row.status === 'En Route'
                const isHovered = hoveredRow === row.id
                const isSOS = row.status === 'SOS'
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: isHovered
                        ? 'rgba(var(--gold-rgb),0.05)'
                        : isSOS
                          ? 'rgba(239,68,68,0.05)'
                          : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}
                  >
                    {/* green left border for active journeys */}
                    {isActive && (
                      <td style={{ width: 3, padding: 0, background: 'rgba(16,185,129,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} />
                    )}
                    {!isActive && (
                      <td style={{ width: 3, padding: 0, borderBottom: '1px solid rgba(255,255,255,0.04)' }} />
                    )}
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <Avatar initials={row.initials} color={row.avatarColor} size={30} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{row.member}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        <MapPin size={11} color="var(--text-muted)" />
                        {row.from}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        <Navigation size={11} color="var(--gold)" />
                        {row.to}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{row.started}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, fontFamily: 'monospace', color: row.eta === '--' ? '#EF4444' : 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.eta}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{row.distance}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: speedColor(row.speed) }}>
                        {row.speed === 0 ? '--' : `${row.speed} km/h`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Users size={11} color="var(--text-muted)" />
                        {row.passengers}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(75,128,240,0.08)', color: 'var(--primary)', border: '1px solid rgba(75,128,240,0.2)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <Eye size={11} /> Track
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── heatmap + top cities ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <MapPin size={16} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Journey Heatmap</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Real-time route density</span>
          </div>
          <CityHeatmap />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <TrendingUp size={16} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Top Cities</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOP_CITIES.map((city, i) => (
              <motion.div
                key={city.city}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{city.city}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>{city.count}</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${city.pct}%` }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold), rgba(var(--gold-rgb),0.5))', borderRadius: 3 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── hourly chart + stats summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* hourly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Clock size={16} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Completed Journeys by Hour</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>6 AM — 10 PM</span>
            <span style={{ background: 'rgba(var(--gold-rgb),0.12)', color: 'var(--gold)', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>Peak highlighted</span>
          </div>
          <HourlyChart />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {['Morning Rush', 'Midday', 'Afternoon', 'Evening Rush', 'Night'].map(label => (
              <span key={label} style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
            ))}
          </div>
        </motion.div>

        {/* journey stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Car size={16} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Journey Statistics</span>
          </div>

          {/* vehicle donut */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 12 }}>By Vehicle Type</div>
            <DonutChart />
          </div>

          {/* divider */}
          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* avg rating */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>Avg Family Rating</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.span
                    key={star}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + star * 0.07, type: 'spring', stiffness: 300 }}
                    style={{ fontSize: 18, color: star <= 4 ? '#D4A853' : 'rgba(212,168,83,0.4)' }}
                  >
                    {star <= 4 ? '★' : '★'}
                  </motion.span>
                ))}
              </div>
              <span style={{
                fontSize: 22, fontWeight: 800,
                background: 'linear-gradient(135deg, var(--gold) 0%, #e8c46a 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                4.8
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 5.0</span>
            </div>
          </div>

          {/* divider */}
          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* SOS during journey */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>SOS Triggered During Journey</div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 14px', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#EF4444' }}>2</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Today</div>
              </div>
              <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 12, padding: '10px 14px', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#F97316' }}>34</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>This Month</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
