'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getAdminToken, clearAdminAuth } from '@/lib/api'
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
  Menu,
  X,
  ChevronRight,
  Search,
  Moon,
  Sun,
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
  RefreshCw,
  Shield,
  Building2,
  Baby,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: "Dashboard",      href: "/admin",                    icon: LayoutDashboard },
  { label: "Users",          href: "/admin/users",              icon: UserCircle },
  { label: "Families",       href: "/admin/families",           icon: Users },
  { label: "Devices",        href: "/admin/devices",            icon: Smartphone },
  { label: "Locations",      href: "/admin/locations",          icon: MapPin },
  { label: "Geofences",      href: "/admin/geofences",          icon: Circle },
  { label: "SOS Alerts",     href: "/admin/alerts",             icon: AlertTriangle, badge: "" },
  { label: "Check-Ins",      href: "/admin/check-ins",          icon: CheckSquare, badge: "" },
  { label: "Journeys",       href: "/admin/journeys",           icon: Route, badge: "" },
  { label: "Family Chat",    href: "/admin/family-chat",        icon: MessageCircle, badge: "NEW" },
  { label: "Child Safety",   href: "/admin/child-safety",       icon: Baby, badge: "NEW" },
  { label: "Driving Safety", href: "/admin/driving-safety",     icon: Car, badge: "NEW" },
  { label: "Health",         href: "/admin/health",             icon: Heart, badge: "NEW" },
  { label: "Elderly Care",   href: "/admin/elderly-care",       icon: ActivitySquare, badge: "" },
  { label: "Analytics",      href: "/admin/analytics",          icon: BarChart2 },
  { label: "Notifications",  href: "/admin/notifications",      icon: Bell },
  { label: "Plans",          href: "/admin/plans",              icon: CreditCard },
  { label: "Payments",       href: "/admin/payments",           icon: DollarSign },
  { label: "Coupons",        href: "/admin/coupons",            icon: Tag },
  { label: "Subscriptions",  href: "/admin/subscriptions",      icon: RefreshCw },
  { label: "Enterprise",     href: "/admin/enterprise",         icon: Building2 },
  { label: "Support",        href: "/admin/support",            icon: MessageSquare, badge: "47" },
  { label: "Audit Logs",     href: "/admin/audit-logs",         icon: FileText, badge: "" },
  { label: "Security Logs",  href: "/admin/security-logs",      icon: Shield },
  { label: "Marketing",      href: "/admin/marketing",          icon: Megaphone, badge: "" },
  { label: "Settings",       href: "/admin/settings",           icon: Settings },
]

