'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAdminToken, clearAdminAuth } from '@/lib/api'
import ThemeToggle from '@/components/ui/ThemeToggle'
import PanelBackground from '@/components/effects/PanelBackground'
import {
  LayoutDashboard,
  Users,
  Smartphone,
  MapPin,
  Circle,
  AlertTriangle,
  BarChart2,
  Bell,
  CreditCard,
  Settings,
  LogOut,
  CheckSquare,
  Route,
  MessageCircle,
  Heart,
  Car,
  ActivitySquare,
  MessageSquare,
  FileText,
  Megaphone,
  UserCircle,
  DollarSign,
  Tag,
  Shield,
  Building2,
  Baby,
} from 'lucide-react'

/* ── Nav structure ────────────────────────────────────────────── */

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

type NavGroup = NavItem[]

const NAV_GROUPS: NavGroup[] = [
  // Group 1 — Core
  [
    { label: 'Dashboard',   href: '/admin',             icon: LayoutDashboard },
    { label: 'Users',       href: '/admin/users',        icon: UserCircle },
    { label: 'Families',    href: '/admin/families',     icon: Users },
    { label: 'Devices',     href: '/admin/devices',      icon: Smartphone },
  ],
  // Group 2 — Operations
  [
    { label: 'Locations',   href: '/admin/locations',    icon: MapPin },
    { label: 'Geofences',   href: '/admin/geofences',    icon: Circle },
    { label: 'SOS Alerts',  href: '/admin/alerts',       icon: AlertTriangle, badge: 3 },
    { label: 'Journeys',    href: '/admin/journeys',     icon: Route },
    { label: 'Check-ins',   href: '/admin/check-ins',    icon: CheckSquare },
    { label: 'Family Chat', href: '/admin/family-chat',  icon: MessageCircle },
  ],
  // Group 3 — Health & Safety
  [
    { label: 'Health',        href: '/admin/health',          icon: Heart },
    { label: 'Driving',       href: '/admin/driving-safety',  icon: Car },
    { label: 'Child Safety',  href: '/admin/child-safety',    icon: Baby },
    { label: 'Elderly Care',  href: '/admin/elderly-care',    icon: ActivitySquare },
  ],
  // Group 4 — Revenue
  [
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { label: 'Payments',      href: '/admin/payments',      icon: DollarSign },
    { label: 'Plans',         href: '/admin/plans',         icon: Tag },
    { label: 'Coupons',       href: '/admin/coupons',       icon: Tag },
    { label: 'Enterprise',    href: '/admin/enterprise',    icon: Building2 },
  ],
  // Group 5 — System
  [
    { label: 'Analytics',      href: '/admin/analytics',      icon: BarChart2 },
    { label: 'Notifications',  href: '/admin/notifications',  icon: Bell },
    { label: 'Support',        href: '/admin/support',        icon: MessageSquare },
    { label: 'Marketing',      href: '/admin/marketing',      icon: Megaphone },
    { label: 'Security Logs',  href: '/admin/security-logs',  icon: Shield },
    { label: 'Audit Logs',     href: '/admin/audit-logs',     icon: FileText },
    { label: 'Settings',       href: '/admin/settings',       icon: Settings },
  ],
]

/* ── Flat item list for page-title lookup ─────────────────────── */
const ALL_NAV_ITEMS = NAV_GROUPS.flat()

function getPageTitle(pathname: string): string {
  const exact = ALL_NAV_ITEMS.find(item => item.href === pathname)
  if (exact) return exact.label
  const prefix = ALL_NAV_ITEMS
    .filter(item => item.href !== '/admin')
    .find(item => pathname.startsWith(item.href))
  return prefix ? prefix.label : 'Dashboard'
}

/* ── Divider ──────────────────────────────────────────────────── */
function NavDivider() {
  return (
    <div
      style={{
        height:     1,
        background: 'var(--border)',
        margin:     '8px 12px',
        flexShrink: 0,
      }}
    />
  )
}

