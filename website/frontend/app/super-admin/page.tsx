'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'
import PanelBackground from '@/components/effects/PanelBackground'
import ThemeToggle from '@/components/ui/ThemeToggle'
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
  Users2,
  Smartphone,
  CreditCard,
  FileText,
  Building2,
  Key,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type NavSection =
  | 'command'
  | 'users'
  | 'families'
  | 'devices'
  | 'admins'
  | 'sos'
  | 'revenue'
  | 'subscriptions'
  | 'plans'
  | 'geofences'
  | 'notifications'
  | 'support'
  | 'health'
  | 'analytics'
  | 'security'
  | 'audit'
  | 'enterprise'
  | 'whitelabel'
  | 'api'
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
  { id: 'families' as NavSection, label: 'Families', icon: Users2 },
  { id: 'devices' as NavSection, label: 'Devices', icon: Smartphone },
  { id: 'admins' as NavSection, label: 'Admins & Mods', icon: Shield },
  { id: 'sos' as NavSection, label: 'SOS Alerts', icon: AlertTriangle },
  { id: 'revenue' as NavSection, label: 'Revenue', icon: DollarSign },
  { id: 'subscriptions' as NavSection, label: 'Subscriptions', icon: CreditCard },
  { id: 'plans' as NavSection, label: 'Plans', icon: Zap },
  { id: 'geofences' as NavSection, label: 'Geofences', icon: MapPin },
  { id: 'notifications' as NavSection, label: 'Notifications', icon: Bell },
  { id: 'support' as NavSection, label: 'Support Tickets', icon: MessageSquare },
  { id: 'health' as NavSection, label: 'System Health', icon: Activity },
  { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart2 },
  { id: 'security' as NavSection, label: 'Security Logs', icon: Lock },
  { id: 'audit' as NavSection, label: 'Audit Logs', icon: FileText },
  { id: 'enterprise' as NavSection, label: 'Enterprise', icon: Building2 },
  { id: 'whitelabel' as NavSection, label: 'White Label', icon: Globe },
  { id: 'api' as NavSection, label: 'API & Keys', icon: Key },
  { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
]

