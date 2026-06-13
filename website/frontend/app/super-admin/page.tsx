'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'
import {
  Crown,
  Home,
  Users,
  Shield,
  DollarSign,
  Activity,
  BarChart2,
  Lock,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Server,
  Database,
  Wifi,
  Mail,
  MessageSquare,
  RefreshCw,
  Cpu,
  HardDrive,
  MemoryStick,
  Globe,
  MapPin,
  Zap,
  Bell,
  Menu,
  X,
  ChevronDown,
  Circle,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  AlertCircle,
  Clock,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type NavSection =
  | 'command'
  | 'users'
  | 'admins'
  | 'revenue'
  | 'health'
  | 'analytics'
  | 'security'
  | 'settings'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const HERO_STATS = [
  {
    label: 'Total Users',
    value: '2,847,392',
    sub: '+12.4% this month',
    up: true,
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    shadow: 'rgba(59,130,246,0.35)',
  },
  {
    label: 'Active Today',
    value: '183,421',
    sub: '+8.1% vs yesterday',
    up: true,
    gradient: 'linear-gradient(135deg, #10B981, #047857)',
    shadow: 'rgba(16,185,129,0.35)',
  },
  {
    label: 'Monthly Revenue',
    value: '₹48.7L',
    sub: '+23.4% MoM',
    up: true,
    gradient: 'linear-gradient(135deg, #D4A853, #C9913A)',
    shadow: 'rgba(212,168,83,0.35)',
  },
  {
    label: 'System Uptime',
    value: '99.97%',
    sub: 'Last 90 days',
    up: true,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    shadow: 'rgba(139,92,246,0.35)',
  },
]

const SECOND_ROW_STATS = [
  { label: 'Total Families', value: '892,341', icon: Users, color: '#8B5CF6' },
  { label: 'SOS Today', value: '127', icon: AlertTriangle, color: '#EF4444' },
  { label: 'Geofences Active', value: '3.2M', icon: MapPin, color: '#10B981' },
]

const ROLE_BREAKDOWN = [
  { label: 'Users', count: '2.8M', pct: 97.8, color: '#3B82F6' },
  { label: 'Moderators', count: '24', pct: 0.8, color: '#F59E0B' },
  { label: 'Admins', count: '8', pct: 0.3, color: '#8B5CF6' },
  { label: 'Super Admins', count: '3', pct: 0.1, color: '#EC4899' },
]

const SYSTEM_EVENTS = [
  { type: 'user_registered', msg: 'New user: Priya Mehta joined from Mumbai', time: '2m ago', severity: 'info' },
  { type: 'sos_triggered', msg: 'SOS alert triggered by Arjun Sharma — resolved', time: '8m ago', severity: 'critical' },
  { type: 'payment_received', msg: 'Payment ₹499 received — Family Shield plan', time: '15m ago', severity: 'success' },
  { type: 'admin_action', msg: 'Admin Karan suspended user account #8821', time: '31m ago', severity: 'warning' },
  { type: 'system_backup', msg: 'Daily database backup completed successfully', time: '1h ago', severity: 'success' },
  { type: 'security_alert', msg: 'Multiple failed login attempts from IP 192.168.1.45', time: '2h ago', severity: 'critical' },
]

const MOCK_USERS = [
  { id: 1, name: 'Priya Mehta', email: 'priya@gmail.com', role: 'user', status: 'active', joined: '12 Jan 2024', avatar: 'PM' },
  { id: 2, name: 'Karan Sharma', email: 'karan@gmail.com', role: 'admin', status: 'active', joined: '5 Feb 2024', avatar: 'KS' },
  { id: 3, name: 'Ananya Iyer', email: 'ananya@gmail.com', role: 'user', status: 'suspended', joined: '20 Mar 2024', avatar: 'AI' },
  { id: 4, name: 'Rajesh Kumar', email: 'rajesh@outlook.com', role: 'moderator', status: 'active', joined: '3 Apr 2024', avatar: 'RK' },
  { id: 5, name: 'Sneha Patel', email: 'sneha@yahoo.com', role: 'user', status: 'active', joined: '18 Apr 2024', avatar: 'SP' },
  { id: 6, name: 'Amit Singh', email: 'amit@gmail.com', role: 'super_admin', status: 'active', joined: '1 Jan 2023', avatar: 'AS' },
  { id: 7, name: 'Divya Nair', email: 'divya@gmail.com', role: 'user', status: 'inactive', joined: '7 May 2024', avatar: 'DN' },
  { id: 8, name: 'Vikram Joshi', email: 'vikram@hotmail.com', role: 'moderator', status: 'active', joined: '22 May 2024', avatar: 'VJ' },
]

const MOCK_ADMINS = [
  { name: 'Karan Sharma', email: 'karan@gravity.app', role: 'admin', lastActive: '2 min ago', tickets: 1284, avatar: 'KS' },
  { name: 'Meena Kapoor', email: 'meena@gravity.app', role: 'admin', lastActive: '1h ago', tickets: 942, avatar: 'MK' },
  { name: 'Suresh Reddy', email: 'suresh@gravity.app', role: 'admin', lastActive: '3h ago', tickets: 773, avatar: 'SR' },
]

const MOCK_MODS = [
  { name: 'Rohan Das', email: 'rohan@gravity.app', role: 'moderator', lastActive: '5 min ago', tickets: 334, avatar: 'RD' },
  { name: 'Pooja Bansal', email: 'pooja@gravity.app', role: 'moderator', lastActive: '20 min ago', tickets: 289, avatar: 'PB' },
  { name: 'Aditya Rao', email: 'aditya@gravity.app', role: 'moderator', lastActive: '1h ago', tickets: 256, avatar: 'AR' },
  { name: 'Kavita Menon', email: 'kavita@gravity.app', role: 'moderator', lastActive: '2h ago', tickets: 198, avatar: 'KM' },
]

const REVENUE_MONTHS = [
  { month: 'Jan', value: 28.4 },
  { month: 'Feb', value: 31.2 },
  { month: 'Mar', value: 35.8 },
  { month: 'Apr', value: 38.1 },
  { month: 'May', value: 43.5 },
  { month: 'Jun', value: 48.7 },
]

const PLAN_BREAKDOWN = [
  { label: 'Guardian (Free)', pct: 60, color: '#6B7280', mrr: '—' },
  { label: 'Essential', pct: 25, color: '#3B82F6', mrr: '₹18.2L' },
  { label: 'Guardian Pro', pct: 10, color: '#8B5CF6', mrr: '₹19.5L' },
  { label: 'Family Shield', pct: 5, color: '#EC4899', mrr: '₹11.0L' },
]

const SERVICES = [
  { name: 'API Server', status: 'up', uptime: '99.98%', responseTime: '42ms', lastChecked: '10s ago', icon: Server },
  { name: 'Database', status: 'up', uptime: '99.99%', responseTime: '8ms', lastChecked: '10s ago', icon: Database },
  { name: 'Redis Cache', status: 'up', uptime: '99.95%', responseTime: '1ms', lastChecked: '10s ago', icon: Zap },
  { name: 'WebSocket', status: 'up', uptime: '99.91%', responseTime: '18ms', lastChecked: '10s ago', icon: Wifi },
  { name: 'Email Service', status: 'up', uptime: '99.87%', responseTime: '210ms', lastChecked: '10s ago', icon: Mail },
  { name: 'SMS Service', status: 'degraded', uptime: '98.42%', responseTime: '450ms', lastChecked: '10s ago', icon: MessageSquare },
]

const DAU_DATA = [
  { day: 'Mon', dau: 142 },
  { day: 'Tue', dau: 158 },
  { day: 'Wed', dau: 171 },
  { day: 'Thu', dau: 165 },
  { day: 'Fri', dau: 183 },
  { day: 'Sat', dau: 201 },
  { day: 'Sun', dau: 176 },
]

const TOP_LOCATIONS = [
  { city: 'Mumbai', users: 524821, pct: 84 },
  { city: 'Delhi', users: 412340, pct: 66 },
  { city: 'Bangalore', users: 381200, pct: 61 },
  { city: 'Hyderabad', users: 298450, pct: 48 },
  { city: 'Chennai', users: 241300, pct: 39 },
]

const FEATURE_USAGE = [
  { feature: 'Live Map', pct: 94, color: '#3B82F6' },
  { feature: 'SOS Alert', pct: 23, color: '#EF4444' },
  { feature: 'Geofence', pct: 67, color: '#10B981' },
  { feature: 'Family Chat', pct: 41, color: '#8B5CF6' },
]

const SECURITY_LOGS = [
  { time: '2025-06-13 09:14', event: 'failed_login', user: 'unknown@test.com', ip: '203.0.113.45', location: 'Russia', status: 'blocked' },
  { time: '2025-06-13 09:02', event: 'role_change', user: 'karan@gravity.app', ip: '10.0.0.4', location: 'Mumbai', status: 'success' },
  { time: '2025-06-13 08:51', event: 'login', user: 'amit@gravity.app', ip: '10.0.0.2', location: 'Delhi', status: 'success' },
  { time: '2025-06-13 08:33', event: 'password_reset', user: 'priya@gmail.com', ip: '103.21.58.12', location: 'Bangalore', status: 'success' },
  { time: '2025-06-13 07:45', event: 'failed_login', user: 'admin@test.io', ip: '185.220.101.9', location: 'Germany', status: 'blocked' },
  { time: '2025-06-13 07:12', event: 'logout', user: 'meena@gravity.app', ip: '10.0.0.5', location: 'Mumbai', status: 'success' },
  { time: '2025-06-13 06:58', event: 'login', user: 'suresh@gravity.app', ip: '10.0.0.6', location: 'Hyderabad', status: 'success' },
  { time: '2025-06-13 06:21', event: 'failed_login', user: 'root@evil.ru', ip: '91.108.4.10', location: 'Belarus', status: 'blocked' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PURPLE = '#8B5CF6'
const PURPLE_DARK = '#6D28D9'

function roleBadge(role: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    super_admin: { bg: 'rgba(236,72,153,0.15)', color: '#EC4899', label: 'Super Admin' },
    admin: { bg: 'rgba(139,92,246,0.15)', color: PURPLE, label: 'Admin' },
    moderator: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'Moderator' },
    user: { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA', label: 'User' },
  }
  const s = map[role] ?? map.user
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 99,
        border: `1px solid ${s.color}44`,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    suspended: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    inactive: { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF' },
    up: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    degraded: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    down: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    success: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    blocked: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
  }
  const s = map[status] ?? map.active
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 99,
        border: `1px solid ${s.color}33`,
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  )
}

function severityBadge(severity: string) {
  const map: Record<string, { bg: string; color: string }> = {
    info: { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA' },
    success: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    warning: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    critical: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
  }
  const s = map[severity] ?? map.info
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 99,
        border: `1px solid ${s.color}33`,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {severity}
    </span>
  )
}

function eventTypeBadge(type: string) {
  const map: Record<string, { bg: string; color: string }> = {
    login: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    logout: { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF' },
    failed_login: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
    password_reset: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    role_change: { bg: 'rgba(139,92,246,0.12)', color: PURPLE },
  }
  const s = map[type] ?? map.login
  const labels: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    failed_login: 'Failed Login',
    password_reset: 'Password Reset',
    role_change: 'Role Change',
  }
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 99,
        border: `1px solid ${s.color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      {labels[type] ?? type}
    </span>
  )
}

// ─── Glass Card ───────────────────────────────────────────────────────────────

function GlassCard({
  children,
  style,
  className,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {value}
    </motion.span>
  )
}

// ─── Resource Bar ─────────────────────────────────────────────────────────────

function ResourceBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pct}%</span>
      </div>
      <div
        style={{
          height: 8,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  )
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'command' as NavSection, label: 'Command Center', icon: Home },
  { id: 'users' as NavSection, label: 'All Users', icon: Users },
  { id: 'admins' as NavSection, label: 'Admins & Mods', icon: Shield },
  { id: 'revenue' as NavSection, label: 'Revenue', icon: DollarSign },
  { id: 'health' as NavSection, label: 'System Health', icon: Activity },
  { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart2 },
  { id: 'security' as NavSection, label: 'Security Logs', icon: Lock },
  { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const { user, logout } = useAuth()
  const [active, setActive] = useState<NavSection>('command')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [registrationsEnabled, setRegistrationsEnabled] = useState(true)
  const [sosEnabled, setSosEnabled] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')

  const superAdminName = user?.name ?? 'Super Admin'
  const initials = superAdminName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const filteredUsers = MOCK_USERS.filter((u) => {
    const matchSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter
    const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter
    return matchSearch && matchRole && matchStatus
  })

  // ── Sidebar ──

  const SidebarContent = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'rgba(10,6,24,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid rgba(139,92,246,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 15,
            color: '#fff',
            boxShadow: `0 4px 20px rgba(139,92,246,0.5)`,
            flexShrink: 0,
          }}
        >
          G
        </div>
        <div>
          <div
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '0.08em',
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            GRAVITY
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <span style={{ fontSize: 16 }}>👑</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                background: `linear-gradient(135deg, ${PURPLE}, #EC4899)`,
                color: '#fff',
                borderRadius: 4,
                padding: '1px 6px',
              }}
            >
              SUPER ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {NAV.map((item, i) => {
          const isActive = active === item.id
          const Icon = item.icon
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => {
                  setActive(item.id)
                  setSidebarOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  marginBottom: 2,
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  background: isActive
                    ? `linear-gradient(135deg, ${PURPLE}33, ${PURPLE_DARK}22)`
                    : 'transparent',
                  borderLeft: isActive ? `3px solid ${PURPLE}` : '3px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 13.5,
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
              </button>
            </motion.div>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(139,92,246,0.15)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: '#EF4444',
            cursor: 'pointer',
            fontSize: 13.5,
            fontWeight: 500,
            transition: 'background 0.18s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={17} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )

  // ── Sections ──

  const CommandCenter = () => {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true })
    return (
      <div ref={ref}>
        {/* Hero Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          {HERO_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              style={{
                borderRadius: 18,
                padding: 20,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: stat.gradient,
                  opacity: 0.12,
                  filter: 'blur(24px)',
                }}
              />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontWeight: 500 }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#fff',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                <AnimatedNumber value={stat.value} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {stat.up ? (
                  <ArrowUpRight size={14} color="#10B981" />
                ) : (
                  <ArrowDownRight size={14} color="#EF4444" />
                )}
                <span style={{ fontSize: 12, color: stat.up ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                  {stat.sub}
                </span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: stat.gradient,
                  borderRadius: '0 0 18px 18px',
                  opacity: 0.7,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Second row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          {SECOND_ROW_STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35 + i * 0.07 }}
                style={{
                  borderRadius: 14,
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${stat.color}18`,
                    border: `1px solid ${stat.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{stat.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Role breakdown + Events */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Role Breakdown</div>
            {/* Horizontal bar */}
            <div
              style={{
                height: 32,
                borderRadius: 99,
                overflow: 'hidden',
                display: 'flex',
                marginBottom: 16,
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              {ROLE_BREAKDOWN.map((r, i) => (
                <motion.div
                  key={r.label}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${r.pct}%` } : {}}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                  title={`${r.label}: ${r.count}`}
                  style={{
                    height: '100%',
                    background: r.color,
                    minWidth: r.pct < 2 ? 8 : undefined,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {ROLE_BREAKDOWN.map((r) => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                    {r.label} <span style={{ color: '#fff', fontWeight: 600 }}>({r.count})</span>
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Recent System Events</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SYSTEM_EVENTS.map((ev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.06 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    paddingBottom: 10,
                    borderBottom: i < SYSTEM_EVENTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>{ev.msg}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{ev.time}</div>
                  </div>
                  {severityBadge(ev.severity)}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  const AllUsers = () => (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={userRoleFilter}
          onChange={(e) => setUserRoleFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all" style={{ background: '#1a1030' }}>All Roles</option>
          <option value="user" style={{ background: '#1a1030' }}>User</option>
          <option value="moderator" style={{ background: '#1a1030' }}>Moderator</option>
          <option value="admin" style={{ background: '#1a1030' }}>Admin</option>
          <option value="super_admin" style={{ background: '#1a1030' }}>Super Admin</option>
        </select>
        <select
          value={userStatusFilter}
          onChange={(e) => setUserStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all" style={{ background: '#1a1030' }}>All Status</option>
          <option value="active" style={{ background: '#1a1030' }}>Active</option>
          <option value="suspended" style={{ background: '#1a1030' }}>Suspended</option>
          <option value="inactive" style={{ background: '#1a1030' }}>Inactive</option>
        </select>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none',
              background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: `0 4px 14px rgba(139,92,246,0.4)`,
            }}
          >
            <Plus size={14} /> Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <GlassCard style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.35)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {u.avatar}
                      </div>
                      <span style={{ fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>{roleBadge(u.role)}</td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(u.status)}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{u.joined}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[{ icon: Eye, tip: 'View', color: '#60A5FA' }, { icon: Edit, tip: 'Edit', color: '#F59E0B' }, { icon: Ban, tip: 'Suspend', color: '#F97316' }, { icon: Trash2, tip: 'Delete', color: '#EF4444' }].map(
                        ({ icon: Icon, tip, color }) => (
                          <button
                            key={tip}
                            title={tip}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
                              border: `1px solid ${color}22`,
                              background: `${color}12`,
                              color,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = `${color}28`; e.currentTarget.style.borderColor = `${color}44` }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}22` }}
                          >
                            <Icon size={13} />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          <span>Showing 1–{filteredUsers.length} of 2,847,392 users</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, '...', 284739].map((p, i) => (
              <button
                key={i}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: `1px solid ${p === 1 ? PURPLE : 'rgba(255,255,255,0.1)'}`,
                  background: p === 1 ? `${PURPLE}22` : 'transparent',
                  color: p === 1 ? PURPLE : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: p === 1 ? 700 : 400,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  )

  const AdminsMods = () => (
    <div>
      {/* Admins */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Admins</span>
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                fontWeight: 700,
                background: `${PURPLE}22`,
                color: PURPLE,
                borderRadius: 99,
                padding: '2px 8px',
                border: `1px solid ${PURPLE}33`,
              }}
            >
              8
            </span>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              border: 'none',
              background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: `0 4px 14px rgba(139,92,246,0.4)`,
            }}
            onClick={() => setShowAddAdminModal(true)}
          >
            <Plus size={14} /> Add Admin
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {MOCK_ADMINS.map((a, i) => (
            <motion.div
              key={a.email}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                      boxShadow: `0 4px 14px rgba(139,92,246,0.35)`,
                    }}
                  >
                    {a.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{a.email}</div>
                    {roleBadge(a.role)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  <span>Last active: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{a.lastActive}</span></span>
                  <span>Tickets: <span style={{ color: '#fff', fontWeight: 600 }}>{a.tickets.toLocaleString()}</span></span>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '7px 12px',
                    borderRadius: 9,
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.07)',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)' }}
                >
                  Revoke Access
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Moderators */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Moderators</span>
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(245,158,11,0.15)',
                color: '#F59E0B',
                borderRadius: 99,
                padding: '2px 8px',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              24
            </span>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
            }}
          >
            <Plus size={14} /> Add Moderator
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {MOCK_MODS.map((m, i) => (
            <motion.div
              key={m.email}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <GlassCard style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {m.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{m.email}</div>
                  </div>
                  {roleBadge(m.role)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  <span>Active: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{m.lastActive}</span></span>
                  <span>Tickets: <span style={{ color: '#fff', fontWeight: 600 }}>{m.tickets}</span></span>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(239,68,68,0.25)',
                    background: 'rgba(239,68,68,0.06)',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Revoke Access
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Admin Modal / static form */}
      <AnimatePresence>
        {showAddAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowAddAdminModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1a1030',
                border: `1px solid ${PURPLE}44`,
                borderRadius: 20,
                padding: 28,
                width: '100%',
                maxWidth: 420,
                boxShadow: `0 24px 80px rgba(139,92,246,0.3)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Add New Admin
                </div>
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              {[
                { label: 'Full Name', placeholder: 'Karan Sharma', type: 'text' },
                { label: 'Email Address', placeholder: 'admin@gravity.app', type: 'email' },
                { label: 'Temporary Password', placeholder: '••••••••', type: 'password' },
              ].map((field) => (
                <div key={field.label} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                  Role
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="admin" style={{ background: '#1a1030' }}>Admin</option>
                  <option value="moderator" style={{ background: '#1a1030' }}>Moderator</option>
                </select>
              </div>
              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: `0 6px 20px rgba(139,92,246,0.4)`,
                }}
              >
                Create Admin Account
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const Revenue = () => {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true })
    const maxRevenue = Math.max(...REVENUE_MONTHS.map((m) => m.value))
    return (
      <div ref={ref}>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total MRR', value: '₹48.7L', sub: '+23.4% MoM', color: PURPLE },
            { label: 'ARR', value: '₹5.8Cr', sub: 'Annualised', color: '#10B981' },
            { label: 'Avg ARPU', value: '₹312', sub: 'Per paying user', color: '#F59E0B' },
            { label: 'Paying Users', value: '1.56L', sub: '54.8% of active', color: '#3B82F6' },
          ].map((kpi) => (
            <GlassCard key={kpi.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, color: kpi.color, fontWeight: 600 }}>{kpi.sub}</div>
            </GlassCard>
          ))}
        </div>

        {/* Chart */}
        <GlassCard style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Monthly Revenue (₹L)</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
            {REVENUE_MONTHS.map((m, i) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{m.value}L</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(m.value / maxRevenue) * 100}px` } : {}}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  style={{
                    width: '100%',
                    borderRadius: '6px 6px 0 0',
                    background:
                      i === REVENUE_MONTHS.length - 1
                        ? `linear-gradient(180deg, ${PURPLE}, ${PURPLE_DARK})`
                        : 'rgba(139,92,246,0.35)',
                    boxShadow: i === REVENUE_MONTHS.length - 1 ? `0 0 18px rgba(139,92,246,0.5)` : 'none',
                  }}
                />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{m.month}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Plan breakdown */}
        <GlassCard style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Plan Breakdown</div>
          {PLAN_BREAKDOWN.map((p) => (
            <div key={p.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{p.label}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {p.pct}% · <span style={{ color: '#fff', fontWeight: 600 }}>{p.mrr}</span>
                </span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${p.pct}%` } : {}}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: p.color, borderRadius: 99 }}
                />
              </div>
            </div>
          ))}
        </GlassCard>

        {/* Payment stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'Razorpay Transactions', value: '18,432', sub: 'This month', color: '#3B82F6' },
            { label: 'Refund Rate', value: '1.2%', sub: '42 refunds', color: '#EF4444' },
            { label: 'Failed Payments', value: '0.8%', sub: '28 failed', color: '#F59E0B' },
            { label: 'Avg Transaction', value: '₹384', sub: 'Per order', color: '#10B981' },
          ].map((s) => (
            <GlassCard key={s.label} style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 3 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sub}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    )
  }

  const SystemHealth = () => (
    <div>
      {/* Services */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 24 }}>
        {SERVICES.map((svc, i) => {
          const Icon = svc.icon
          const isUp = svc.status === 'up'
          const isDeg = svc.status === 'degraded'
          return (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <GlassCard style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: isUp ? 'rgba(16,185,129,0.12)' : isDeg ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                        border: `1px solid ${isUp ? '#10B981' : isDeg ? '#F59E0B' : '#EF4444'}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} color={isUp ? '#10B981' : isDeg ? '#F59E0B' : '#EF4444'} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{svc.name}</span>
                  </div>
                  {statusBadge(svc.status)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14, fontSize: 12 }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Uptime</div>
                    <div style={{ color: '#fff', fontWeight: 700 }}>{svc.uptime}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Response</div>
                    <div style={{ color: '#fff', fontWeight: 700 }}>{svc.responseTime}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Last: {svc.lastChecked}</span>
                  <button
                    style={{
                      padding: '5px 10px',
                      borderRadius: 7,
                      border: '1px solid rgba(239,68,68,0.25)',
                      background: 'rgba(239,68,68,0.07)',
                      color: '#EF4444',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                    onClick={() => window.confirm(`Restart ${svc.name}?`)}
                  >
                    Restart
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Resources */}
      <GlassCard style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Server Resources</div>
        <ResourceBar label="CPU Usage" pct={34} color="#3B82F6" />
        <ResourceBar label="RAM Usage" pct={67} color={PURPLE} />
        <ResourceBar label="Disk Usage" pct={41} color="#10B981" />
      </GlassCard>
    </div>
  )

  const Analytics = () => {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true })
    const maxDau = Math.max(...DAU_DATA.map((d) => d.dau))
    return (
      <div ref={ref}>
        {/* DAU chart */}
        <GlassCard style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Daily Active Users (K)</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>This week</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <span>MAU: <strong style={{ color: '#fff' }}>2.19M</strong></span>
              <span>DAU/MAU: <strong style={{ color: PURPLE }}>8.4%</strong></span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {DAU_DATA.map((d, i) => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{d.dau}K</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(d.dau / maxDau) * 90}px` } : {}}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                  style={{
                    width: '100%',
                    borderRadius: '5px 5px 0 0',
                    background: i === 4 ? `linear-gradient(180deg, ${PURPLE}, ${PURPLE_DARK})` : `${PURPLE}40`,
                    boxShadow: i === 4 ? `0 0 14px rgba(139,92,246,0.4)` : 'none',
                  }}
                />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{d.day}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Retention */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Retention Rates</div>
            {[
              { label: 'Day 1', pct: 78, color: '#10B981' },
              { label: 'Day 7', pct: 52, color: '#F59E0B' },
              { label: 'Day 30', pct: 31, color: '#EF4444' },
            ].map((r) => (
              <div key={r.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{r.label} Retention</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.pct}%</span>
                </div>
                <div style={{ height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${r.pct}%` } : {}}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    style={{ height: '100%', background: r.color, borderRadius: 99 }}
                  />
                </div>
              </div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Top Locations</div>
            {TOP_LOCATIONS.map((loc) => (
              <div key={loc.city} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{loc.city}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{(loc.users / 1000).toFixed(0)}K</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${loc.pct}%` } : {}}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    style={{ height: '100%', background: PURPLE, borderRadius: 99 }}
                  />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Feature usage */}
        <GlassCard style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Feature Adoption</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {FEATURE_USAGE.map((f) => (
              <div key={f.feature} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: `conic-gradient(${f.color} ${f.pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: '#0d0920',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#fff',
                    }}
                  >
                    {f.pct}%
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{f.feature}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    )
  }

  const SecurityLogs = () => (
    <div>
      <GlassCard style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Timestamp', 'Event', 'User', 'IP Address', 'Location', 'Status'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.35)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECURITY_LOGS.map((log, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background:
                      log.status === 'blocked'
                        ? 'rgba(239,68,68,0.04)'
                        : log.event === 'role_change'
                        ? 'rgba(139,92,246,0.04)'
                        : 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      log.status === 'blocked'
                        ? 'rgba(239,68,68,0.04)'
                        : log.event === 'role_change'
                        ? 'rgba(139,92,246,0.04)'
                        : 'transparent'
                  }}
                >
                  <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>
                    {log.time}
                  </td>
                  <td style={{ padding: '11px 16px' }}>{eventTypeBadge(log.event)}</td>
                  <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{log.user}</td>
                  <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {log.ip}
                  </td>
                  <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{log.location}</td>
                  <td style={{ padding: '11px 16px' }}>{statusBadge(log.status)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )

  const AppSettings = () => {
    const Toggle = ({
      label,
      value,
      onChange,
      desc,
    }: {
      label: string
      value: boolean
      onChange: (v: boolean) => void
      desc?: string
    }) => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{label}</div>
          {desc && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{desc}</div>}
        </div>
        <button
          onClick={() => onChange(!value)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 99,
            border: 'none',
            background: value ? PURPLE : 'rgba(255,255,255,0.12)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.25s',
            flexShrink: 0,
            boxShadow: value ? `0 0 10px rgba(139,92,246,0.5)` : 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 3,
              left: value ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.25s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          />
        </button>
      </div>
    )

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* App Config */}
        <GlassCard style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>App Configuration</div>
          <Toggle
            label="Maintenance Mode"
            desc="Blocks all user access with a maintenance screen"
            value={maintenanceMode}
            onChange={setMaintenanceMode}
          />
          <Toggle
            label="New Registrations"
            desc="Allow new users to sign up"
            value={registrationsEnabled}
            onChange={setRegistrationsEnabled}
          />
          <Toggle
            label="SOS Alerts"
            desc="Enable emergency SOS alert system globally"
            value={sosEnabled}
            onChange={setSosEnabled}
          />
          <div style={{ marginTop: 18 }}>
            <button
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: `0 4px 14px rgba(139,92,246,0.35)`,
              }}
            >
              Save Settings
            </button>
          </div>
        </GlassCard>

        {/* Email Config */}
        <GlassCard style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Email Configuration (SMTP)</div>
          {[
            { label: 'SMTP Host', placeholder: 'smtp.mailgun.org', type: 'text' },
            { label: 'SMTP Port', placeholder: '587', type: 'number' },
            { label: 'SMTP Username', placeholder: 'postmaster@mg.gravity.app', type: 'email' },
            { label: 'SMTP Password', placeholder: '••••••••••••', type: 'password' },
            { label: 'From Address', placeholder: 'no-reply@gravity.app', type: 'email' },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
                {f.label}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 9,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
          <button
            style={{
              marginTop: 6,
              padding: '9px 18px',
              borderRadius: 9,
              border: 'none',
              background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Save SMTP Config
          </button>
        </GlassCard>

        {/* Danger Zone — full width */}
        <GlassCard
          style={{
            padding: 22,
            gridColumn: '1 / -1',
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <AlertTriangle size={18} color="#EF4444" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#EF4444' }}>Danger Zone</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 18, lineHeight: 1.5 }}>
            These actions are irreversible or high-impact. Proceed with caution.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Clear Cache', icon: RefreshCw, action: 'This will clear all Redis cache. Users may experience slower load times temporarily.' },
              { label: 'Force Logout All Users', icon: LogOut, action: 'All active sessions will be terminated immediately.' },
              { label: 'Database Backup', icon: Database, action: 'Trigger an immediate database backup. This may take a few minutes.' },
            ].map((btn) => {
              const Icon = btn.icon
              return (
                <button
                  key={btn.label}
                  onClick={() => window.confirm(btn.action)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '9px 18px',
                    borderRadius: 10,
                    border: '1px solid rgba(239,68,68,0.4)',
                    background: 'rgba(239,68,68,0.1)',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                >
                  <Icon size={14} />
                  {btn.label}
                </button>
              )
            })}
          </div>
        </GlassCard>
      </div>
    )
  }

  const renderSection = () => {
    switch (active) {
      case 'command': return <CommandCenter />
      case 'users': return <AllUsers />
      case 'admins': return <AdminsMods />
      case 'revenue': return <Revenue />
      case 'health': return <SystemHealth />
      case 'analytics': return <Analytics />
      case 'security': return <SecurityLogs />
      case 'settings': return <AppSettings />
      default: return <CommandCenter />
    }
  }

  const sectionLabel = NAV.find((n) => n.id === active)?.label ?? 'Command Center'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.6); }
        @media (max-width: 768px) {
          .super-admin-sidebar { display: none !important; }
          .super-admin-mobile-bottom { display: flex !important; }
          .super-admin-main-content { padding-bottom: 72px !important; }
        }
        @media (min-width: 769px) {
          .super-admin-mobile-bottom { display: none !important; }
          .super-admin-hamburger { display: none !important; }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: '#0a0618',
          fontFamily: 'Inter, sans-serif',
          color: '#fff',
        }}
      >
        {/* Desktop Sidebar */}
        <div
          className="super-admin-sidebar"
          style={{
            width: 240,
            flexShrink: 0,
            borderRight: `1px solid rgba(139,92,246,0.15)`,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          <SidebarContent />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }}
              />
              <motion.div
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                exit={{ x: -240 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: 240,
                  height: '100vh',
                  zIndex: 50,
                  borderRight: `1px solid rgba(139,92,246,0.2)`,
                  overflowY: 'auto',
                }}
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* ── TOP HEADER ── */}
          <header
            style={{
              height: 62,
              borderBottom: `1px solid rgba(139,92,246,0.15)`,
              background: 'rgba(10,6,24,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: 12,
              position: 'sticky',
              top: 0,
              zIndex: 30,
            }}
          >
            {/* Hamburger */}
            <button
              className="super-admin-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <Menu size={22} />
            </button>

            {/* Logo + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#fff',
                  boxShadow: `0 4px 14px rgba(139,92,246,0.5)`,
                  flexShrink: 0,
                }}
              >
                G
              </div>
              <div>
                <span
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: '0.07em',
                    color: '#fff',
                  }}
                >
                  GRAVITY
                </span>
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${PURPLE}, #EC4899)`,
                    color: '#fff',
                    borderRadius: 5,
                    padding: '2px 7px',
                    letterSpacing: '0.05em',
                    verticalAlign: 'middle',
                  }}
                >
                  👑 Super Admin
                </span>
              </div>
            </div>

            {/* Center — system health */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}
              />
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>All Systems Operational</span>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{superAdminName}</span>
                <span style={{ fontSize: 10, color: PURPLE, fontWeight: 600, letterSpacing: '0.04em' }}>SUPER ADMIN</span>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${PURPLE}, #EC4899)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: `0 2px 12px rgba(139,92,246,0.5)`,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#EF4444',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              >
                <LogOut size={14} />
                <span className="super-admin-hamburger" style={{ display: 'inline' }}>Logout</span>
              </button>
            </div>
          </header>

          {/* ── MAIN CONTENT ── */}
          <main
            className="super-admin-main-content"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 24,
              background: '#0a0618',
            }}
          >
            {/* Section header */}
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ marginBottom: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(() => {
                  const nav = NAV.find((n) => n.id === active)
                  if (!nav) return null
                  const Icon = nav.icon
                  return (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `${PURPLE}20`,
                        border: `1px solid ${PURPLE}35`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} color={PURPLE} />
                    </div>
                  )
                })()}
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 800,
                      color: '#fff',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      lineHeight: 1.2,
                    }}
                  >
                    {sectionLabel}
                  </h1>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                    GRAVITY Super Admin Control Center
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* ── MOBILE BOTTOM TABS ── */}
        <div
          className="super-admin-mobile-bottom"
          style={{
            display: 'none',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            background: 'rgba(10,6,24,0.97)',
            borderTop: `1px solid rgba(139,92,246,0.2)`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 30,
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px',
          }}
        >
          {NAV.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? PURPLE : 'rgba(255,255,255,0.35)',
                  minWidth: 52,
                  padding: '8px 4px',
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>
                  {item.label.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
