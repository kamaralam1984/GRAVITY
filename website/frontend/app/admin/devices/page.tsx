'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/api'
import {
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  MapPin,
  Bell,
  RefreshCw,
  Filter,
  Search,
  Download,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Monitor,
  X,
  Send,
  Navigation,
  ShieldOff,
  Clock,
  Activity,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

/* ─────────────────────────── types ─────────────────────────── */
type DeviceOS = 'iOS' | 'Android'
type DeviceStatus = 'Online' | 'Offline'
type BatteryAlert = 'critical' | 'low' | 'ok' | 'unknown'

interface DeviceRow {
  id: string
  model: string
  owner: string
  family: string
  os: DeviceOS
  osVersion: string
  appVersion: string
  battery: number | null
  status: DeviceStatus
  location: string
  lastActive: string
  isLowBattery?: boolean
  isCritical?: boolean
}

/* ─────────────────────────── data ──────────────────────────── */
const DEVICES: DeviceRow[] = [
  { id: 'DEV-001', model: 'iPhone 14 Pro',    owner: 'Mom (Sharma)',   family: 'Sharma',  os: 'iOS',     osVersion: '17.2', appVersion: '2.4.1', battery: 87,  status: 'Online',  location: 'Mumbai',          lastActive: '2 min ago' },
  { id: 'DEV-002', model: 'Samsung S23',       owner: 'Raj Mehta',      family: 'Mehta',   os: 'Android', osVersion: '14',   appVersion: '2.4.0', battery: 23,  status: 'Online',  location: 'Delhi',           lastActive: '5 min ago' },
  { id: 'DEV-003', model: 'iPhone 13',         owner: 'Priya Iyer',     family: 'Iyer',    os: 'iOS',     osVersion: '16.5', appVersion: '2.3.8', battery: 12,  status: 'Online',  location: 'Bangalore',       lastActive: '1 min ago',  isLowBattery: true },
  { id: 'DEV-004', model: 'OnePlus 11',        owner: 'Arjun Singh',    family: 'Singh',   os: 'Android', osVersion: '13',   appVersion: '2.4.1', battery: 95,  status: 'Online',  location: 'Mumbai',          lastActive: '8 min ago' },
  { id: 'DEV-005', model: 'iPhone 15',         owner: 'Kavita Gupta',   family: 'Gupta',   os: 'iOS',     osVersion: '17.3', appVersion: '2.4.1', battery: 78,  status: 'Online',  location: 'Chennai',         lastActive: '3 min ago' },
  { id: 'DEV-006', model: 'Redmi Note 12',     owner: 'Suresh Nair',    family: 'Nair',    os: 'Android', osVersion: '12',   appVersion: '2.2.5', battery: null, status: 'Offline', location: 'Last: Delhi',    lastActive: '2 days ago' },
  { id: 'DEV-007', model: 'Samsung A54',       owner: 'Ananya Reddy',   family: 'Reddy',   os: 'Android', osVersion: '13',   appVersion: '2.4.0', battery: 45,  status: 'Online',  location: 'Hyderabad',       lastActive: '12 min ago' },
  { id: 'DEV-008', model: 'iPhone 12',         owner: 'Vijay Patel',    family: 'Patel',   os: 'iOS',     osVersion: '16.1', appVersion: '2.3.5', battery: 8,   status: 'Online',  location: 'Pune',            lastActive: '30 sec ago', isCritical: true, isLowBattery: true },
  { id: 'DEV-009', model: 'Pixel 7',           owner: 'Meera Joshi',    family: 'Joshi',   os: 'Android', osVersion: '14',   appVersion: '2.4.1', battery: 62,  status: 'Online',  location: 'Mumbai',          lastActive: '6 min ago' },
  { id: 'DEV-010', model: 'iPhone 14',         owner: 'Rahul Kapoor',   family: 'Kapoor',  os: 'iOS',     osVersion: '17.1', appVersion: '2.3.9', battery: null, status: 'Offline', location: 'Last: Bangalore', lastActive: '18 hr ago' },
  { id: 'DEV-011', model: 'Samsung S22',       owner: 'Deepa Sharma',   family: 'Sharma',  os: 'Android', osVersion: '13',   appVersion: '2.4.1', battery: 91,  status: 'Online',  location: 'Delhi',           lastActive: '4 min ago' },
  { id: 'DEV-012', model: 'Realme GT',         owner: 'Arun Kumar',     family: 'Kumar',   os: 'Android', osVersion: '12',   appVersion: '2.3.7', battery: 17,  status: 'Online',  location: 'Mumbai',          lastActive: '9 min ago',  isLowBattery: true },
]

const BATTERY_HISTORY = [72, 65, 58, 48, 39, 28, 17]

const ACTIVITY_TIMELINE = [
  { time: '09:42 AM', event: 'Location updated', loc: 'Mumbai, Maharashtra' },
  { time: '09:38 AM', event: 'Battery alert triggered', loc: '20% threshold reached' },
  { time: '09:15 AM', event: 'Geofence entered', loc: 'Home Zone' },
  { time: '08:51 AM', event: 'App opened', loc: '' },
  { time: '08:30 AM', event: 'Location updated', loc: 'Bandra, Mumbai' },
  { time: '07:22 AM', event: 'Device unlocked', loc: '' },
  { time: '06:45 AM', event: 'Charging stopped', loc: '87% battery' },
  { time: '12:30 AM', event: 'Charging started', loc: '23% battery' },
  { time: 'Yesterday', event: 'Geofence exited', loc: 'School Zone' },
  { time: 'Yesterday', event: 'SOS test triggered', loc: '' },
]

/* ─────────────────────────── battery helpers ───────────────── */
function getBatteryColor(pct: number | null): string {
  if (pct === null) return '#6B7280'
  if (pct < 20) return '#EF4444'
  if (pct < 50) return '#F59E0B'
  return '#10B981'
}

function getBatteryAlert(pct: number | null): BatteryAlert {
  if (pct === null) return 'unknown'
  if (pct < 10) return 'critical'
  if (pct < 20) return 'low'
  return 'ok'
}

/* ─────────────────────────── battery bar ───────────────────── */
function BatteryBar({ pct }: { pct: number | null }) {
  if (pct === null) return <span style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>—</span>
  const color = getBatteryColor(pct)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 36, height: 14, borderRadius: 3, border: `1.5px solid ${color}55`, background: 'var(--bg-surface3)', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, background: color, borderRadius: 2 }}
        />
        <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 3, height: 6, background: color, borderRadius: '0 1px 1px 0' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{pct}%</span>
    </div>
  )
}

