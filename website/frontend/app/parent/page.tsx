'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Shield,
  MapPin,
  Bell,
  Users,
  Car,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  Star,
  ChevronRight,
  AlertTriangle,
  Navigation,
  Heart,
  Activity,
  Zap,
  Clock,
  Radio,
  Map,
  Route,
  User,
  HelpCircle,
  CreditCard,
  Sun,
  Moon,
  Camera,
} from 'lucide-react'
import { DashboardSection, AlertsSection } from '@/components/parent/ParentDash'
import dynamic from 'next/dynamic'
const UberFamilyMap = dynamic(() => import('@/components/shared/UberFamilyMap'), { ssr: false })
import { ChildrenMonitorSection, ElderlyMonitorSection, DrivingSection, HealthMonitorSection } from '@/components/parent/ParentMonitor'
import { GeofenceSection, JourneySection, FamilyChatSection, ParentSettingsSection, FamilySection } from '@/components/parent/ParentControl'
import { useRouter } from 'next/navigation'
import { getUser, clearAuth, type AuthUser } from '@/lib/auth'

type Tab = 'dashboard' | 'map' | 'alerts' | 'children' | 'elderly' | 'driving' | 'geofences' | 'journeys' | 'chat' | 'settings' | 'family' | 'health'

const BOTTOM_TABS = [
  { id: 'dashboard' as Tab, icon: Home, label: 'Home' },
  { id: 'map' as Tab, icon: Map, label: 'Map' },
  { id: 'alerts' as Tab, icon: Bell, label: 'Safety', badge: 3 },
  { id: 'children' as Tab, icon: Users, label: 'Monitor' },
  { id: 'more', icon: Menu, label: 'More' },
] as const

const DRAWER_ITEMS = [
  { id: 'family' as Tab, icon: Users, label: 'Family' },
  { id: 'health' as Tab, icon: Heart, label: 'Family Health' },
  { id: 'elderly' as Tab, icon: Heart, label: 'Elderly Care' },
  { id: 'driving' as Tab, icon: Car, label: 'Driving Safety' },
  { id: 'geofences' as Tab, icon: Shield, label: 'Geofences' },
  { id: 'journeys' as Tab, icon: Route, label: 'Journeys' },
  { id: 'chat' as Tab, icon: MessageSquare, label: 'Family Chat' },
  { id: 'settings' as Tab, icon: Settings, label: 'Settings' },
]

const SECTION_TITLES: Record<Tab, string> = {
  dashboard: 'Family Overview',
  map: 'Live Family Map',
  alerts: 'Safety & Alerts',
  children: 'Children Monitor',
  health: 'Family Health',
  elderly: 'Elderly Care',
  driving: 'Driving Safety',
  geofences: 'Geofences',
  journeys: 'Journeys',
  chat: 'Family Chat',
  settings: 'Settings',
  family: 'Family Management',
}