function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find(item => item.href === pathname)
  if (match) return match.label
  if (pathname.startsWith("/admin/families")) return "Families"
  if (pathname.startsWith("/admin/devices")) return "Devices"
  if (pathname.startsWith("/admin/locations")) return "Locations"
  if (pathname.startsWith("/admin/geofences")) return "Geofences"
  if (pathname.startsWith("/admin/alerts")) return "SOS Alerts"
  if (pathname.startsWith("/admin/check-ins")) return "Check-Ins"
  if (pathname.startsWith("/admin/journeys")) return "Journeys"
  if (pathname.startsWith("/admin/family-chat")) return "Family Chat"
  if (pathname.startsWith("/admin/driving-safety")) return "Driving Safety"
  if (pathname.startsWith("/admin/health")) return "Health"
  if (pathname.startsWith("/admin/elderly-care")) return "Elderly Care"
  if (pathname.startsWith("/admin/analytics")) return "Analytics"
  if (pathname.startsWith("/admin/notifications")) return "Notifications"
  if (pathname.startsWith("/admin/plans")) return "Plans"
  if (pathname.startsWith("/admin/settings")) return "Settings"
  if (pathname.startsWith("/admin/support")) return "Support Center"
  if (pathname.startsWith("/admin/audit-logs")) return "Audit Logs"
  if (pathname.startsWith("/admin/marketing")) return "Marketing Hub"
  if (pathname.startsWith("/admin/users")) return "Users"
  if (pathname.startsWith("/admin/payments")) return "Payments"
  if (pathname.startsWith("/admin/coupons")) return "Coupons"
  if (pathname.startsWith("/admin/subscriptions")) return "Subscriptions"
  if (pathname.startsWith("/admin/enterprise")) return "Enterprise"
  if (pathname.startsWith("/admin/security-logs")) return "Security Logs"
  if (pathname.startsWith("/admin/child-safety")) return "Child Safety"
  return "Dashboard"
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authChecked, setAuthChecked] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const token = getAdminToken()
    const legacyAuth = localStorage.getItem("gravity_admin_auth") === "true"
    const isAuth = !!token || legacyAuth
    if (!isAuth && pathname !== "/admin/login") {
      router.push("/admin/login")
    } else {
      setAuthed(isAuth || pathname === "/admin/login")
    }
    setAuthChecked(true)
  }, [pathname, router])

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [darkMode])

  const handleLogout = () => {
    clearAdminAuth()
    router.push("/admin/login")
  }

  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid var(--border)",
            borderTopColor: "var(--gold)",
          }}
        />
      </div>
    )
  }

  if (!authed) return null

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const pageTitle = getPageTitle(pathname)

  const SidebarContent = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-surface)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C9913A, #D4A853)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 16,
            color: "#fff",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(184,114,10,0.4)",
          }}
        >
          G
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "0.08em",
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            GRAVITY
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              background: "linear-gradient(135deg, #C9913A, #D4A853)",
              color: "#fff",
              borderRadius: 4,
              padding: "1px 6px",
              marginTop: 4,
              display: "inline-block",
            }}
          >
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {NAV_ITEMS.map((item, i) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 10,
                  marginBottom: 2,
                  textDecoration: "none",
                  color: active ? "var(--gold)" : "var(--text-secondary)",
                  background: active ? "rgba(var(--gold-rgb),0.10)" : "transparent",
                  borderLeft: active ? "3px solid var(--gold)" : "3px solid transparent",
                  fontWeight: active ? 600 : 500,
                  fontSize: 13.5,
                  transition: "all 0.18s ease",
                  position: "relative",
                }}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span>{item.label}</span>
                {item.badge && <span style={{fontSize:'9px', background:'rgba(var(--gold-rgb),0.15)', color:'var(--gold)', border:'1px solid rgba(var(--gold-rgb),0.3)', borderRadius:'4px', padding:'1px 5px', fontWeight:700, letterSpacing:'0.05em'}}>{item.badge}</span>}
                {active && (
                  <ChevronRight
                    size={13}
                    style={{ marginLeft: "auto", opacity: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "var(--sos)",
            cursor: "pointer",
            fontSize: 13.5,
            fontWeight: 500,
            transition: "background 0.18s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={17} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Desktop Sidebar */}
      <div
        className="admin-sidebar-desktop"
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .admin-sidebar-desktop { display: none !important; }
          }
          @media (min-width: 769px) {
            .admin-hamburger { display: none !important; }
          }
        `}</style>
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
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 40,
              }}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 240,
                height: "100vh",
                zIndex: 50,
                borderRight: "1px solid var(--border)",
                overflowY: "auto",
              }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            height: 60,
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Hamburger (mobile) */}
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Menu size={22} />
          </button>

          {/* Page title */}
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
              whiteSpace: "nowrap",
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}
          >
            {pageTitle}
          </h2>

          {/* Search */}
          <div
            style={{
              flex: 1,
              maxWidth: 400,
              margin: "0 auto",
              position: "relative",
            }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search families, devices..."
              style={{
                width: "100%",
                padding: "7px 14px 7px 34px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                background: "var(--bg-surface2)",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: 6,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                transition: "background 0.18s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Bell */}
            <div style={{ position: "relative" }}>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Bell size={18} />
              </button>
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 16,
                  height: 16,
                  background: "var(--sos)",
                  borderRadius: "50%",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                3
              </span>
            </div>

            {/* Avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C9913A, #D4A853)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(184,114,10,0.35)",
              }}
            >
              AD
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--bg)",
            padding: 24,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