/* ─────────────────────────── OS icon ───────────────────────── */
function OSIcon({ os }: { os: DeviceOS }) {
  if (os === 'iOS') {
    return (
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M11.6 8.4c0-2.3 1.9-3.4 2-3.4-1.1-1.6-2.7-1.8-3.3-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.7C2.1 3.4.3 4.6.3 7.4c0 2.9 2 7.3 2.8 8.7.5.8 1 1.7 1.7 1.7.7 0 1-.4 1.9-.4.9 0 1.1.4 1.9.4.8 0 1.2-.8 1.7-1.6.5-.9.7-1.7.7-1.8-.1-.1-2-.9-2-3z" fill="currentColor"/>
        <path d="M9.5 1.8c.4-.5.7-1.2.6-1.8-.6 0-1.4.4-1.8.9-.4.4-.8 1.1-.7 1.7.7.1 1.5-.3 1.9-.8z" fill="currentColor"/>
      </svg>
    )
  }
  return (
    <svg width="14" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zm-2.5-1c-.83 0-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5S5 24.33 5 23.5v-5C5 17.67 4.33 17 3.5 17zm17 0c-.83 0-1.5.67-1.5 1.5v5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5zm-4.97-14.58l1.96-1.96c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-2.13 2.13C13.84 2.31 12.95 2.1 12 2.1c-.96 0-1.86.21-2.66.59L7.21.56c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.96 1.96C6.78 4.37 5.67 6.09 5.5 8H18.5c-.17-1.9-1.28-3.63-2.97-4.58zM10 6H9V5h1v1zm5 0h-1V5h1v1z" fill="currentColor"/>
    </svg>
  )
}