export default function ParentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount] = useState(3)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [profileImg, setProfileImg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('gv_token')
    if (!token) {
      router.replace('/login')
      return
    }
    setAuthUser(getUser())
    const savedTheme = localStorage.getItem('gv_theme')
    if (savedTheme === 'light') setIsDark(false)
    const savedAvatar = localStorage.getItem('gravity_parent_avatar')
    if (savedAvatar) setProfileImg(savedAvatar)

    // Mark current user as online — repeated every 60s
    const sendHeartbeat = () => fetch('/auth/heartbeat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    sendHeartbeat()
    const hbInterval = setInterval(sendHeartbeat, 60_000)

    // Share browser GPS location with family
    const sendLocation = (pos: GeolocationPosition) => {
      fetch('/location/update', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      }).catch(() => {})
    }
    let geoWatchId: number | null = null
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(sendLocation, () => {}, { enableHighAccuracy: true })
      geoWatchId = navigator.geolocation.watchPosition(sendLocation, () => {}, { enableHighAccuracy: true, maximumAge: 30000 })
    }

    return () => {
      clearInterval(hbInterval)
      if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId)
    }
  }, [router])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('gv_theme', next ? 'dark' : 'light')
  }

  const T = isDark ? {
    bg: '#0A0C12',
    bgGrad: 'radial-gradient(ellipse at 20% 20%, rgba(212,168,83,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.05) 0%, transparent 50%), #0A0C12',
    header: 'rgba(10,12,18,0.94)',
    nav: 'rgba(10,12,18,0.96)',
    navBorder: 'rgba(255,255,255,0.08)',
    card: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    drawer: 'rgba(14,18,30,0.99)',
    drawerBorder: 'rgba(255,255,255,0.1)',
    text: 'rgba(255,255,255,0.85)',
    textMuted: 'rgba(255,255,255,0.38)',
    icon: 'rgba(255,255,255,0.55)',
    accent: '#D4A853',
    accentBg: 'rgba(212,168,83,0.15)',
    accentBorder: 'rgba(212,168,83,0.3)',
    badgeBg: '#EF4444',
    badgeBorder: '#0A0C12',
    profileBg: 'rgba(14,18,30,0.99)',
    profileBorder: 'rgba(212,168,83,0.2)',
    divider: 'rgba(255,255,255,0.07)',
    itemHover: 'rgba(255,255,255,0.05)',
    itemBg: 'rgba(255,255,255,0.05)',
    itemBorder: 'rgba(255,255,255,0.08)',
    logoutBg: 'rgba(239,68,68,0.08)',
    logoutBorder: 'rgba(239,68,68,0.18)',
    orbA: 'rgba(212,168,83,0.08)',
    orbB: 'rgba(139,92,246,0.07)',
    orbC: 'rgba(59,130,246,0.05)',
    star: 'white',
  } : {
    bg: 'transparent',
    bgGrad: 'none',
    header: 'rgba(255,255,255,0.88)',
    nav: 'rgba(255,255,255,0.92)',
    navBorder: 'rgba(196,146,10,0.18)',
    card: 'rgba(255,255,255,0.82)',
    cardBorder: 'rgba(196,146,10,0.15)',
    drawer: 'rgba(255,252,245,0.97)',
    drawerBorder: 'rgba(196,146,10,0.2)',
    text: '#2C1E0F',
    textMuted: 'rgba(44,30,15,0.45)',
    icon: 'rgba(44,30,15,0.5)',
    accent: '#B8860B',
    accentBg: 'rgba(184,134,11,0.12)',
    accentBorder: 'rgba(184,134,11,0.3)',
    badgeBg: '#EF4444',
    badgeBorder: 'rgba(255,255,255,0.9)',
    profileBg: 'rgba(255,252,245,0.98)',
    profileBorder: 'rgba(184,134,11,0.25)',
    divider: 'rgba(184,134,11,0.12)',
    itemHover: 'rgba(184,134,11,0.06)',
    itemBg: 'rgba(255,255,255,0.6)',
    itemBorder: 'rgba(184,134,11,0.12)',
    logoutBg: 'rgba(239,68,68,0.06)',
    logoutBorder: 'rgba(239,68,68,0.15)',
    orbA: 'transparent',
    orbB: 'transparent',
    orbC: 'transparent',
    star: 'transparent',
  }

  function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  function handleLogout() {
    clearAuth()
    router.replace('/login')
  }

  const handleBottomTab = (id: string) => {
    if (id === 'more') {
      setDrawerOpen(true)
    } else {
      setActiveTab(id as Tab)
      setDrawerOpen(false)
    }
  }

  const handleDrawerItem = (id: Tab) => {
    setActiveTab(id)
    setDrawerOpen(false)
  }

  const isBottomActive = (id: string) => {
    if (id === 'more') {
      return DRAWER_ITEMS.some(d => d.id === activeTab)
    }
    return activeTab === id
  }

  return (
    <div data-theme={isDark ? 'dark' : 'light'} style={{ position: 'fixed', inset: 0, overflow: 'hidden', transition: 'all 0.35s ease' }}>

      {/* ── CSS keyframes ─────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-18px) translateX(8px); }
          66% { transform: translateY(10px) translateX(-6px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.4); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Background ───────────────────────────────────────── */}
      {isDark ? (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 20% 20%, rgba(212,168,83,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.05) 0%, transparent 50%), #0A0C12' }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)', top: '-90px', left: '-90px', animation: 'float 14s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', bottom: '60px', right: '-70px', animation: 'float 18s ease-in-out infinite reverse' }} />
            <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', top: '40%', left: '30%', animation: 'float 22s ease-in-out infinite 4s' }} />
          </div>
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 22 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute', width: i % 3 === 0 ? 2 : 1.5, height: i % 3 === 0 ? 2 : 1.5, borderRadius: '50%', background: 'white', left: `${(i * 37 + 11) % 97}%`, top: `${(i * 53 + 7) % 91}%`, animation: `twinkle ${2.5 + (i % 4) * 0.8}s ease-in-out infinite ${(i * 0.4) % 3}s` }} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Light mode: Moroccan tile wallpaper */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'url(/wall.jpg)', backgroundRepeat: 'repeat', backgroundSize: '420px auto', opacity: 0.55 }} />
          {/* Warm white overlay for readability */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(255,250,240,0.55)' }} />
        </>
      )}

      {/* ── Fixed Top Header (64px) ────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: T.header,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${T.navBorder}`,
        boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.04)' : '0 2px 16px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: T.accentBg, border: `1px solid ${T.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} style={{ color: T.accent }} strokeWidth={2.5} />
          </div>
          <span style={{ color: T.accent, fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>Gravity</span>
          <div style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, color: T.accent, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>Parent</div>
        </div>

        {/* Center: Section title */}
        <AnimatePresence mode="wait">
          <motion.span key={activeTab} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}
            style={{ color: T.text, fontSize: 13, fontWeight: 600, position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' as const }}>
            {SECTION_TITLES[activeTab]}
          </motion.span>
        </AnimatePresence>

        {/* Right: Theme toggle + Bell + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={toggleTheme}
            style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(255,193,7,0.12)' : 'rgba(99,102,241,0.1)', border: `1px solid ${isDark ? 'rgba(255,193,7,0.25)' : 'rgba(99,102,241,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <motion.div animate={{ rotate: isDark ? 0 : 180 }} transition={{ duration: 0.4, type: 'spring' }}>
              {isDark ? <Sun size={16} style={{ color: '#FFC107' }} /> : <Moon size={16} style={{ color: '#6366F1' }} />}
            </motion.div>
          </motion.button>

          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <motion.button whileTap={{ scale: 0.88 }} style={{ width: 36, height: 36, borderRadius: 10, background: T.itemBg, border: `1px solid ${T.itemBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('alerts')}>
              <Bell size={17} style={{ color: T.icon }} />
            </motion.button>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: 'white', border: `1.5px solid ${T.badgeBorder}` }}>{unreadCount}</div>
            )}
          </div>

          {/* Avatar */}
          <motion.div whileTap={{ scale: 0.9 }} onClick={() => setProfileOpen(true)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #D4A853, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', border: `2px solid ${T.accentBorder}`, cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 14px rgba(212,168,83,0.32)', overflow: 'hidden', position: 'relative' }}>
            {profileImg
              ? <img src={profileImg} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : (authUser ? getInitials(authUser.name) : 'G')}
          </motion.div>
        </div>
      </div>

      {/* ── Full-screen Uber Map (map tab) ───────────────────────── */}
      <AnimatePresence>
        {activeTab === 'map' && (
          <motion.div
            key="uber-map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, bottom: 68,
              zIndex: 20,
            }}
          >
            <UberFamilyMap height="100%" showMemberList />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content Area (scrollable, hidden when map active) ── */}
      <div style={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 68,
        overflowY: activeTab === 'map' ? 'hidden' : 'auto',
        overflowX: 'hidden',
        zIndex: 10,
        padding: '0 0 8px 0',
        visibility: activeTab === 'map' ? 'hidden' : 'visible',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ padding: '0 16px 80px 16px', minHeight: '100%' }}
          >
            {activeTab === 'dashboard' && <DashboardSection onNavigate={(tab) => setActiveTab(tab as Tab)} />}
            {activeTab === 'alerts' && <AlertsSection />}
            {activeTab === 'children' && <ChildrenMonitorSection />}
            {activeTab === 'health' && <HealthMonitorSection />}
            {activeTab === 'elderly' && <ElderlyMonitorSection />}
            {activeTab === 'driving' && <DrivingSection />}
            {activeTab === 'geofences' && <GeofenceSection />}
            {activeTab === 'journeys' && <JourneySection />}
            {activeTab === 'chat' && <FamilyChatSection />}
            {activeTab === 'settings' && <ParentSettingsSection />}
            {activeTab === 'family' && <FamilySection />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Floating SOS Button (dashboard tab only) ──────────── */}
      <AnimatePresence>
        {activeTab === 'dashboard' && (
          <motion.button
            key="sos-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setActiveTab('alerts')}
            style={{
              position: 'fixed',
              bottom: 88,
              right: 20,
              zIndex: 90,
              width: 52, height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #DC2626, #EF4444)',
              border: 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
            }}
          >
            {/* Pulse ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid rgba(239,68,68,0.7)',
              animation: 'pulse-ring 1.8s ease-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid rgba(239,68,68,0.4)',
              animation: 'pulse-ring 1.8s ease-out infinite 0.6s',
            }} />
            <AlertTriangle size={18} style={{ color: 'white' }} strokeWidth={2.5} />
            <span style={{ color: 'white', fontSize: 7, fontWeight: 800, letterSpacing: '0.5px', marginTop: 1 }}>SOS</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Fixed Bottom Nav (68px) ───────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 68, zIndex: 100, display: 'flex', background: T.nav, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: `1px solid ${T.navBorder}`, boxShadow: isDark ? 'none' : '0 -4px 24px rgba(0,0,0,0.06)', transition: 'all 0.3s ease' }}>
        {BOTTOM_TABS.map((tab) => {
          const active = isBottomActive(tab.id)
          const Icon = tab.icon
          const hasBadge = 'badge' in tab && tab.badge && tab.badge > 0
          return (
            <motion.button key={tab.id} whileTap={{ scale: 0.86 }} onClick={() => handleBottomTab(tab.id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 0 10px', position: 'relative' }}>
              {hasBadge && (
                <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(4px)', width: 15, height: 15, borderRadius: '50%', background: '#EF4444', fontSize: 8, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.badgeBorder}`, zIndex: 1 }}>
                  {'badge' in tab ? tab.badge : ''}
                </div>
              )}
              {/* Active glow pill */}
              {active && (
                <motion.div layoutId="nav-glow" style={{ position: 'absolute', top: 6, width: 40, height: 32, borderRadius: 10, background: T.accentBg, border: `1px solid ${T.accentBorder}` }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <Icon size={21} style={{ color: active ? T.accent : T.textMuted, zIndex: 1, transition: 'color 0.2s' }} strokeWidth={active ? 2.5 : 2} />
              <span style={{ fontSize: 9, fontWeight: 700, color: active ? T.accent : T.textMuted, letterSpacing: '0.4px', textTransform: 'uppercase' as const, zIndex: 1, transition: 'color 0.2s' }}>{tab.label}</span>
              {active && (
                <motion.div layoutId="bottom-tab-bar" style={{ position: 'absolute', bottom: 3, width: 20, height: 2.5, borderRadius: 2, background: T.accent }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ── Profile Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div key="profile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.25)' }} />
            <motion.div key="profile-panel" initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.95 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{ position: 'fixed', top: 72, right: 12, width: 260, zIndex: 310, background: T.profileBg, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: `1px solid ${T.profileBorder}`, borderRadius: 20, overflow: 'hidden', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.55)' : '0 12px 48px rgba(0,0,0,0.14)' }}>

              {/* Profile header */}
              <div style={{ padding: '20px 18px 16px', background: isDark ? 'linear-gradient(135deg,rgba(212,168,83,0.12) 0%,rgba(139,92,246,0.08) 100%)' : 'linear-gradient(135deg,rgba(212,168,83,0.08) 0%,rgba(139,92,246,0.05) 100%)', borderBottom: `1px solid ${T.divider}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#D4A853,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white', border: `2.5px solid ${T.accentBorder}`, boxShadow: '0 4px 18px rgba(212,168,83,0.32)', overflow: 'hidden' }}>
                    {profileImg
                      ? <img src={profileImg} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (authUser ? getInitials(authUser.name) : 'G')}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: '#D4A853', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Camera size={10} color="white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string
                      setProfileImg(dataUrl)
                      localStorage.setItem('gravity_parent_avatar', dataUrl)
                    }
                    reader.readAsDataURL(file)
                  }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{authUser?.name ?? 'Family Member'}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{authUser?.email ?? ''}</div>
                  <div style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 4, background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 6, padding: '2px 7px' }}>
                    <Star size={9} style={{ color: T.accent }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, letterSpacing: '0.5px' }}>PARENT</span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '10px 10px' }}>
                {[
                  { icon: User, label: 'My Profile', sub: 'View & edit profile', action: () => { setProfileOpen(false); setActiveTab('settings') } },
                  { icon: Users, label: 'Family', sub: 'Invite code & members', action: () => { setProfileOpen(false); setActiveTab('family') } },
                  { icon: Bell, label: 'Notifications', sub: `${unreadCount} unread alerts`, action: () => { setProfileOpen(false); setActiveTab('alerts') } },
                  { icon: CreditCard, label: 'Subscription', sub: 'Free plan · Upgrade', action: () => { setProfileOpen(false); router.push('/pricing') } },
                  { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, contact us', action: () => { setProfileOpen(false) } },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={item.action}
                      style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '10px 10px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: T.itemBg, border: `1px solid ${T.itemBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={15} style={{ color: T.icon }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{item.sub}</div>
                      </div>
                      <ChevronRight size={13} style={{ color: T.textMuted, flexShrink: 0 }} />
                    </motion.button>
                  )
                })}
              </div>

              {/* Logout */}
              <div style={{ padding: '0 10px 14px' }}>
                <div style={{ height: 1, background: T.divider, marginBottom: 10 }} />
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 10px', borderRadius: 12, background: T.logoutBg, border: `1px solid ${T.logoutBorder}`, cursor: 'pointer' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LogOut size={15} style={{ color: '#EF4444' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Side Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.5)',
              }}
            />

            {/* Drawer panel */}
            <motion.div key="drawer-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 270, zIndex: 210, background: T.drawer, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderLeft: `1px solid ${T.drawerBorder}`, display: 'flex', flexDirection: 'column', boxShadow: isDark ? '-8px 0 40px rgba(0,0,0,0.4)' : '-4px 0 24px rgba(0,0,0,0.1)' }}>
              {/* Drawer header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 16px', borderBottom: `1px solid ${T.divider}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={15} style={{ color: T.accent }} />
                  </div>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>More</span>
                </div>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setDrawerOpen(false)}
                  style={{ width: 30, height: 30, borderRadius: 8, background: T.itemBg, border: `1px solid ${T.itemBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={15} style={{ color: T.icon }} />
                </motion.button>
              </div>

              {/* Drawer items */}
              <div style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
                {DRAWER_ITEMS.map((item, i) => {
                  const Icon = item.icon
                  const active = activeTab === item.id
                  return (
                    <motion.button key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} whileTap={{ scale: 0.97 }} onClick={() => handleDrawerItem(item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 13, background: active ? T.accentBg : 'transparent', border: `1px solid ${active ? T.accentBorder : 'transparent'}`, cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.18s' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? T.accentBg : T.itemBg, border: `1px solid ${active ? T.accentBorder : T.itemBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.18s' }}>
                        <Icon size={17} style={{ color: active ? T.accent : T.icon }} />
                      </div>
                      <span style={{ flex: 1, color: active ? T.accent : T.text, fontWeight: active ? 700 : 500, fontSize: 13 }}>{item.label}</span>
                      <ChevronRight size={14} style={{ color: active ? T.accent : T.textMuted }} />
                    </motion.button>
                  )
                })}
              </div>

              {/* Drawer footer: logout */}
              <div style={{ padding: '12px 12px 28px' }}>
                <div style={{ height: 1, background: T.divider, marginBottom: 12 }} />
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', width: '100%', borderRadius: 13, background: T.logoutBg, border: `1px solid ${T.logoutBorder}`, cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut size={16} style={{ color: '#EF4444' }} />
                  </div>
                  <span style={{ color: '#EF4444', fontWeight: 600, fontSize: 13 }}>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
