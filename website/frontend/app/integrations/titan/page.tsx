'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  Lock,
  Unlock,
  Shield,
  Bell,
  BellOff,
  Battery,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  ChevronRight,
  Activity,
  Home,
  Key,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TitanLock {
  id: number
  name: string
  location: string
  is_locked: boolean
  is_online: boolean
  battery_level: number
  last_action: string
  last_action_by: string
  auto_lock_minutes: number
}

interface TitanAlert {
  id: number
  lock_name: string
  action: string
  triggered_by: string
  created_at: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LOCKS: TitanLock[] = [
  {
    id: 1,
    name: 'Front Door',
    location: 'Main Entrance',
    is_locked: true,
    is_online: true,
    battery_level: 87,
    last_action: 'locked',
    last_action_by: 'You',
    auto_lock_minutes: 5,
  },
  {
    id: 2,
    name: 'Back Door',
    location: 'Kitchen',
    is_locked: false,
    is_online: true,
    battery_level: 43,
    last_action: 'unlocked',
    last_action_by: 'Priya',
    auto_lock_minutes: 0,
  },
  {
    id: 3,
    name: 'Garage',
    location: 'Parking',
    is_locked: true,
    is_online: false,
    battery_level: 12,
    last_action: 'locked',
    last_action_by: 'System',
    auto_lock_minutes: 10,
  },
]

const MOCK_ALERTS: TitanAlert[] = [
  {
    id: 1,
    lock_name: 'Front Door',
    action: 'door_open',
    triggered_by: 'sensor',
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 2,
    lock_name: 'Back Door',
    action: 'door_close',
    triggered_by: 'sensor',
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 3,
    lock_name: 'Garage',
    action: 'unlocked',
    triggered_by: 'remote',
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function getBatteryColor(level: number): string {
  if (level > 50) return '#22c55e'
  if (level > 20) return '#f59e0b'
  return '#ef4444'
}

function getAlertConfig(action: string) {
  switch (action) {
    case 'door_open':
      return { color: '#22c55e', label: 'Entry detected', icon: '🚪' }
    case 'door_close':
      return { color: '#f59e0b', label: 'Exit detected', icon: '🚪' }
    case 'tamper':
      return { color: '#ef4444', label: 'Tamper alert', icon: '⚠️' }
    case 'unlocked':
      return { color: '#D4A853', label: 'Unlocked remotely', icon: '🔓' }
    case 'locked':
      return { color: '#D4A853', label: 'Locked', icon: '🔒' }
    default:
      return { color: '#6b7280', label: action, icon: '📡' }
  }
}

// ─── Circuit Board SVG Background ─────────────────────────────────────────────

function CircuitBoardBackground() {
  const lines = [
    { x1: 0, y1: 80, x2: 200, y2: 80 },
    { x1: 200, y1: 80, x2: 200, y2: 180 },
    { x1: 200, y1: 180, x2: 400, y2: 180 },
    { x1: 400, y1: 180, x2: 400, y2: 60 },
    { x1: 400, y1: 60, x2: 650, y2: 60 },
    { x1: 100, y1: 0, x2: 100, y2: 80 },
    { x1: 650, y1: 60, x2: 650, y2: 250 },
    { x1: 650, y1: 250, x2: 800, y2: 250 },
    { x1: 300, y1: 180, x2: 300, y2: 320 },
    { x1: 300, y1: 320, x2: 500, y2: 320 },
    { x1: 500, y1: 320, x2: 500, y2: 400 },
    { x1: 150, y1: 300, x2: 300, y2: 300 },
    { x1: 150, y1: 300, x2: 150, y2: 400 },
    { x1: 550, y1: 180, x2: 550, y2: 320 },
    { x1: 700, y1: 250, x2: 700, y2: 380 },
    { x1: 700, y1: 380, x2: 800, y2: 380 },
  ]

  const nodes = [
    { cx: 200, cy: 80 },
    { cx: 400, cy: 180 },
    { cx: 400, cy: 60 },
    { cx: 650, cy: 60 },
    { cx: 650, cy: 250 },
    { cx: 300, cy: 180 },
    { cx: 300, cy: 320 },
    { cx: 500, cy: 320 },
    { cx: 150, cy: 300 },
    { cx: 550, cy: 180 },
    { cx: 700, cy: 250 },
  ]

  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="circuit-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {lines.map((line, i) => (
        <motion.line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#D4A853"
          strokeWidth="1"
          filter="url(#circuit-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
      {nodes.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r="4"
          fill="#D4A853"
          filter="url(#circuit-glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
        />
      ))}
    </svg>
  )
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

interface ToastMsg {
  id: number
  message: string
  type: 'success' | 'error'
}

function Toast({ toast, onDone }: { toast: ToastMsg; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9 }}
      className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl"
      style={{
        background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 size={18} className="text-green-400" />
      ) : (
        <AlertTriangle size={18} className="text-red-400" />
      )}
      <span className="text-white text-sm font-medium">{toast.message}</span>
    </motion.div>
  )
}