// Grouped nav for Linear-style sidebar (same pattern as admin)
const NAV_GROUPS_SA = [
  // Core
  [
    { id: 'command' as NavSection, label: 'Command Center', icon: Home },
    { id: 'users' as NavSection, label: 'All Users', icon: Users },
    { id: 'families' as NavSection, label: 'Families', icon: Users2 },
    { id: 'devices' as NavSection, label: 'Devices', icon: Smartphone },
    { id: 'admins' as NavSection, label: 'Admins & Mods', icon: Shield },
  ],
  // Operations
  [
    { id: 'sos' as NavSection, label: 'SOS Alerts', icon: AlertTriangle },
    { id: 'geofences' as NavSection, label: 'Geofences', icon: MapPin },
    { id: 'notifications' as NavSection, label: 'Notifications', icon: Bell },
    { id: 'support' as NavSection, label: 'Support Tickets', icon: MessageSquare },
  ],
  // Revenue
  [
    { id: 'revenue' as NavSection, label: 'Revenue', icon: DollarSign },
    { id: 'subscriptions' as NavSection, label: 'Subscriptions', icon: CreditCard },
    { id: 'plans' as NavSection, label: 'Plans', icon: Zap },
    { id: 'enterprise' as NavSection, label: 'Enterprise', icon: Building2 },
    { id: 'whitelabel' as NavSection, label: 'White Label', icon: Globe },
  ],
  // System
  [
    { id: 'health' as NavSection, label: 'System Health', icon: Activity },
    { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart2 },
    { id: 'security' as NavSection, label: 'Security Logs', icon: Lock },
    { id: 'audit' as NavSection, label: 'Audit Logs', icon: FileText },
    { id: 'api' as NavSection, label: 'API & Keys', icon: Key },
    { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
  ],
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

  // ── API state ──
  const [platformStats, setPlatformStats] = useState<any>(null)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [sosData, setSosData] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  function getAuthToken(): string {
    if (typeof document === 'undefined') return ''
    return (
      document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('gv_token='))
        ?.split('=')[1] ||
      localStorage.getItem('gv_token') ||
      ''
    )
  }

  function fetchUsers(search = '') {
    setUsersLoading(true)
    const token = getAuthToken()
    fetch('/super-admin-api/users?limit=50&search=' + encodeURIComponent(search), {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((r) => r.json())
      .then((d) => setAllUsers(d.users || []))
      .catch(() => {})
      .finally(() => setUsersLoading(false))
  }

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return

    // Fetch platform stats
    fetch('/super-admin-api/stats', { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => r.json())
      .then((d) => setPlatformStats(d))
      .catch(() => {})

    // Fetch users
    fetchUsers()

    // Fetch SOS alerts
    fetch('/super-admin-api/sos?status=all&limit=20', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((r) => r.json())
      .then((d) => setSosData(d.alerts || []))
      .catch(() => {})
  }, [])

  const superAdminName = user?.name ?? 'Super Admin'
  const initials = superAdminName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const filteredUsers = (allUsers.length > 0 ? allUsers : MOCK_USERS).filter((u) => {
    const uName = u.name || ''
    const uEmail = u.email || ''
    const uStatus = u.status || (u.is_active === false ? 'inactive' : u.is_active === true ? 'active' : 'active')
    const matchSearch =
      !userSearch ||
      uName.toLowerCase().includes(userSearch.toLowerCase()) ||
      uEmail.toLowerCase().includes(userSearch.toLowerCase())
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter
    const matchStatus = userStatusFilter === 'all' || uStatus === userStatusFilter
    return matchSearch && matchRole && matchStatus
  })

  // ── Sidebar ──

  const SidebarContent = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '16px 12px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Crown size={18} color="var(--gold)" strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            Gravity
          </span>
          <sup
            style={{
              fontSize: 9,
              fontWeight: 600,
              textTransform: 'uppercase',
              background: 'rgba(212,168,83,0.12)',
              color: 'var(--gold)',
              padding: '2px 5px',
              borderRadius: 4,
              letterSpacing: '0.04em',
              lineHeight: 1.4,
            }}
          >
            Super Admin
          </sup>
        </div>
        <input
          type="text"
          placeholder="Jump to..."
          readOnly
          style={{
            width: '100%',
            height: 28,
            fontSize: 12,
            padding: '0 10px',
            background: 'var(--bg-surface2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            outline: 'none',
            boxSizing: 'border-box',
            cursor: 'default',
          }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {NAV_GROUPS_SA.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && (
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 12px' }} />
            )}
            {group.map((item) => {
              const isActive = active === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => { setActive(item.id); setSidebarOpen(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: isActive ? 'calc(100% - 14px)' : 'calc(100% - 16px)',
                    height: 32,
                    padding: '0 8px',
                    borderRadius: 6,
                    margin: isActive ? '1px 8px 1px 6px' : '1px 8px',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--bg-surface2)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    textAlign: 'left',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-surface2)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <Icon size={14} color={isActive ? 'var(--gold)' : 'var(--text-muted)'} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom — user + logout */}
      <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gold), #92400e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {superAdminName}
            </div>
            <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.04em' }}>SUPER ADMIN</div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  // ── Sections ──

  const CommandCenter = () => {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true })
    const liveHeroStats = HERO_STATS.map((stat) => {
      if (stat.label === 'Total Users' && platformStats?.total_users != null)
        return { ...stat, value: platformStats.total_users.toLocaleString() }
      if (stat.label === 'Monthly Revenue' && platformStats?.mrr_inr != null)
        return { ...stat, value: '₹' + (platformStats.mrr_inr / 100000).toFixed(1) + 'L' }
      return stat
    })
    const liveSecondRow = SECOND_ROW_STATS.map((stat) => {
      if (stat.label === 'Total Families' && platformStats?.total_families != null)
        return { ...stat, value: platformStats.total_families.toLocaleString() }
      if (stat.label === 'SOS Today' && platformStats?.active_sos != null)
        return { ...stat, value: String(platformStats.active_sos) }
      return stat
    })
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
          {liveHeroStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.2 }}
              style={{
                borderRadius: 12,
                padding: 20,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.15s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
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
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
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
          {liveSecondRow.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.2 }}
                style={{
                  borderRadius: 12,
                  padding: '16px 20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transition: 'transform 0.15s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
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
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
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
                  style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
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
                        {u.avatar || (u.name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>{u.name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>{u.email || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>{roleBadge(u.role || 'user')}</td>
                  <td style={{ padding: '12px 16px' }}>{statusBadge(u.status || (u.is_active === false ? 'inactive' : 'active'))}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{u.joined || (u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')}</td>
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
          <span>Showing 1–{filteredUsers.length} of {platformStats?.total_users != null ? platformStats.total_users.toLocaleString() : '2,847,392'} users</span>
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
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                {['Timestamp', 'Event', 'User', 'IP Address', 'Location', 'Status'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
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
                    borderBottom: '1px solid var(--border)',
                    height: 40,
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
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

  const Families = () => {
    const familyStats = [
      { label: 'Total Families', value: '892,341', color: PURPLE },
      { label: 'Free Plan', value: '45%', color: '#6B7280' },
      { label: 'Premium', value: '35%', color: '#3B82F6' },
      { label: 'Family+', value: '20%', color: '#10B981' },
    ]
    const families = [
      { name: 'Sharma Family', owner: 'Rajesh Sharma', members: 5, plan: 'Family+', created: '12 Jan 2024' },
      { name: 'Mehta Household', owner: 'Sunil Mehta', members: 4, plan: 'Premium', created: '5 Feb 2024' },
      { name: 'Iyer Circle', owner: 'Venkat Iyer', members: 6, plan: 'Family+', created: '20 Mar 2024' },
      { name: 'Patel Group', owner: 'Hiren Patel', members: 3, plan: 'Free', created: '3 Apr 2024' },
      { name: 'Gupta Family', owner: 'Deepak Gupta', members: 5, plan: 'Premium', created: '18 Apr 2024' },
      { name: 'Nair Household', owner: 'Pradeep Nair', members: 4, plan: 'Free', created: '2 May 2024' },
      { name: 'Reddy Circle', owner: 'Suresh Reddy', members: 7, plan: 'Family+', created: '15 May 2024' },
      { name: 'Joshi Family', owner: 'Ankit Joshi', members: 3, plan: 'Premium', created: '28 May 2024' },
    ]
    const planColor = (plan: string) => {
      if (plan === 'Family+') return '#10B981'
      if (plan === 'Premium') return '#3B82F6'
      return '#6B7280'
    }
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {familyStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
          <select style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option style={{ background: '#1a1030' }}>All Plans</option>
            <option style={{ background: '#1a1030' }}>Free</option>
            <option style={{ background: '#1a1030' }}>Premium</option>
            <option style={{ background: '#1a1030' }}>Family+</option>
          </select>
          <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <Plus size={14} /> Add Family
          </button>
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['Family Name', 'Owner', 'Members', 'Plan', 'Created', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {families.map((f, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{f.name}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{f.owner}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{f.members}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: `${planColor(f.plan)}20`, color: planColor(f.plan), fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: `1px solid ${planColor(f.plan)}44` }}>{f.plan}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{f.created}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[{ icon: Eye, color: '#60A5FA', tip: 'View' }, { icon: Edit, color: '#F59E0B', tip: 'Edit' }, { icon: Trash2, color: '#EF4444', tip: 'Delete' }].map(({ icon: Icon, color, tip }) => (
                          <button key={tip} title={tip} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${color}22`, background: `${color}12`, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={13} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const Devices = () => {
    const deviceStats = [
      { label: 'Total Devices', value: '1,847,293', color: PURPLE },
      { label: 'iOS', value: '52%', color: '#3B82F6' },
      { label: 'Android', value: '47%', color: '#10B981' },
      { label: 'Low Battery', value: '8,234', color: '#F59E0B' },
      { label: 'Offline', value: '23,891', color: '#EF4444' },
    ]
    const devices = [
      { name: 'iPhone 14 Pro', user: 'Priya Mehta', os: 'iOS 17.4', battery: 87, status: 'active', lastSeen: '2m ago' },
      { name: 'Samsung S23 Ultra', user: 'Karan Sharma', os: 'Android 14', battery: 34, status: 'active', lastSeen: '5m ago' },
      { name: 'OnePlus 11', user: 'Ananya Iyer', os: 'Android 14', battery: 12, status: 'active', lastSeen: '12m ago' },
      { name: 'iPhone 13', user: 'Rajesh Kumar', os: 'iOS 16.7', battery: 65, status: 'inactive', lastSeen: '2h ago' },
      { name: 'Pixel 8', user: 'Sneha Patel', os: 'Android 14', battery: 91, status: 'active', lastSeen: '1m ago' },
      { name: 'iPhone 15', user: 'Divya Nair', os: 'iOS 17.5', battery: 0, status: 'inactive', lastSeen: '1d ago' },
      { name: 'Redmi Note 12', user: 'Vikram Joshi', os: 'Android 13', battery: 55, status: 'active', lastSeen: '8m ago' },
      { name: 'Vivo V27', user: 'Meena Kapoor', os: 'Android 13', battery: 78, status: 'active', lastSeen: '3m ago' },
    ]
    const batteryColor = (b: number) => b > 50 ? '#10B981' : b > 20 ? '#F59E0B' : '#EF4444'
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
          {deviceStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['Device Name', 'User', 'OS', 'Battery', 'Status', 'Last Seen'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devices.map((d, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Smartphone size={14} color={PURPLE} />
                        {d.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{d.user}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{d.os}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${d.battery}%`, height: '100%', background: batteryColor(d.battery), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: batteryColor(d.battery), fontWeight: 600 }}>{d.battery}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{statusBadge(d.status)}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>{d.lastSeen}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const SOSAlerts = () => {
    const resolvedCount = sosData.length > 0 ? sosData.filter((a) => (a.status || '').toUpperCase() === 'RESOLVED').length : 98
    const pendingCount = sosData.length > 0 ? sosData.filter((a) => (a.status || '').toUpperCase() !== 'RESOLVED').length : 29
    const sosStats = [
      { label: 'Total SOS Today', value: platformStats?.active_sos != null ? String(platformStats.active_sos) : '127', color: '#EF4444' },
      { label: 'Resolved', value: String(resolvedCount), color: '#10B981' },
      { label: 'Pending', value: String(pendingCount), color: '#F59E0B' },
      { label: 'Avg Response', value: '43s', color: PURPLE },
    ]
    // Use live sosData if available, otherwise fall back to mock data
    const displayAlerts = sosData.length > 0 ? sosData : [
      { id: 'SOS-4821', user_name: 'Priya Mehta', place_name: 'Andheri, Mumbai', triggered_at: '09:14 AM', status: 'RESOLVED' },
      { id: 'SOS-4820', user_name: 'Ajay Verma', place_name: 'CP, Delhi', triggered_at: '09:02 AM', status: 'CRITICAL' },
      { id: 'SOS-4819', user_name: 'Riya Singh', place_name: 'Koramangala, Bangalore', triggered_at: '08:51 AM', status: 'RESOLVED' },
      { id: 'SOS-4818', user_name: 'Suresh Kumar', place_name: 'Banjara Hills, Hyderabad', triggered_at: '08:33 AM', status: 'PENDING' },
      { id: 'SOS-4817', user_name: 'Pooja Das', place_name: 'T Nagar, Chennai', triggered_at: '08:20 AM', status: 'RESOLVED' },
      { id: 'SOS-4816', user_name: 'Amit Jain', place_name: 'Viman Nagar, Pune', triggered_at: '07:58 AM', status: 'CRITICAL' },
      { id: 'SOS-4815', user_name: 'Neha Gupta', place_name: 'Salt Lake, Kolkata', triggered_at: '07:45 AM', status: 'RESOLVED' },
      { id: 'SOS-4814', user_name: 'Rohit Kapoor', place_name: 'Satellite, Ahmedabad', triggered_at: '07:12 AM', status: 'RESOLVED' },
    ]
    const sosBadge = (status: string) => {
      const normalized = (status || 'PENDING').toUpperCase()
      const map: Record<string, { bg: string; color: string }> = {
        CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
        PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
        RESOLVED: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
      }
      const s = map[normalized] ?? map.PENDING
      return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: `1px solid ${s.color}44`, letterSpacing: '0.04em' }}>{normalized}</span>
    }
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {sosStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18, border: s.label === 'Total SOS Today' ? '1px solid rgba(239,68,68,0.25)' : undefined }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['Alert ID', 'User', 'Location', 'Time', 'Status', 'Family'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayAlerts.map((a: any, i: number) => (
                  <motion.tr key={a.id || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40, background: 'transparent' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: PURPLE, fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{a.id || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{a.user_name || '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{a.place_name || (a.lat && a.lng ? `${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}` : '—')}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>{a.triggered_at ? (typeof a.triggered_at === 'string' && a.triggered_at.includes('AM') || a.triggered_at.includes('PM') ? a.triggered_at : new Date(a.triggered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })) : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{sosBadge(a.status || 'PENDING')}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{a.family_name || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const Subscriptions = () => {
    const subStats = [
      { label: 'MRR', value: '₹48.7L', color: '#10B981' },
      { label: 'Active Subscriptions', value: '284,391', color: PURPLE },
      { label: 'Churned', value: '2,341', color: '#EF4444' },
      { label: 'Avg LTV', value: '₹8,240', color: '#F59E0B' },
    ]
    const subs = [
      { user: 'Priya Mehta', plan: 'Family+', amount: '₹499', start: '1 Jan 2024', renewal: '1 Jul 2024', status: 'active' },
      { user: 'Karan Sharma', plan: 'Premium', amount: '₹299', start: '5 Feb 2024', renewal: '5 Aug 2024', status: 'active' },
      { user: 'Ananya Iyer', plan: 'Free', amount: '₹0', start: '20 Mar 2024', renewal: '—', status: 'active' },
      { user: 'Rajesh Kumar', plan: 'Premium', amount: '₹299', start: '3 Apr 2024', renewal: '3 Oct 2024', status: 'active' },
      { user: 'Sneha Patel', plan: 'Family+', amount: '₹499', start: '18 Apr 2024', renewal: '18 Oct 2024', status: 'active' },
      { user: 'Divya Nair', plan: 'Free', amount: '₹0', start: '7 May 2024', renewal: '—', status: 'inactive' },
      { user: 'Vikram Joshi', plan: 'Premium', amount: '₹299', start: '22 May 2024', renewal: '22 Nov 2024', status: 'active' },
      { user: 'Meena Kapoor', plan: 'Family+', amount: '₹499', start: '1 Jun 2024', renewal: '1 Dec 2024', status: 'active' },
    ]
    const planBadge = (plan: string) => {
      const map: Record<string, string> = { 'Family+': '#10B981', 'Premium': '#3B82F6', 'Free': '#6B7280' }
      const c = map[plan] ?? '#6B7280'
      return <span style={{ background: `${c}20`, color: c, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: `1px solid ${c}44` }}>{plan}</span>
    }
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {subStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['User', 'Plan', 'Amount', 'Start Date', 'Renewal', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{s.user}</td>
                    <td style={{ padding: '12px 16px' }}>{planBadge(s.plan)}</td>
                    <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: 700 }}>{s.amount}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{s.start}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{s.renewal}</td>
                    <td style={{ padding: '12px 16px' }}>{statusBadge(s.status)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const Plans = () => {
    const plans = [
      { name: 'Free', price: '₹0', period: '', subscribers: '1,708,435', revenue: '—', color: '#6B7280' },
      { name: 'Premium', price: '₹299', period: '/mo', subscribers: '284,391', revenue: '₹8.5Cr/yr', color: '#3B82F6' },
      { name: 'Family+', price: '₹499', period: '/mo', subscribers: '142,196', revenue: '₹8.5Cr/yr', color: '#8B5CF6' },
      { name: 'Elder Care', price: '₹399', period: '/mo', subscribers: '56,842', revenue: '₹2.7Cr/yr', color: '#10B981' },
      { name: 'School', price: '₹999', period: '/mo', subscribers: '12,341', revenue: '₹1.5Cr/yr', color: '#F59E0B' },
      { name: 'Enterprise', price: '₹4,999', period: '/mo', subscribers: '47', revenue: '₹28.2L/mo', color: '#EC4899' },
    ]
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GlassCard style={{ padding: 22, border: `1px solid ${p.color}30`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: p.color, opacity: 0.08, filter: 'blur(20px)' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      <span style={{ color: p.color }}>{p.price}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{p.period}</span>
                    </div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${p.color}18`, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={20} color={p.color} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>Subscribers</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{p.subscribers}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>Revenue</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#10B981' }}>{p.revenue}</div>
                  </div>
                </div>
                <button style={{ width: '100%', padding: '8px', borderRadius: 9, border: `1px solid ${p.color}44`, background: `${p.color}12`, color: p.color, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Edit size={13} /> Edit Plan
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const Geofences = () => {
    const geoStats = [
      { label: 'Total Geofences', value: '3.2M', color: '#10B981' },
      { label: 'Active', value: '2.9M', color: PURPLE },
      { label: 'Home Zones', value: '45%', color: '#3B82F6' },
      { label: 'School', value: '23%', color: '#F59E0B' },
      { label: 'Work', value: '18%', color: '#EC4899' },
      { label: 'Other', value: '14%', color: '#6B7280' },
    ]
    const fences = [
      { name: 'Home — Sharma', family: 'Sharma Family', type: 'Home', radius: '200m', alertsToday: 12, status: 'active' },
      { name: 'DPS Noida School', family: 'Mehta Household', type: 'School', radius: '500m', alertsToday: 8, status: 'active' },
      { name: 'Tata Office HQ', family: 'Iyer Circle', type: 'Work', radius: '300m', alertsToday: 3, status: 'active' },
      { name: 'Home — Patel', family: 'Patel Group', type: 'Home', radius: '150m', alertsToday: 7, status: 'active' },
      { name: 'Ryan International', family: 'Gupta Family', type: 'School', radius: '400m', alertsToday: 5, status: 'active' },
      { name: 'Infosys Campus', family: 'Nair Household', type: 'Work', radius: '600m', alertsToday: 2, status: 'inactive' },
      { name: 'Home — Reddy', family: 'Reddy Circle', type: 'Home', radius: '250m', alertsToday: 14, status: 'active' },
      { name: 'Mall Zone', family: 'Joshi Family', type: 'Other', radius: '100m', alertsToday: 0, status: 'inactive' },
    ]
    const typeColor = (t: string) => ({ Home: '#3B82F6', School: '#F59E0B', Work: '#10B981', Other: '#6B7280' }[t] ?? '#6B7280')
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
          {geoStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 28, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['Name', 'Family', 'Type', 'Radius', 'Alerts Today', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fences.map((f, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <MapPin size={13} color={typeColor(f.type)} />
                        {f.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{f.family}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: `${typeColor(f.type)}20`, color: typeColor(f.type), fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: `1px solid ${typeColor(f.type)}44` }}>{f.type}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>{f.radius}</td>
                    <td style={{ padding: '12px 16px', color: f.alertsToday > 0 ? '#F59E0B' : 'rgba(255,255,255,0.4)', fontWeight: f.alertsToday > 0 ? 700 : 400 }}>{f.alertsToday}</td>
                    <td style={{ padding: '12px 16px' }}>{statusBadge(f.status)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const Notifications = () => {
    const notifStats = [
      { label: 'Sent Today', value: '2.4M', color: PURPLE },
      { label: 'Delivered', value: '98.2%', color: '#10B981' },
      { label: 'Opened', value: '34.1%', color: '#3B82F6' },
      { label: 'Failed', value: '1.8%', color: '#EF4444' },
    ]
    const recent = [
      { title: 'SOS Safety Tip', target: 'All', sent: '2.4M', delivered: '2.35M', opened: '817K', date: '13 Jun 2024' },
      { title: 'Premium Feature Update', target: 'Premium', sent: '284K', delivered: '281K', opened: '112K', date: '12 Jun 2024' },
      { title: 'Battery Low Warning', target: 'Android', sent: '1.2M', delivered: '1.18M', opened: '342K', date: '12 Jun 2024' },
      { title: 'New Geofence Tips', target: 'All', sent: '2.4M', delivered: '2.34M', opened: '703K', date: '11 Jun 2024' },
      { title: 'Family+ Upgrade Offer', target: 'Premium', sent: '284K', delivered: '280K', opened: '98K', date: '10 Jun 2024' },
    ]
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {notifStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <GlassCard style={{ padding: 22, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Send Notification</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Title</label>
              <input type="text" placeholder="Notification title..." style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Target Audience</label>
              <select style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                <option style={{ background: '#1a1030' }}>All Users</option>
                <option style={{ background: '#1a1030' }}>Premium</option>
                <option style={{ background: '#1a1030' }}>Android</option>
                <option style={{ background: '#1a1030' }}>iOS</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>Message</label>
            <textarea placeholder="Notification message..." rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
          <button style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 14px rgba(139,92,246,0.4)` }}>
            <Bell size={14} /> Send Notification
          </button>
        </GlassCard>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14, fontWeight: 700, color: '#fff' }}>Recent Notifications</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['Title', 'Target', 'Sent', 'Delivered', 'Opened', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{r.title}</td>
                    <td style={{ padding: '12px 16px', color: PURPLE, fontWeight: 600, fontSize: 12 }}>{r.target}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{r.sent}</td>
                    <td style={{ padding: '12px 16px', color: '#10B981' }}>{r.delivered}</td>
                    <td style={{ padding: '12px 16px', color: '#3B82F6' }}>{r.opened}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{r.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const SupportTickets = () => {
    const supportStats = [
      { label: 'Open Tickets', value: '234', color: '#F59E0B' },
      { label: 'Resolved Today', value: '89', color: '#10B981' },
      { label: 'Avg Resolution', value: '4.2h', color: PURPLE },
      { label: 'CSAT', value: '94%', color: '#3B82F6' },
    ]
    const tickets = [
      { id: 'TKT-8821', user: 'Priya Mehta', subject: 'SOS not triggering', priority: 'High', status: 'Open', assigned: 'Karan S.', date: '13 Jun 2024' },
      { id: 'TKT-8820', user: 'Ajay Verma', subject: 'Map not loading', priority: 'Medium', status: 'In Progress', assigned: 'Meena K.', date: '13 Jun 2024' },
      { id: 'TKT-8819', user: 'Riya Singh', subject: 'Payment failed', priority: 'High', status: 'Resolved', assigned: 'Suresh R.', date: '12 Jun 2024' },
      { id: 'TKT-8818', user: 'Deepak Gupta', subject: 'Geofence alert delay', priority: 'Low', status: 'Open', assigned: 'Aditya R.', date: '12 Jun 2024' },
      { id: 'TKT-8817', user: 'Sneha Patel', subject: 'Cannot add family member', priority: 'Medium', status: 'In Progress', assigned: 'Kavita M.', date: '11 Jun 2024' },
      { id: 'TKT-8816', user: 'Rohit Kapoor', subject: 'Push notifications off', priority: 'Low', status: 'Resolved', assigned: 'Rohan D.', date: '11 Jun 2024' },
      { id: 'TKT-8815', user: 'Neha Gupta', subject: 'App crashes on launch', priority: 'High', status: 'Open', assigned: 'Pooja B.', date: '10 Jun 2024' },
      { id: 'TKT-8814', user: 'Suresh Kumar', subject: 'Wrong location shown', priority: 'Medium', status: 'Resolved', assigned: 'Karan S.', date: '10 Jun 2024' },
    ]
    const priorityBadge = (p: string) => {
      const map: Record<string, { bg: string; color: string }> = {
        High: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
        Medium: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
        Low: { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF' },
      }
      const s = map[p] ?? map.Low
      return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: `1px solid ${s.color}33` }}>{p}</span>
    }
    const ticketStatusBadge = (s: string) => {
      const map: Record<string, { bg: string; color: string }> = {
        Open: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
        'In Progress': { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA' },
        Resolved: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
      }
      const st = map[s] ?? map.Open
      return <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, border: `1px solid ${st.color}33`, whiteSpace: 'nowrap' }}>{s}</span>
    }
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {supportStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['Ticket ID', 'User', 'Subject', 'Priority', 'Status', 'Assigned', 'Date'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: PURPLE, fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{t.id}</td>
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{t.user}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)' }}>{t.subject}</td>
                    <td style={{ padding: '12px 16px' }}>{priorityBadge(t.priority)}</td>
                    <td style={{ padding: '12px 16px' }}>{ticketStatusBadge(t.status)}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{t.assigned}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>{t.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const AuditLogs = () => {
    const auditStats = [
      { label: 'Events Today', value: '48,291', color: PURPLE },
      { label: 'Critical', value: '23', color: '#EF4444' },
      { label: 'Warnings', value: '189', color: '#F59E0B' },
      { label: 'Info', value: '48,079', color: '#3B82F6' },
    ]
    const logs = [
      { ts: '09:14:32', action: 'user_suspend', user: 'karan@gravity.app', ip: '10.0.0.4', location: 'Mumbai', severity: 'warning', result: 'success' },
      { ts: '09:02:18', action: 'login', user: 'amit@gravity.app', ip: '10.0.0.2', location: 'Delhi', severity: 'info', result: 'success' },
      { ts: '08:51:44', action: 'role_change', user: 'meena@gravity.app', ip: '10.0.0.5', location: 'Mumbai', severity: 'critical', result: 'success' },
      { ts: '08:33:10', action: 'data_export', user: 'suresh@gravity.app', ip: '10.0.0.6', location: 'Hyderabad', severity: 'warning', result: 'success' },
      { ts: '08:20:55', action: 'settings_change', user: 'karan@gravity.app', ip: '10.0.0.4', location: 'Mumbai', severity: 'info', result: 'success' },
      { ts: '07:58:22', action: 'login', user: 'rohan@gravity.app', ip: '10.0.0.8', location: 'Bangalore', severity: 'info', result: 'success' },
      { ts: '07:45:03', action: 'user_suspend', user: 'pooja@gravity.app', ip: '10.0.0.9', location: 'Delhi', severity: 'warning', result: 'success' },
      { ts: '07:12:41', action: 'role_change', user: 'amit@gravity.app', ip: '10.0.0.2', location: 'Delhi', severity: 'critical', result: 'success' },
      { ts: '06:58:16', action: 'data_export', user: 'meena@gravity.app', ip: '10.0.0.5', location: 'Mumbai', severity: 'warning', result: 'success' },
      { ts: '06:21:38', action: 'settings_change', user: 'suresh@gravity.app', ip: '10.0.0.6', location: 'Hyderabad', severity: 'info', result: 'success' },
      { ts: '05:44:12', action: 'login', user: 'kavita@gravity.app', ip: '10.0.0.11', location: 'Chennai', severity: 'info', result: 'success' },
      { ts: '04:31:07', action: 'data_export', user: 'aditya@gravity.app', ip: '10.0.0.12', location: 'Pune', severity: 'warning', result: 'success' },
    ]
    const actionLabels: Record<string, string> = {
      user_suspend: 'User Suspend',
      login: 'Login',
      role_change: 'Role Change',
      data_export: 'Data Export',
      settings_change: 'Settings Change',
    }
    const actionBadge = (action: string, severity: string) => {
      const map: Record<string, { bg: string; color: string }> = {
        info: { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA' },
        warning: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
        critical: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
      }
      const s = map[severity] ?? map.info
      return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, border: `1px solid ${s.color}33`, whiteSpace: 'nowrap' }}>{actionLabels[action] ?? action}</span>
    }
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {auditStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['Timestamp', 'Action', 'User', 'IP Address', 'Location', 'Result'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40, background: 'transparent' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12, fontFamily: 'monospace' }}>{log.ts}</td>
                    <td style={{ padding: '11px 16px' }}>{actionBadge(log.action, log.severity)}</td>
                    <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{log.user}</td>
                    <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>{log.ip}</td>
                    <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{log.location}</td>
                    <td style={{ padding: '11px 16px' }}>{statusBadge(log.result)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const Enterprise = () => {
    const entStats = [
      { label: 'Enterprise Clients', value: '47', color: '#EC4899' },
      { label: 'Active Licenses', value: '47', color: '#10B981' },
      { label: 'MRR from Enterprise', value: '₹18.4L', color: PURPLE },
      { label: 'Avg Users/Client', value: '1,284', color: '#3B82F6' },
    ]
    const clients = [
      { org: 'DPS Noida', type: 'School', users: 2841, expires: '31 Dec 2024', mrr: '₹1.2L', status: 'active' },
      { org: 'Apollo Hospitals', type: 'Healthcare', users: 3200, expires: '30 Jun 2025', mrr: '₹2.1L', status: 'active' },
      { org: 'Tata Motors', type: 'Corporate', users: 5400, expires: '31 Mar 2025', mrr: '₹3.8L', status: 'active' },
      { org: 'Ryan International', type: 'School', users: 1850, expires: '31 Dec 2024', mrr: '₹0.9L', status: 'active' },
      { org: 'Infosys Campus', type: 'Corporate', users: 8200, expires: '30 Sep 2024', mrr: '₹4.5L', status: 'active' },
      { org: 'Manipal Hospital', type: 'Healthcare', users: 2100, expires: '28 Feb 2025', mrr: '₹1.4L', status: 'active' },
      { org: 'L&T Construction', type: 'Corporate', users: 4300, expires: '30 Nov 2024', mrr: '₹2.9L', status: 'active' },
      { org: 'DAV Public School', type: 'School', users: 1200, expires: '31 Dec 2024', mrr: '₹0.6L', status: 'inactive' },
    ]
    const typeColor = (t: string) => ({ School: '#3B82F6', Healthcare: '#10B981', Corporate: PURPLE }[t] ?? '#6B7280')
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {entStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: `0 4px 14px rgba(139,92,246,0.4)` }}>
            <Plus size={14} /> Add Client
          </button>
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['Organization', 'License Type', 'Users', 'Expires', 'MRR', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Building2 size={14} color={typeColor(c.type)} />
                        {c.org}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: `${typeColor(c.type)}20`, color: typeColor(c.type), fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: `1px solid ${typeColor(c.type)}44` }}>{c.type}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{c.users.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{c.expires}</td>
                    <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: 700 }}>{c.mrr}</td>
                    <td style={{ padding: '12px 16px' }}>{statusBadge(c.status)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const WhiteLabel = () => {
    const wlStats = [
      { label: 'Active White Labels', value: '12', color: '#EC4899' },
      { label: 'Pending Setup', value: '3', color: '#F59E0B' },
      { label: 'Total Revenue', value: '₹7.2L/mo', color: '#10B981' },
    ]
    const partners = [
      { name: 'EduSafe', domain: 'edusafe.app', users: 12400, status: 'active', color: '#3B82F6', initial: 'E' },
      { name: 'HealthGuard', domain: 'healthguard.in', users: 8200, status: 'active', color: '#10B981', initial: 'H' },
      { name: 'CorpTrack', domain: 'corptrack.io', users: 21000, status: 'active', color: PURPLE, initial: 'C' },
      { name: 'SafeKids', domain: 'safekids.co.in', users: 5600, status: 'active', color: '#F59E0B', initial: 'S' },
      { name: 'ElderPro', domain: 'elderpro.app', users: 3200, status: 'pending', color: '#EC4899', initial: 'EP' },
      { name: 'SecureFleet', domain: 'securefleet.in', users: 9800, status: 'active', color: '#6B7280', initial: 'SF' },
    ]
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {wlStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {partners.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GlassCard style={{ padding: 20, border: `1px solid ${p.color}25` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${p.color}, ${p.color}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: `0 4px 14px ${p.color}40` }}>
                    {p.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{p.domain}</div>
                  </div>
                  {statusBadge(p.status)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Users</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{p.users.toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${p.color}40`, background: `${p.color}12`, color: p.color, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Configure</button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const APIKeys = () => {
    const apiStats = [
      { label: 'API Calls Today', value: '4.7M', color: PURPLE },
      { label: 'Success Rate', value: '99.94%', color: '#10B981' },
      { label: 'Avg Latency', value: '47ms', color: '#3B82F6' },
      { label: 'Active Keys', value: '234', color: '#F59E0B' },
    ]
    const keys = [
      { key: 'gv_live_sk_•••••••••••••••Xk8m', owner: 'Karan Sharma', calls: '284K', lastUsed: '2m ago', created: '1 Jan 2024', status: 'active' },
      { key: 'gv_live_sk_•••••••••••••••Lp3n', owner: 'Meena Kapoor', calls: '142K', lastUsed: '15m ago', created: '5 Feb 2024', status: 'active' },
      { key: 'gv_live_sk_•••••••••••••••Qr7v', owner: 'EduSafe API', calls: '1.2M', lastUsed: '1m ago', created: '20 Mar 2024', status: 'active' },
      { key: 'gv_live_sk_•••••••••••••••Wt9z', owner: 'CorpTrack', calls: '876K', lastUsed: '5m ago', created: '3 Apr 2024', status: 'active' },
      { key: 'gv_test_sk_•••••••••••••••Bj2x', owner: 'Suresh Reddy', calls: '23K', lastUsed: '2h ago', created: '18 Apr 2024', status: 'active' },
      { key: 'gv_live_sk_•••••••••••••••Hn4c', owner: 'HealthGuard', calls: '421K', lastUsed: '8m ago', created: '2 May 2024', status: 'active' },
      { key: 'gv_live_sk_•••••••••••••••Fm6p', owner: 'Aditya Rao', calls: '56K', lastUsed: '3h ago', created: '15 May 2024', status: 'inactive' },
      { key: 'gv_live_sk_•••••••••••••••Ds1e', owner: 'SecureFleet', calls: '634K', lastUsed: '12m ago', created: '28 May 2024', status: 'active' },
    ]
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {apiStats.map((s) => (
            <GlassCard key={s.label} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{s.value}</div>
              <div style={{ width: 32, height: 3, borderRadius: 99, background: s.color }} />
            </GlassCard>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: `0 4px 14px rgba(139,92,246,0.4)` }}>
            <Key size={14} /> Generate New Key
          </button>
        </div>
        <GlassCard style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
                  {['API Key', 'Owner', 'Calls/Day', 'Last Used', 'Created', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys.map((k, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)', height: 40 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>{k.key}</td>
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{k.owner}</td>
                    <td style={{ padding: '12px 16px', color: PURPLE, fontWeight: 600 }}>{k.calls}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>{k.lastUsed}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', fontSize: 12 }}>{k.created}</td>
                    <td style={{ padding: '12px 16px' }}>{statusBadge(k.status)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[{ icon: Eye, color: '#60A5FA', tip: 'View' }, { icon: Trash2, color: '#EF4444', tip: 'Revoke' }].map(({ icon: Icon, color, tip }) => (
                          <button key={tip} title={tip} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${color}22`, background: `${color}12`, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={13} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    )
  }

  const renderSection = () => {
    switch (active) {
      case 'command': return <CommandCenter />
      case 'users': return <AllUsers />
      case 'families': return <Families />
      case 'devices': return <Devices />
      case 'admins': return <AdminsMods />
      case 'sos': return <SOSAlerts />
      case 'revenue': return <Revenue />
      case 'subscriptions': return <Subscriptions />
      case 'plans': return <Plans />
      case 'geofences': return <Geofences />
      case 'notifications': return <Notifications />
      case 'support': return <SupportTickets />
      case 'health': return <SystemHealth />
      case 'analytics': return <Analytics />
      case 'security': return <SecurityLogs />
      case 'audit': return <AuditLogs />
      case 'enterprise': return <Enterprise />
      case 'whitelabel': return <WhiteLabel />
      case 'api': return <APIKeys />
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
        ::-webkit-scrollbar-thumb { background: rgba(212,168,83,0.35); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,168,83,0.6); }
        @media (max-width: 768px) {
          .super-admin-sidebar { display: none !important; }
          .super-admin-mobile-bottom { display: flex !important; }
          .super-admin-main-content { padding-bottom: 72px !important; }
        }
        @media (min-width: 769px) {
          .super-admin-mobile-bottom { display: none !important; }
          .super-admin-hamburger { display: none !important; }
        }
        html:not(.dark) [data-panel] { background: var(--bg) !important; }
        html:not(.dark) [data-sidebar] { background: var(--bg-surface) !important; }
      `}</style>

      <div
        data-panel
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'var(--bg)',
          fontFamily: 'Inter, sans-serif',
          color: 'var(--text-primary)',
          position: 'relative',
        }}
      >
        <PanelBackground />
        {/* Desktop Sidebar */}
        <div
          className="super-admin-sidebar"
          data-sidebar
          style={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
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
                  borderRight: `1px solid var(--border)`,
                  overflowY: 'auto',
                  background: 'var(--bg-surface)',
                }}
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: 260 }}>

          {/* ── TOP HEADER ── */}
          <header
            style={{
              height: 52,
              borderBottom: `1px solid var(--border)`,
              background: 'var(--bg-surface)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: 12,
              position: 'sticky',
              top: 0,
              zIndex: 30,
            }}
          >
            {/* Hamburger — mobile only */}
            <button
              className="super-admin-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6 }}
            >
              <Menu size={20} />
            </button>

            {/* Section title */}
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {NAV.find(n => n.id === active)?.label ?? 'Command Center'}
            </span>

            {/* System health pulse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 12 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981', flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>All Systems Operational</span>
            </div>

            <div style={{ flex: 1 }} />

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ThemeToggle />
              <div
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold), #92400e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0, cursor: 'default',
                }}
                title={superAdminName}
              >
                {initials}
              </div>
            </div>
          </header>

          {/* ── MAIN CONTENT ── */}
          <main
            className="super-admin-main-content"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 24,
              background: 'var(--bg)',
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
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      lineHeight: 1.2,
                    }}
                  >
                    {sectionLabel}
                  </h1>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    GRAVITY Super Admin Control Center
                  </div>
                  <div style={{ width: 32, height: 2, background: 'var(--gold)', borderRadius: 2, marginTop: 10 }} />
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
            background: 'var(--bg-surface)',
            borderTop: `1px solid var(--border)`,
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