/* ─────────────────────────── status badge ──────────────────── */
function StatusBadge({ status }: { status: DeviceStatus }) {
  const online = status === 'Online'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: online ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', color: online ? '#10B981' : '#EF4444', border: `1px solid ${online ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: online ? '#10B981' : '#EF4444', animation: online ? 'pulse 2s infinite' : 'none' }} />
      {status}
    </span>
  )
}

/* ─────────────────────────── alert badge ───────────────────── */
function AlertBadge({ device }: { device: DeviceRow }) {
  if (device.isCritical) return <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 999, padding: '2px 7px', whiteSpace: 'nowrap' }}>CRITICAL</span>
  if (device.isLowBattery) return <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '2px 7px', whiteSpace: 'nowrap' }}>LOW BATTERY</span>
  if (device.status === 'Offline') return <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(107,114,128,0.12)', color: '#6B7280', border: '1px solid rgba(107,114,128,0.25)', borderRadius: 999, padding: '2px 7px', whiteSpace: 'nowrap' }}>OFFLINE</span>
  return null
}

/* ─────────────────────────── SVG battery history line ──────── */
function BatteryLineChart() {
  const w = 320, h = 80, pad = 12
  const max = 100, min = 0
  const step = (w - pad * 2) / (BATTERY_HISTORY.length - 1)
  const points = BATTERY_HISTORY.map((v, i) => {
    const x = pad + i * step
    const y = pad + (1 - (v - min) / (max - min)) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const fillPoints = `${pad},${h - pad} ${points} ${pad + (BATTERY_HISTORY.length - 1) * step},${h - pad}`

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="battGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill="url(#battGrad)" />
      <polyline points={points} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {BATTERY_HISTORY.map((v, i) => (
        <circle key={i} cx={pad + i * step} cy={pad + (1 - v / 100) * (h - pad * 2)} r="3" fill="#EF4444" stroke="var(--bg-surface)" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

/* ─────────────────────────── OS donut chart ────────────────── */
function OSDonut() {
  const iosShare = 54
  const r = 36, cx = 48, cy = 48
  const circ = 2 * Math.PI * r
  const iosArc = (iosShare / 100) * circ

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width="96" height="96">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-surface3)" strokeWidth="12" />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="var(--primary)" strokeWidth="12"
          strokeDasharray={`${iosArc} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${iosArc} ${circ}` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#10B981" strokeWidth="12"
          strokeDasharray={`${circ - iosArc - 6} ${circ}`}
          strokeDashoffset={circ / 4 - iosArc - 3}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${circ - iosArc - 6} ${circ}` }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="13" fontWeight="700">iOS</text>
        <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle" fill="var(--gold)" fontSize="11">{iosShare}%</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[{ label: 'iOS', pct: 54, color: 'var(--primary)' }, { label: 'Android', pct: 46, color: '#10B981' }].map(({ label, pct, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginLeft: 4 }}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────── app version bars ──────────────── */
function AppVersionBars() {
  const bars = [
    { version: 'v2.4.1', pct: 62, color: 'var(--primary)' },
    { version: 'v2.4.0', pct: 18, color: '#10B981' },
    { version: 'v2.3.x', pct: 14, color: 'var(--gold)' },
    { version: 'Older',  pct: 6,  color: '#6B7280' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {bars.map(({ version, pct, color }, i) => (
        <div key={version}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{version}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-surface3)', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: i * 0.1 + 0.4, duration: 0.7, ease: 'easeOut' }}
              style={{ height: '100%', background: color, borderRadius: 999 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────── device detail panel ───────────── */
function DevicePanel({ device, onClose }: { device: DeviceRow; onClose: () => void }) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 460,
        background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.22)',
        overflowY: 'auto',
      }}
    >
      {/* header */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: device.os === 'iOS' ? 'rgba(75,128,240,0.12)' : 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: device.os === 'iOS' ? 'var(--primary)' : '#10B981' }}>
            {device.os === 'iOS' ? <Smartphone size={20} /> : <Monitor size={20} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{device.model}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{device.id} — {device.owner}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* status + alert */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status={device.status} />
          <AlertBadge device={device} />
        </div>

        {/* map placeholder */}
        <div style={{ height: 160, borderRadius: 14, background: 'var(--bg-surface2)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(75,128,240,0.05) 0%, rgba(16,185,129,0.08) 100%)' }} />
          {/* grid lines */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ position: 'absolute', left: `${i * 33}%`, top: 0, bottom: 0, borderLeft: '1px solid var(--border)', opacity: 0.5 }} />
          ))}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ position: 'absolute', top: `${i * 40}px`, left: 0, right: 0, borderTop: '1px solid var(--border)', opacity: 0.5 }} />
          ))}
          {/* pin */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', color: '#EF4444' }}>
            <MapPin size={28} fill="#EF4444" color="#fff" />
          </motion.div>
          <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={13} color="var(--primary)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{device.location}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{device.lastActive}</span>
          </div>
        </div>

        {/* info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'OS',         value: `${device.os} ${device.osVersion}` },
            { label: 'App Version', value: `v${device.appVersion}` },
            { label: 'Battery',    value: device.battery !== null ? `${device.battery}%` : 'Unknown' },
            { label: 'Last Active', value: device.lastActive },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--bg-surface2)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* battery history */}
        <div style={{ background: 'var(--bg-surface2)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Battery History (7 Days)</div>
          <BatteryLineChart />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {['6d', '5d', '4d', '3d', '2d', '1d', 'Now'].map(d => (
              <span key={d} style={{ fontSize: 10, color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>{d}</span>
            ))}
          </div>
        </div>

        {/* activity timeline */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Activity Timeline</div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: 'var(--border)' }} />
            {ACTIVITY_TIMELINE.map(({ time, event, loc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', gap: 14, marginBottom: 10, paddingLeft: 2 }}
              >
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: i === 0 ? 'var(--primary)' : 'var(--bg-surface3)', border: `2px solid ${i === 0 ? 'var(--primary)' : 'var(--border)'}`, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{event}</div>
                  {loc && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{loc}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { icon: Send,     label: 'Send Ping',       color: 'var(--primary)', bg: 'rgba(75,128,240,0.1)',  border: 'rgba(75,128,240,0.25)' },
            { icon: Navigation, label: 'View Location', color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
            { icon: Bell,     label: 'Notify Owner',   color: 'var(--gold)',    bg: 'rgba(var(--gold-rgb),0.1)', border: 'rgba(var(--gold-rgb),0.25)' },
            { icon: ShieldOff, label: 'Revoke Access', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)' },
          ].map(({ icon: Icon, label, color, bg, border }) => (
            <motion.button key={label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '10px 12px', borderRadius: 10, background: bg, color, border: `1px solid ${border}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon size={13} />
              {label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────── battery alert panel ───────────── */
function BatteryAlertPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const criticals = DEVICES.filter(d => d.battery !== null && d.battery < 15)

  return (
    <motion.div
      initial={false}
      animate={{ width: open ? 280 : 44 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 28 }}>

      {/* toggle header */}
      <div onClick={onToggle} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BatteryLow size={13} color="#EF4444" />
        </div>
        {open && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Critical Alerts
            <span style={{ marginLeft: 6, background: '#EF4444', color: '#fff', borderRadius: 999, padding: '1px 6px', fontSize: 10 }}>{criticals.length}</span>
          </motion.span>
        )}
      </div>

      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {criticals.map((d, i) => (
            <div key={d.id} style={{ background: 'var(--bg-surface2)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{d.model}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{d.owner}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <BatteryBar pct={d.battery} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>Last: {d.lastActive}</div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', padding: '6px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                Send Alert
              </motion.button>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

/* ─────────────────────────── main page ─────────────────────── */
const TABS = ['All Devices', 'Online', 'Offline', 'Low Battery', 'iOS', 'Android']

export default function DevicesPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All Devices')
  const [selectedDevice, setSelectedDevice] = useState<DeviceRow | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [alertPanelOpen, setAlertPanelOpen] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [devices, setDevices] = useState(DEVICES)

  useEffect(() => {
    adminApi.devices(0, 20, undefined)
      .then(d => {
        if (d.devices && d.devices.length > 0) {
          setDevices(d.devices.map((dev: any) => ({
            id: `DEV-${String(dev.id).padStart(3,"0")}`,
            model: dev.device_name,
            owner: dev.owner_name ?? "Unknown",
            family: dev.family_name ?? "",
            os: dev.os === "ios" ? "iOS" : "Android",
            osVersion: dev.os_version ?? "",
            appVersion: dev.app_version ?? "",
            battery: dev.battery_level ?? null,
            status: dev.is_online ? "Online" : "Offline",
            location: dev.location ?? "",
            lastActive: dev.last_seen ? new Date(dev.last_seen).toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit"}) : "Unknown",
          })))
        }
      })
      .catch(() => {})
  }, [])

  const handleRefresh = () => {
    setSpinning(true)
    setTimeout(() => setSpinning(false), 1200)
  }

  const tabCount = (tab: string) => {
    if (tab === 'All Devices') return devices.length
    if (tab === 'Online') return devices.filter(d => d.status === 'Online').length
    if (tab === 'Offline') return devices.filter(d => d.status === 'Offline').length
    if (tab === 'Low Battery') return devices.filter(d => d.battery !== null && d.battery < 20).length
    if (tab === 'iOS') return devices.filter(d => d.os === 'iOS').length
    if (tab === 'Android') return devices.filter(d => d.os === 'Android').length
    return 0
  }

  const filtered = devices.filter(d => {
    const matchSearch = d.owner.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
    const matchTab =
      activeTab === 'All Devices' ||
      (activeTab === 'Online' && d.status === 'Online') ||
      (activeTab === 'Offline' && d.status === 'Offline') ||
      (activeTab === 'Low Battery' && d.battery !== null && d.battery < 20) ||
      (activeTab === 'iOS' && d.os === 'iOS') ||
      (activeTab === 'Android' && d.os === 'Android')
    return matchSearch && matchTab
  })

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' } }),
  }

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>

      {/* overlay */}
      <AnimatePresence>
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedDevice(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9998, backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDevice && <DevicePanel device={selectedDevice} onClose={() => setSelectedDevice(null)} />}
      </AnimatePresence>

      {/* ── header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Device Management</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Track and manage all registered devices</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            <Download size={15} /> Export
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'var(--gold)', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
            <motion.span animate={{ rotate: spinning ? 360 : 0 }} transition={{ duration: 0.8, ease: 'linear' }}>
              <RefreshCw size={15} />
            </motion.span>
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* ── stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Smartphone, label: 'Total Devices',       value: '142,891', sub: '+2,341 this week',  color: 'var(--primary)', bg: 'rgba(75,128,240,0.08)', trend: 'up' },
          { icon: Wifi,       label: 'Online Now',          value: '98,432',  sub: '68.9% of fleet',   color: '#10B981', bg: 'rgba(16,185,129,0.08)', trend: 'up' },
          { icon: WifiOff,    label: 'Offline (>24h)',      value: '8,234',   sub: '5.8% of fleet',    color: '#EF4444', bg: 'rgba(239,68,68,0.08)', trend: 'down' },
          { icon: BatteryLow, label: 'Low Battery (<20%)',  value: '12,456',  sub: '8.7% need charging', color: 'var(--gold)', bg: 'rgba(var(--gold-rgb),0.08)', trend: 'warn' },
        ].map(({ icon: Icon, label, value, sub, color, bg, trend }, i) => (
          <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '18px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={21} color={color} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: trend === 'up' ? 'rgba(16,185,129,0.1)' : trend === 'down' ? 'rgba(239,68,68,0.1)' : 'rgba(var(--gold-rgb),0.1)', color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : 'var(--gold)', display: 'flex', alignItems: 'center', gap: 3 }}>
                {trend === 'up' ? <ChevronUp size={11} /> : trend === 'down' ? <ChevronDown size={11} /> : null}
                {trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Alert'}
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 28, fontWeight: 800, background: `linear-gradient(135deg, ${color}, ${color}99)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 24 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>OS Distribution</div>
          <OSDonut />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>App Version Distribution</div>
          <AppVersionBars />
        </motion.div>
      </div>

      {/* ── tab bar ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 6, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <motion.button key={tab} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, background: activeTab === tab ? 'var(--bg-surface3)' : 'transparent', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            {tab}
            <span style={{ fontSize: 11, background: activeTab === tab ? 'var(--gold)' : 'var(--bg-surface2)', color: activeTab === tab ? '#fff' : 'var(--text-muted)', borderRadius: 999, padding: '1px 6px', fontWeight: 600 }}>{tabCount(tab)}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* ── main content: table + battery panel ── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* table container */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* search */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            style={{ marginBottom: 14 }}>
            <div style={{ position: 'relative', maxWidth: 340 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search devices, owners..."
                style={{ width: '100%', paddingLeft: 36, paddingRight: 12, height: 38, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface2)', borderBottom: '1px solid var(--border)' }}>
                    {['Device', 'Owner', 'OS / Version', 'App Ver', 'Battery', 'Status', 'Last Active', 'Location', 'Actions'].map(col => (
                      <th key={col} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((device, i) => (
                    <motion.tr
                      key={device.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-surface2)' : 'transparent', cursor: 'pointer' }}
                      whileHover={{ backgroundColor: 'rgba(var(--gold-rgb),0.04)' }}
                    >
                      {/* device */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: device.os === 'iOS' ? 'rgba(75,128,240,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: device.os === 'iOS' ? 'var(--primary)' : '#10B981', flexShrink: 0 }}>
                            <Smartphone size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{device.model}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{device.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* owner */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{device.owner}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{device.family}</div>
                      </td>

                      {/* OS */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: device.os === 'iOS' ? 'var(--primary)' : '#10B981' }}>
                          <OSIcon os={device.os} />
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{device.os} {device.osVersion}</span>
                        </div>
                      </td>

                      {/* app ver */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 7px' }}>v{device.appVersion}</span>
                      </td>

                      {/* battery */}
                      <td style={{ padding: '12px 14px' }}><BatteryBar pct={device.battery} /></td>

                      {/* status */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <StatusBadge status={device.status} />
                          <AlertBadge device={device} />
                        </div>
                      </td>

                      {/* last active */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={12} color="var(--text-muted)" />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{device.lastActive}</span>
                        </div>
                      </td>

                      {/* location */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <MapPin size={12} color={device.status === 'Online' ? 'var(--primary)' : 'var(--text-muted)'} />
                          <span style={{ fontSize: 12, color: device.status === 'Online' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: device.status === 'Online' ? 500 : 400, whiteSpace: 'nowrap' }}>{device.location}</span>
                        </div>
                      </td>

                      {/* actions */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedDevice(device)}
                            title="View Details"
                            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)' }}>
                            <Activity size={13} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            title="Send Ping"
                            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <Send size={13} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            title="Notify Owner"
                            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gold)' }}>
                            <Bell size={13} />
                          </motion.button>
                          <div style={{ position: 'relative' }}>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => setOpenMenu(openMenu === device.id ? null : device.id)}
                              style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                              <MoreHorizontal size={13} />
                            </motion.button>
                            <AnimatePresence>
                              {openMenu === device.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                  style={{ position: 'absolute', right: 0, top: 32, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 6, zIndex: 200, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                                  {['View Location', 'Send Notification', 'Force Logout', 'Revoke Access'].map(action => (
                                    <div key={action} style={{ padding: '8px 12px', fontSize: 12, color: action === 'Revoke Access' ? '#EF4444' : 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}
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
            </div>

            {/* pagination */}
            <div style={{ padding: '13px 18px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface2)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing <strong style={{ color: 'var(--text-primary)' }}>1–{filtered.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>142,891</strong> devices</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <motion.button whileHover={{ scale: 1.05 }} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <ChevronLeft size={14} />
                </motion.button>
                {[1, 2, 3].map(p => (
                  <motion.button key={p} whileHover={{ scale: 1.05 }}
                    style={{ width: 30, height: 30, borderRadius: 8, border: p === 1 ? 'none' : '1px solid var(--border)', background: p === 1 ? 'var(--gold)' : 'var(--bg-surface)', color: p === 1 ? '#fff' : 'var(--text-secondary)', fontWeight: p === 1 ? 700 : 400, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p}
                  </motion.button>
                ))}
                <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0 3px' }}>...</span>
                <motion.button whileHover={{ scale: 1.05 }}
                  style={{ width: 44, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  14289
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gold)' }}>
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* battery alert sidebar */}
        <BatteryAlertPanel open={alertPanelOpen} onToggle={() => setAlertPanelOpen(!alertPanelOpen)} />
      </div>
    </div>
  )
}