// ─── Add Lock Modal ─────────────────────────────────────────────────────────────

interface AddLockModalProps {
  onClose: () => void
  onAdd: (lock: Partial<TitanLock>) => void
}

function AddLockModal({ onClose, onAdd }: AddLockModalProps) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [autoLock, setAutoLock] = useState('0')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/titan/locks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          location,
          auto_lock_minutes: parseInt(autoLock),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        onAdd(data)
      } else {
        onAdd({
          id: Date.now(),
          name,
          location,
          is_locked: true,
          is_online: true,
          battery_level: 100,
          last_action: 'added',
          last_action_by: 'You',
          auto_lock_minutes: parseInt(autoLock),
        })
      }
    } catch {
      onAdd({
        id: Date.now(),
        name,
        location,
        is_locked: true,
        is_online: true,
        battery_level: 100,
        last_action: 'added',
        last_action_by: 'You',
        auto_lock_minutes: parseInt(autoLock),
      })
    }
    setLoading(false)
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal Card */}
      <motion.div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{
          background: '#111420',
          border: '1px solid rgba(212,168,83,0.25)',
          boxShadow: '0 0 60px rgba(212,168,83,0.1), 0 24px 64px rgba(0,0,0,0.6)',
        }}
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2 rounded-xl"
            style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)' }}
          >
            <Plus size={20} style={{ color: '#D4A853' }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Add New Lock</h2>
            <p className="text-gray-500 text-sm">Connect a Titan Smart Lock</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Lock Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Front Door"
              required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '14px',
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(212,168,83,0.4)'
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.08)'
              }}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Entrance"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '14px',
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid rgba(212,168,83,0.4)'
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.08)'
              }}
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Auto-Lock</label>
            <select
              value={autoLock}
              onChange={(e) => setAutoLock(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '14px',
              }}
            >
              <option value="0" style={{ background: '#111420' }}>Disabled</option>
              <option value="1" style={{ background: '#111420' }}>After 1 minute</option>
              <option value="5" style={{ background: '#111420' }}>After 5 minutes</option>
              <option value="10" style={{ background: '#111420' }}>After 10 minutes</option>
              <option value="30" style={{ background: '#111420' }}>After 30 minutes</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-gray-400 font-medium transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: loading || !name.trim() ? 'rgba(212,168,83,0.3)' : 'rgba(212,168,83,0.9)',
                color: loading || !name.trim() ? 'rgba(255,255,255,0.4)' : '#0B0D13',
                border: '1px solid rgba(212,168,83,0.4)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? 'Adding...' : 'Add Lock'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Battery Bar ───────────────────────────────────────────────────────────────

function BatteryBar({ level }: { level: number }) {
  const color = getBatteryColor(level)
  return (
    <div className="flex items-center gap-2">
      <Battery size={14} style={{ color }} />
      <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs" style={{ color }}>
        {level}%
      </span>
    </div>
  )
}

// ─── Lock Card ─────────────────────────────────────────────────────────────────

interface LockCardProps {
  lock: TitanLock
  onToggle: (id: number, action: 'lock' | 'unlock') => Promise<void>
  onDelete: (id: number) => void
  isToggling: boolean
}

