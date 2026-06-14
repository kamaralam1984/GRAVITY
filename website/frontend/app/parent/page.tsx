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
} from 'lucide-react'
import { DashboardSection, FamilyMapSection, AlertsSection } from '@/components/parent/ParentDash'
import { ChildrenMonitorSection, ElderlyMonitorSection, DrivingSection } from '@/components/parent/ParentMonitor'
import { GeofenceSection, JourneySection, FamilyChatSection, ParentSettingsSection } from '@/components/parent/ParentControl'
import { useRouter } from 'next/navigation'
import { getUser, clearAuth, type AuthUser } from '@/lib/auth'

type Tab = 'dashboard' | 'map' | 'alerts' | 'children' | 'elderly' | 'driving' | 'geofences' | 'journeys' | 'chat' | 'settings'

const BOTTOM_TABS = [
  { id: 'dashboard' as Tab, icon: Home, label: 'Home' },
  { id: 'map' as Tab, icon: Map, label: 'Map' },
  { id: 'alerts' as Tab, icon: Bell, label: 'Safety', badge: 3 },
  { id: 'children' as Tab, icon: Users, label: 'Monitor' },
  { id: 'more', icon: Menu, label: 'More' },
] as const

const DRAWER_ITEMS = [
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
  elderly: 'Elderly Care',
  driving: 'Driving Safety',
  geofences: 'Geofences',
  journeys: 'Journeys',
  chat: 'Family Chat',
  settings: 'Settings',
}