/* ── Single nav item ──────────────────────────────────────────── */
function NavItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            8,
        height:         32,
        margin:         active ? '1px 8px 1px 6px' : '1px 8px',
        padding:        '0 8px',
        borderRadius:   6,
        textDecoration: 'none',
        background:     active ? 'var(--bg-surface2)' : 'transparent',
        borderLeft:     active ? '2px solid var(--gold)' : '2px solid transparent',
        transition:     'background 0.12s ease, border-color 0.12s ease',
        cursor:         'pointer',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-surface2)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
        }
      }}
    >
      <Icon
        size={14}
        color={active ? 'var(--gold)' : 'var(--text-muted)'}
        strokeWidth={active ? 2.2 : 1.8}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{
          flex:         1,
          fontSize:     13,
          fontWeight:   active ? 600 : 400,
          color:        active ? 'var(--text-primary)' : 'var(--text-secondary)',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {item.label}
      </span>
      {item.badge && item.badge > 0 ? (
        <span
          style={{
            fontSize:     9,
            fontWeight:   700,
            background:   'rgba(220,38,38,0.15)',
            color:        '#ef4444',
            borderRadius: 4,
            padding:      '2px 5px',
            flexShrink:   0,
          }}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}

/* ── Root layout ──────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [authChecked, setAuthChecked] = useState(false)
  const [authed,      setAuthed]      = useState(false)

  /* Auth check */
  useEffect(() => {
    const token      = getAdminToken()
    const legacyAuth = localStorage.getItem('gravity_admin_auth') === 'true'
    const isAuth     = !!token || legacyAuth
    if (!isAuth && pathname !== '/admin/login') {
      router.push('/admin/login')
    } else {
      setAuthed(isAuth || pathname === '/admin/login')
    }
    setAuthChecked(true)
  }, [pathname, router])

  const handleLogout = () => {
    clearAdminAuth()
    router.push('/admin/login')
  }

  /* Loading spinner */
  if (!authChecked) {
    return (
      <div
        style={{
          minHeight:      '100vh',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'var(--bg)',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width:        40,
            height:       40,
            borderRadius: '50%',
            border:       '3px solid var(--border)',
            borderTopColor: 'var(--gold)',
          }}
        />
      </div>
    )
  }

  if (!authed) return null

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'row',
        width:         '100%',
        height:        '100vh',
        overflow:      'hidden',
        background:    'var(--bg)',
        fontFamily:    'Inter, sans-serif',
        position:      'relative',
      }}
    >
      {/* VFX background — zIndex 0, fixed */}
      <PanelBackground />

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         260,
          height:        '100vh',
          background:    'var(--bg-surface)',
          borderRight:   '1px solid var(--border)',
          display:       'flex',
          flexDirection: 'column',
          overflowY:     'auto',
          overflowX:     'hidden',
          zIndex:        40,
        }}
      >
        {/* Top section */}
        <div style={{ padding: '16px 12px 8px', flexShrink: 0 }}>
          {/* Logo row */}
          <div
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         8,
              marginBottom: 10,
            }}
          >
            <Shield size={20} color="var(--gold)" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize:   15,
                fontWeight: 700,
                color:      'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              KVL Track
            </span>
            <sup
              style={{
                fontSize:      9,
                fontWeight:    600,
                textTransform: 'uppercase',
                background:    'rgba(212,168,83,0.12)',
                color:         'var(--gold)',
                padding:       '2px 5px',
                borderRadius:  4,
                letterSpacing: '0.04em',
                lineHeight:    1.4,
              }}
            >
              Admin
            </sup>
          </div>

          {/* Jump-to filter input */}
          <input
            type="text"
            placeholder="Jump to..."
            readOnly
            style={{
              width:        '100%',
              height:       28,
              fontSize:     12,
              padding:      '0 10px',
              background:   'var(--bg-surface2)',
              border:       '1px solid var(--border)',
              borderRadius: 6,
              color:        'var(--text-secondary)',
              outline:      'none',
              boxSizing:    'border-box',
              cursor:       'default',
            }}
          />
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <NavDivider />}
              {group.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href))
                return <NavItem key={item.href} item={item} active={active} />
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div
          style={{
            marginTop:  'auto',
            padding:    12,
            borderTop:  '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          {/* System status row */}
          <div
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         6,
              marginBottom: 10,
            }}
          >
            {/* CPU — green */}
            <span
              style={{
                width:        7,
                height:       7,
                borderRadius: '50%',
                background:   '#22c55e',
                flexShrink:   0,
                display:      'inline-block',
              }}
            />
            {/* RAM — amber */}
            <span
              style={{
                width:        7,
                height:       7,
                borderRadius: '50%',
                background:   '#f59e0b',
                flexShrink:   0,
                display:      'inline-block',
              }}
            />
            {/* DB — green */}
            <span
              style={{
                width:        7,
                height:       7,
                borderRadius: '50%',
                background:   '#22c55e',
                flexShrink:   0,
                display:      'inline-block',
              }}
            />
            <span
              style={{
                fontSize:  11,
                color:     'var(--text-muted)',
                marginLeft: 2,
              }}
            >
              All systems operational
            </span>
          </div>

          {/* User row */}
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            8,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width:          28,
                height:         28,
                borderRadius:   '50%',
                background:     'linear-gradient(135deg, var(--gold), #D4A853)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       10,
                fontWeight:     700,
                color:          '#fff',
                flexShrink:     0,
              }}
            >
              AD
            </div>
            <span
              style={{
                fontSize:   12,
                color:      'var(--text-secondary)',
                fontWeight: 500,
                flex:       1,
              }}
            >
              Admin
            </span>
            {/* Logout icon */}
            <button
              onClick={handleLogout}
              title="Log out"
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                width:          28,
                height:         28,
                borderRadius:   6,
                border:         'none',
                background:     'transparent',
                color:          'var(--text-muted)',
                cursor:         'pointer',
                transition:     'color 0.12s ease, background 0.12s ease',
                flexShrink:     0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444'
                e.currentTarget.style.background = 'rgba(220,38,38,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div
        style={{
          marginLeft:    260,
          flex:          1,
          height:        '100vh',
          overflow:      'hidden',
          display:       'flex',
          flexDirection: 'column',
          position:      'relative',
          zIndex:        1,
        }}
      >
        {/* Header */}
        <header
          style={{
            height:              52,
            flexShrink:          0,
            display:             'flex',
            alignItems:          'center',
            padding:             '0 20px',
            gap:                 8,
            background:          'var(--bg-surface)',
            borderBottom:        '1px solid var(--border)',
            backdropFilter:      'blur(24px)',
            WebkitBackdropFilter:'blur(24px)',
            position:            'sticky',
            top:                 0,
            zIndex:              30,
          }}
        >
          {/* Breadcrumb / page title */}
          <span
            style={{
              fontSize:   15,
              fontWeight: 600,
              color:      'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {pageTitle}
          </span>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />

            {/* Bell with red dot */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  width:          32,
                  height:         32,
                  borderRadius:   6,
                  border:         '1px solid var(--border)',
                  background:     'var(--bg-surface2)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  cursor:         'pointer',
                  color:          'var(--text-muted)',
                  transition:     'color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <Bell size={15} />
              </button>
              <span
                style={{
                  position:      'absolute',
                  top:           3,
                  right:         3,
                  width:         6,
                  height:        6,
                  background:    '#ef4444',
                  borderRadius:  '50%',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Avatar */}
            <div
              style={{
                width:          32,
                height:         32,
                borderRadius:   '50%',
                background:     'linear-gradient(135deg, var(--gold), #D4A853)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       11,
                fontWeight:     700,
                color:          '#fff',
                cursor:         'pointer',
                flexShrink:     0,
              }}
            >
              AD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex:       1,
            overflowY:  'auto',
            background: 'var(--bg)',
            padding:    0,
            position:   'relative',
            zIndex:     1,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