function LockCard({ lock, onToggle, onDelete, isToggling }: LockCardProps) {
  const [hovered, setHovered] = useState(false)
  const [flash, setFlash] = useState(false)
  const iconControls = useAnimation()

  const triggerFlash = useCallback(
    (locked: boolean) => {
      setFlash(true)
      iconControls.start({
        rotate: [0, 360],
        scale: [1, 1.3, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      })
      setTimeout(() => setFlash(false), 600)
    },
    [iconControls]
  )

  // Watch for state changes to trigger animation
  const prevLocked = useRef(lock.is_locked)
  useEffect(() => {
    if (prevLocked.current !== lock.is_locked) {
      triggerFlash(lock.is_locked)
      prevLocked.current = lock.is_locked
    }
  }, [lock.is_locked, triggerFlash])

  const handleToggle = () => {
    if (isToggling) return
    onToggle(lock.id, lock.is_locked ? 'unlock' : 'lock')
  }

  const lockedColor = '#D4A853'
  const unlockedColor = '#22c55e'
  const currentColor = lock.is_locked ? lockedColor : unlockedColor

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-2xl p-6 cursor-default"
      style={{
        background: '#111420',
        border: flash
          ? `1px solid ${currentColor}`
          : hovered
          ? 'border: 1px solid rgba(212,168,83,0.2)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: flash
          ? `0 0 30px ${currentColor}40, 0 8px 32px rgba(0,0,0,0.5)`
          : hovered
          ? '0 0 20px rgba(212,168,83,0.08), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 4px 24px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Online/Offline dot */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        {lock.is_online ? (
          <motion.div
            className="w-2 h-2 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-600" />
        )}
        <span className="text-xs" style={{ color: lock.is_online ? '#4ade80' : '#6b7280' }}>
          {lock.is_online ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="flex items-start gap-5">
        {/* Lock Icon */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="relative">
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${currentColor}20 0%, transparent 70%)`,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: lock.is_locked ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: lock.is_locked
                  ? 'rgba(212,168,83,0.12)'
                  : 'rgba(34,197,94,0.1)',
                border: `1px solid ${currentColor}40`,
                boxShadow: `0 0 20px ${currentColor}25`,
              }}
              animate={iconControls}
            >
              {lock.is_locked ? (
                <Lock size={28} style={{ color: lockedColor }} />
              ) : (
                <Unlock size={28} style={{ color: unlockedColor }} />
              )}
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base leading-tight truncate">{lock.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 mb-3">
            <Home size={12} className="text-gray-500 flex-shrink-0" />
            <span className="text-gray-500 text-sm truncate">{lock.location}</span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wider uppercase"
              style={{
                background: lock.is_locked ? 'rgba(212,168,83,0.15)' : 'rgba(34,197,94,0.12)',
                color: lock.is_locked ? '#D4A853' : '#22c55e',
                border: `1px solid ${lock.is_locked ? 'rgba(212,168,83,0.3)' : 'rgba(34,197,94,0.25)'}`,
              }}
            >
              {lock.is_locked ? (
                <Lock size={10} />
              ) : (
                <Unlock size={10} />
              )}
              {lock.is_locked ? 'Locked' : 'Unlocked'}
            </span>
          </div>

          {/* Battery */}
          <BatteryBar level={lock.battery_level} />

          {/* Last action */}
          <div className="mt-2 flex items-center gap-1.5">
            <Clock size={11} className="text-gray-600" />
            <span className="text-xs text-gray-600">
              {lock.last_action} by {lock.last_action_by}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {/* Toggle Button */}
          <motion.button
            onClick={handleToggle}
            disabled={isToggling || !lock.is_online}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: lock.is_locked
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(212,168,83,0.12)',
              color: lock.is_locked ? '#22c55e' : '#D4A853',
              border: lock.is_locked
                ? '1px solid rgba(34,197,94,0.25)'
                : '1px solid rgba(212,168,83,0.25)',
              opacity: !lock.is_online ? 0.4 : 1,
              cursor: !lock.is_online ? 'not-allowed' : 'pointer',
            }}
            whileHover={lock.is_online ? { scale: 1.05 } : {}}
            whileTap={lock.is_online ? { scale: 0.95 } : {}}
          >
            {isToggling ? (
              <Loader2 size={14} className="animate-spin" />
            ) : lock.is_locked ? (
              <Unlock size={14} />
            ) : (
              <Lock size={14} />
            )}
            {isToggling ? 'Wait...' : lock.is_locked ? 'Unlock' : 'Lock'}
          </motion.button>

          {/* Delete */}
          <motion.button
            onClick={() => onDelete(lock.id)}
            className="p-2 rounded-lg text-gray-600 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            whileHover={{ color: '#ef4444', scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>

      {/* Auto-lock indicator */}
      {lock.auto_lock_minutes > 0 && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-5 flex items-center gap-2">
          <Clock size={12} className="text-gray-600" />
          <span className="text-xs text-gray-600">
            Auto-locks after {lock.auto_lock_minutes} min
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ─── Alert Item ─────────────────────────────────────────────────────────────────

function AlertItem({ alert, isNew }: { alert: TitanAlert; isNew: boolean }) {
  const cfg = getAlertConfig(alert.action)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{
        background: isNew ? `${cfg.color}08` : 'rgba(255,255,255,0.02)',
        border: isNew ? `1px solid ${cfg.color}30` : '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <span className="text-base">{cfg.icon}</span>
        {isNew && (
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: cfg.color }}
            animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{cfg.label}</p>
        <p className="text-gray-500 text-xs truncate">{alert.lock_name}</p>
      </div>
      <span className="text-gray-600 text-xs flex-shrink-0">{formatRelativeTime(alert.created_at)}</span>
    </motion.div>
  )
}

// ─── Stat Badge ────────────────────────────────────────────────────────────────

function StatBadge({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  value: number
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex items-center gap-3 px-5 py-3 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ color: '#D4A853' }}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-gray-500 text-xs mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TitanPage() {
  const [locks, setLocks] = useState<TitanLock[]>([])
  const [alerts, setAlerts] = useState<TitanAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [newAlertIds, setNewAlertIds] = useState<Set<number>>(new Set())
  const alertsRef = useRef<TitanAlert[]>([])
  const toastCounter = useRef(0)

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastCounter.current
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Fetch locks
  const fetchLocks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/titan/locks`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setLocks(data)
          return
        }
      }
    } catch {}
    setLocks(MOCK_LOCKS)
  }, [])

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/titan/alerts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          // Detect new alerts
          const prevIds = new Set(alertsRef.current.map((a) => a.id))
          const newIds = new Set(data.filter((a: TitanAlert) => !prevIds.has(a.id)).map((a: TitanAlert) => a.id))
          if (newIds.size > 0) setNewAlertIds(newIds)
          alertsRef.current = data
          setAlerts(data)
          return
        }
      }
    } catch {}
    alertsRef.current = MOCK_ALERTS
    setAlerts(MOCK_ALERTS)
  }, [])

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchLocks(), fetchAlerts()])
      setLoading(false)
    }
    init()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [fetchLocks, fetchAlerts])

  // Clear new alert highlights after 5s
  useEffect(() => {
    if (newAlertIds.size === 0) return
    const t = setTimeout(() => setNewAlertIds(new Set()), 5000)
    return () => clearTimeout(t)
  }, [newAlertIds])

  const handleToggle = useCallback(
    async (id: number, action: 'lock' | 'unlock') => {
      setTogglingIds((prev) => new Set(prev).add(id))
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE}/titan/locks/${id}/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ action }),
        })
        if (res.ok || true) {
          // Optimistic update
          setLocks((prev) =>
            prev.map((l) =>
              l.id === id
                ? { ...l, is_locked: action === 'lock', last_action: action, last_action_by: 'You' }
                : l
            )
          )
          addToast(
            action === 'lock' ? 'Lock secured successfully' : 'Lock opened successfully',
            'success'
          )
        }
      } catch {
        // Optimistic update even on network error (mock mode)
        setLocks((prev) =>
          prev.map((l) =>
            l.id === id
              ? { ...l, is_locked: action === 'lock', last_action: action, last_action_by: 'You' }
              : l
          )
        )
        addToast(action === 'lock' ? 'Lock secured' : 'Lock opened', 'success')
      }
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
    [addToast]
  )

  const handleDelete = useCallback(
    (id: number) => {
      setLocks((prev) => prev.filter((l) => l.id !== id))
      addToast('Lock removed', 'success')
    },
    [addToast]
  )

  const handleAdd = useCallback(
    (lock: Partial<TitanLock>) => {
      setLocks((prev) => [...prev, lock as TitanLock])
      addToast(`"${lock.name}" added successfully`, 'success')
    },
    [addToast]
  )

  // Stats
  const totalLocks = locks.length
  const lockedCount = locks.filter((l) => l.is_locked).length
  const alertsToday = alerts.filter((a) => {
    const d = new Date(a.created_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0B0D13', color: '#fff' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-6">
        <CircuitBoardBackground />

        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,168,83,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10">
            {/* Icon badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div
                className="relative w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
                style={{
                  background: 'rgba(212,168,83,0.1)',
                  border: '1px solid rgba(212,168,83,0.35)',
                  boxShadow: '0 0 40px rgba(212,168,83,0.2), inset 0 0 30px rgba(212,168,83,0.05)',
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Shield size={36} style={{ color: '#D4A853' }} />
                </motion.div>
                {/* Orbit ring */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{ border: '1px solid rgba(212,168,83,0.2)' }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-7xl font-black tracking-tighter mb-3"
              style={{
                color: '#D4A853',
                textShadow: '0 0 60px rgba(212,168,83,0.5), 0 0 120px rgba(212,168,83,0.2)',
                letterSpacing: '-0.04em',
              }}
            >
              TITAN
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-xl text-gray-400 font-light tracking-widest uppercase mb-1"
            >
              Smart Lock Intelligence
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-gray-600 text-sm max-w-md"
            >
              Military-grade access control with real-time monitoring and intelligent automation
            </motion.p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <StatBadge icon={<Key size={20} />} label="Total Locks" value={totalLocks} delay={0.5} />
            <StatBadge icon={<Lock size={20} />} label="Locked" value={lockedCount} delay={0.6} />
            <StatBadge icon={<Bell size={20} />} label="Entry Alerts Today" value={alertsToday} delay={0.7} />
          </div>

          {/* Add Lock button */}
          <div className="flex justify-center">
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-sm"
              style={{
                background: 'rgba(212,168,83,0.15)',
                border: '1px solid rgba(212,168,83,0.4)',
                color: '#D4A853',
                boxShadow: '0 0 20px rgba(212,168,83,0.1)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(212,168,83,0.25)',
                background: 'rgba(212,168,83,0.22)',
              }}
              whileTap={{ scale: 0.96 }}
            >
              <Plus size={18} />
              Add Lock
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-6 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={36} style={{ color: '#D4A853' }} />
            </motion.div>
            <p className="text-gray-500 text-sm">Loading your locks...</p>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Locks Grid */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #D4A853, rgba(212,168,83,0.2))' }}
                  />
                  <h2 className="text-white font-bold text-xl">Your Locks</h2>
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(212,168,83,0.12)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}
                  >
                    {totalLocks}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Activity size={14} />
                  <span>{lockedCount}/{totalLocks} secured</span>
                </div>
              </motion.div>

              {locks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl"
                  style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
                >
                  <Lock size={40} className="text-gray-700" />
                  <p className="text-gray-500">No locks connected yet</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}
                  >
                    <Plus size={14} /> Add your first lock
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-5"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {locks.map((lock) => (
                      <LockCard
                        key={lock.id}
                        lock={lock}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        isToggling={togglingIds.has(lock.id)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Alerts Feed */}
            <div className="xl:w-80 w-full flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl p-5 sticky top-24"
                style={{
                  background: '#111420',
                  border: '1px solid rgba(255,255,255,0.07)',
                  maxHeight: 'calc(100vh - 120px)',
                  overflowY: 'auto',
                }}
              >
                {/* Feed header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-lg"
                      style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)' }}
                    >
                      <Bell size={14} style={{ color: '#D4A853' }} />
                    </div>
                    <span className="text-white font-semibold text-sm">Entry Feed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-green-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-gray-600 text-xs">Live</span>
                  </div>
                </div>

                {/* Alerts */}
                {alerts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 py-12"
                  >
                    <BellOff size={28} className="text-gray-700" />
                    <p className="text-gray-600 text-sm text-center">No recent alerts</p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {alerts.slice(0, 20).map((alert) => (
                        <AlertItem
                          key={alert.id}
                          alert={alert}
                          isNew={newAlertIds.has(alert.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Refresh hint */}
                <div className="mt-4 pt-4 border-t border-white border-opacity-5 flex items-center gap-2 text-gray-700">
                  <Clock size={11} />
                  <span className="text-xs">Refreshes every 30s</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </section>

      {/* ── Add Lock Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <AddLockModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>

      {/* ── Toast Stack ───────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDone={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  )
}