export default function ParentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount] = useState(3)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('gv_token')
    if (!token) {
      router.replace('/login')
      return
    }
    setAuthUser(getUser())
  }, [router])

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
    <div style={{ position: 'fixed', inset: 0, background: '#0B0D13', overflow: 'hidden' }}>

      {/* ── CSS keyframes ──────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-18px) translateX(8px); }
          66% { transform: translateY(10px) translateX(-6px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.4); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes drawerSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-enter { animation: drawerSlide 0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      {/* ── Background VFX ────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(212,168,83,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.03) 0%, transparent 60%), #0B0D13',
      }} />

      {/* Floating orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)',
          top: '-80px', left: '-80px',
          animation: 'float 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          bottom: '60px', right: '-60px',
          animation: 'float 18s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          top: '40%', left: '30%',
          animation: 'float 22s ease-in-out infinite 4s',
        }} />
      </div>

      {/* Star dots */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i % 3 === 0 ? 2 : 1.5,
            height: i % 3 === 0 ? 2 : 1.5,
            borderRadius: '50%',
            background: 'white',
            left: `${(i * 37 + 11) % 97}%`,
            top: `${(i * 53 + 7) % 91}%`,
            animation: `twinkle ${2.5 + (i % 4) * 0.8}s ease-in-out infinite ${(i * 0.4) % 3}s`,
          }} />
        ))}
      </div>

      {/* ── Fixed Top Header (64px) ────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(11,13,19,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={24} style={{ color: '#D4A853' }} strokeWidth={2.5} />
          <span style={{ color: '#D4A853', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>Gravity</span>
          <div style={{
            background: 'rgba(212,168,83,0.15)',
            border: '1px solid rgba(212,168,83,0.3)',
            color: '#D4A853',
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 20,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>Parent</div>
        </div>

        {/* Center: Section title */}
        <AnimatePresence mode="wait">
          <motion.span
            key={activeTab}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 13,
              fontWeight: 600,
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {SECTION_TITLES[activeTab]}
          </motion.span>
        </AnimatePresence>

        {/* Right: Bell + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <motion.button
              whileTap={{ scale: 0.88 }}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('alerts')}
            >
              <Bell size={17} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </motion.button>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#EF4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 800, color: 'white',
                border: '1.5px solid #0B0D13',
              }}>{unreadCount}</div>
            )}
          </div>

          {/* Avatar */}
          <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={() => setProfileOpen(true)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4A853, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: 'white',
              border: '2px solid rgba(212,168,83,0.4)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 12px rgba(212,168,83,0.3)',
            }}
          >
            {authUser ? getInitials(authUser.name) : 'G'}
          </motion.div>
        </div>
      </div>

      {/* ── Main Content Area (scrollable) ────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 68,
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 10,
        padding: '0 0 8px 0',
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
            {activeTab === 'dashboard' && <DashboardSection />}
            {activeTab === 'map' && <FamilyMapSection />}
            {activeTab === 'alerts' && <AlertsSection />}
            {activeTab === 'children' && <ChildrenMonitorSection />}
            {activeTab === 'elderly' && <ElderlyMonitorSection />}
            {activeTab === 'driving' && <DrivingSection />}
            {activeTab === 'geofences' && <GeofenceSection />}
            {activeTab === 'journeys' && <JourneySection />}
            {activeTab === 'chat' && <FamilyChatSection />}
            {activeTab === 'settings' && <ParentSettingsSection />}
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
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 68,
        zIndex: 100,
        display: 'flex',
        background: 'rgba(11,13,19,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        {BOTTOM_TABS.map((tab) => {
          const active = isBottomActive(tab.id)
          const Icon = tab.icon
          const hasBadge = 'badge' in tab && tab.badge && tab.badge > 0
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleBottomTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0 10px',
                position: 'relative',
              }}
            >
              {/* Badge */}
              {hasBadge && (
                <div style={{
                  position: 'absolute', top: 6, left: '50%', transform: 'translateX(4px)',
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#EF4444',
                  fontSize: 8, fontWeight: 800, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #0B0D13',
                  zIndex: 1,
                }}>
                  {'badge' in tab ? tab.badge : ''}
                </div>
              )}

              <Icon
                size={22}
                style={{ color: active ? '#D4A853' : 'rgba(255,255,255,0.35)' }}
                strokeWidth={active ? 2.5 : 2}
              />
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: active ? '#D4A853' : 'rgba(255,255,255,0.35)',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}>{tab.label}</span>

              {/* Active indicator dot */}
              {active && (
                <motion.div
                  layoutId="bottom-tab-dot"
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    width: 16, height: 2,
                    borderRadius: 2,
                    background: '#D4A853',
                  }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ── Profile Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {profileOpen && (
          <>
            <motion.div
              key="profile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setProfileOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)' }}
            />
            <motion.div
              key="profile-panel"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{
                position: 'fixed', top: 72, right: 12,
                width: 260, zIndex: 310,
                background: 'rgba(18,22,36,0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(212,168,83,0.2)',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Profile header */}
              <div style={{
                padding: '20px 18px 16px',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.12) 0%, rgba(139,92,246,0.08) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4A853, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: 'white',
                  border: '2.5px solid rgba(212,168,83,0.5)',
                  boxShadow: '0 4px 16px rgba(212,168,83,0.3)',
                  flexShrink: 0,
                }}>
                  {authUser ? getInitials(authUser.name) : 'G'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {authUser?.name ?? 'Family Member'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {authUser?.email ?? ''}
                  </div>
                  <div style={{
                    marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)',
                    borderRadius: 6, padding: '2px 7px',
                  }}>
                    <Star size={9} style={{ color: '#D4A853' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#D4A853', letterSpacing: '0.5px' }}>PARENT</span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: '10px 10px' }}>
                {[
                  { icon: User, label: 'My Profile', sub: 'View & edit profile', action: () => { setProfileOpen(false); setActiveTab('settings') } },
                  { icon: Shield, label: 'Family Settings', sub: 'Manage family circle', action: () => { setProfileOpen(false); setActiveTab('settings') } },
                  { icon: Bell, label: 'Notifications', sub: `${unreadCount} unread alerts`, action: () => { setProfileOpen(false); setActiveTab('alerts') } },
                  { icon: CreditCard, label: 'Subscription', sub: 'Free plan · Upgrade', action: () => { setProfileOpen(false); router.push('/pricing') } },
                  { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, contact us', action: () => { setProfileOpen(false) } },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.97 }}
                      onClick={item.action}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 11,
                        width: '100%', padding: '10px 10px',
                        borderRadius: 12, background: 'transparent',
                        border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={15} style={{ color: 'rgba(255,255,255,0.55)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{item.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{item.sub}</div>
                      </div>
                      <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    </motion.button>
                  )
                })}
              </div>

              {/* Logout */}
              <div style={{ padding: '0 10px 14px' }}>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 10 }} />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 10px',
                    borderRadius: 12,
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
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
            <motion.div
              key="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 260, zIndex: 210,
                background: 'rgba(17,20,32,0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Drawer header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 16px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={18} style={{ color: '#D4A853' }} />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 14 }}>More</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
                </motion.button>
              </div>

              {/* Drawer items */}
              <div style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {DRAWER_ITEMS.map((item, i) => {
                  const Icon = item.icon
                  const active = activeTab === item.id
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDrawerItem(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px',
                        borderRadius: 12,
                        background: active ? 'rgba(212,168,83,0.12)' : 'transparent',
                        border: active ? '1px solid rgba(212,168,83,0.25)' : '1px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: active ? 'rgba(212,168,83,0.15)' : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={17} style={{ color: active ? '#D4A853' : 'rgba(255,255,255,0.5)' }} />
                      </div>
                      <span style={{
                        flex: 1,
                        color: active ? '#D4A853' : 'rgba(255,255,255,0.7)',
                        fontWeight: active ? 700 : 500,
                        fontSize: 13,
                      }}>{item.label}</span>
                      <ChevronRight size={14} style={{ color: active ? '#D4A853' : 'rgba(255,255,255,0.2)' }} />
                    </motion.button>
                  )
                })}
              </div>

              {/* Drawer footer: logout */}
              <div style={{ padding: '12px 12px 24px' }}>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 12 }} />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', width: '100%',
                    borderRadius: 12,
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
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
