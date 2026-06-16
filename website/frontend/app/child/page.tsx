'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Shield,
  MapPin,
  Heart,
  Award,
  MessageCircle,
  Settings,
  Zap,
  Bell,
  User,
  AlertTriangle,
  LogOut,
  Star,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
const ChildHome = dynamic(() => import('@/components/child/ChildHome'), { ssr: false })
import { SOSSection, LocationSection, FamilyRadarSection } from '@/components/child/ChildSOS'
const FloatingSOS = dynamic(() => import('@/components/child/FloatingSOS'), { ssr: false })
const PWAInstallBanner = dynamic(() => import('@/components/child/PWAInstallBanner'), { ssr: false })
const MonitoringProvider = dynamic(() => import('@/components/child/MonitoringProvider'), { ssr: false })
import {
  SchoolSection,
  HealthSection,
  AchievementsSection,
  ChatSection,
  SettingsSection,
} from '@/components/child/ChildLife'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | 'home'
  | 'sos'
  | 'location'
  | 'school'
  | 'health'
  | 'achievements'
  | 'chat'
  | 'settings'
  | 'family-radar'

// ─── Tab config ───────────────────────────────────────────────────────────────

const BOTTOM_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'sos', label: 'Safety', icon: Shield },
  { id: 'school', label: 'School', icon: Zap },
  { id: 'health', label: 'Health', icon: Heart },
]

const MORE_TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'achievements', label: 'Achievements', icon: Award, desc: 'Your rewards & badges' },
  { id: 'chat', label: 'Family Chat', icon: MessageCircle, desc: 'Message family members' },
  { id: 'family-radar', label: 'Family Radar', icon: MapPin, desc: 'See everyone nearby' },
  { id: 'location', label: 'My Location', icon: MapPin, desc: 'Share your location' },
  { id: 'settings', label: 'Settings', icon: Settings, desc: 'App preferences' },
]

const SECTION_TITLES: Record<Tab, string> = {
  home: 'My Dashboard',
  sos: 'Safety & SOS',
  location: 'My Location',
  school: 'School Life',
  health: 'My Health',
  achievements: 'Achievements',
  chat: 'Family Chat',
  settings: 'Settings',
  'family-radar': 'Family Radar',
}

// ─── Starfield ────────────────────────────────────────────────────────────────

function Starfield() {
  const stars = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: 0.3 + Math.random() * 0.3,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    }))
  )

  return (
    <>
      {stars.current.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'fixed',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 2,
            height: 2,
            borderRadius: '50%',
            backgroundColor: '#fff',
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

import { getUser, getToken, type AuthUser } from '@/lib/auth'

export default function ChildPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const tabTimeRef = useRef<number>(Date.now())
  const lastTabRef = useRef<string>('home')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifCount] = useState(3)
  const [prevTab, setPrevTab] = useState<Tab>('home')
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [battery, setBattery] = useState<number>(0)
  const [familyOnline, setFamilyOnline] = useState<number>(0)
  const [familyId, setFamilyId] = useState<number | undefined>()
  const [famId, setFamId] = useState<number | null>(null)
  const [steps, setSteps] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    const user = getUser()
    if (!user) { router.replace('/login'); return }
    setAuthUser(user)

    // Read real device battery and send heartbeat
    async function sendHeartbeat(batteryPct?: number) {
      try {
        await fetch('/auth/heartbeat', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ battery: batteryPct ?? null }),
        })
      } catch { /* ignore */ }
    }

    async function readBatteryAndHeartbeat() {
      try {
        // Browser Battery Status API (works on Android Chrome)
        const nav = navigator as any
        if (nav.getBattery) {
          const bat = await nav.getBattery()
          const pct = Math.round(bat.level * 100)
          setBattery(pct)
          sendHeartbeat(pct)
          bat.onlevelchange = () => {
            const updated = Math.round(bat.level * 100)
            setBattery(updated)
            sendHeartbeat(updated)
          }
        } else {
          sendHeartbeat()
        }
      } catch { sendHeartbeat() }
    }

    async function loadData() {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const famRes = await fetch('/families/my', { headers })
        if (famRes.ok) {
          const families = await famRes.json()
          if (families.length > 0) {
            const fid = families[0].id
            setFamilyId(fid)
            if (families[0]?.id) setFamId(families[0].id)
            // Use /families/members for online count — counts heartbeat-active web users too
            const membersRes = await fetch(`/families/${fid}/members`, { headers })
            if (membersRes.ok) {
              const members = await membersRes.json()
              setFamilyOnline(members.filter((m: { is_online: boolean }) => m.is_online).length)
              const me = members.find((m: { user_id: number; battery?: number }) => m.user_id === user!.id)
              if (me?.battery != null && me.battery > 0) setBattery(me.battery)
            }
          }
        }
        // Fetch today's health record for step count
        if (user) {
          try {
            const hRes = await fetch(`/health/records/${user.id}`, { headers })
            if (hRes.ok) {
              const recs = await hRes.json()
              if (recs.length > 0) setSteps(recs[0].steps ?? 0)
            }
          } catch { /* ignore */ }
        }
      } catch (_) {}
      setDataLoaded(true)
    }

    readBatteryAndHeartbeat()
    loadData()
    const hbInterval = setInterval(() => sendHeartbeat(), 60_000)

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

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    return () => {
      clearInterval(hbInterval)
      if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId)
    }
  }, [router])

  async function handleJoinFamily() {
    if (!joinCode.trim()) { setJoinError('Invite code daalo'); return }
    setJoinLoading(true); setJoinError('')
    try {
      const token = getToken()
      const res = await fetch(`/families/join/${joinCode.trim().toUpperCase()}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid invite code')
      setJoinSuccess(true)
      setFamilyId(data.family_id ?? data.id)
      // Reload page after 1.5s so all family data loads fresh
      setTimeout(() => window.location.reload(), 1500)
    } catch (e: any) {
      setJoinError(e.message || 'Failed to join family')
    } finally { setJoinLoading(false) }
  }

  async function logTabActivity(newTab: string) {
    const duration = Math.round((Date.now() - tabTimeRef.current) / 1000)
    const token = getToken()
    if (token && duration > 5) {
      fetch('/monitoring/activity', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: lastTabRef.current, duration_seconds: duration, family_id: famId ?? 0 })
      }).catch(() => {})
    }
    tabTimeRef.current = Date.now()
    lastTabRef.current = newTab
  }

  function handleTabChange(tab: Tab) {
    logTabActivity(tab)
    setPrevTab(activeTab)
    setActiveTab(tab)
    setDrawerOpen(false)
  }

  function renderSection() {
    // If no family joined yet, show join prompt on all tabs
    if (dataLoaded && !familyId && activeTab === 'home') {
      return (
        <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 48 }}>👨‍👩‍👧</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center' }}>You haven't joined a family yet</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 280 }}>
            Get an invite code from your parent and enter it below to join your family circle
          </div>
          {joinSuccess ? (
            <div style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981', fontSize: 14, fontWeight: 600 }}>
              ✓ Family join ho gayi! Loading...
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {joinError && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: 13 }}>{joinError}</div>}
              <input
                type="text"
                placeholder="Invite code (e.g. YULfi8RU)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinFamily()}
                style={{ padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 16, outline: 'none', letterSpacing: 2, textAlign: 'center', fontWeight: 700 }}
              />
              <button
                onClick={handleJoinFamily}
                disabled={joinLoading}
                style={{ padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: joinLoading ? 'not-allowed' : 'pointer', opacity: joinLoading ? 0.7 : 1 }}
              >
                {joinLoading ? 'Joining...' : 'Family Join Karo'}
              </button>
            </div>
          )}
        </div>
      )
    }
    switch (activeTab) {
      case 'home':
        return (
          <ChildHome
            childName={authUser?.name ?? 'You'}
            safeStatus="safe"
            steps={steps}
            battery={battery}
            familyOnline={familyOnline}
            onNavigate={(tab) => handleTabChange(tab as Tab)}
          />
        )
      case 'sos':
        return <SOSSection familyId={familyId} userId={authUser?.id} />
      case 'location':
        return <LocationSection famId={famId} />
      case 'family-radar':
        return <FamilyRadarSection />
      case 'school':
        return <SchoolSection userId={authUser?.id} />
      case 'health':
        return <HealthSection userId={authUser?.id} />
      case 'achievements':
        return <AchievementsSection />
      case 'chat':
        return <ChatSection familyId={familyId} userId={authUser?.id} userName={authUser?.name} />
      case 'settings':
        return <SettingsSection user={authUser} />
      default:
        return null
    }
  }

  const isMoreTab = MORE_TABS.some((t) => t.id === activeTab)

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-20px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.8; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Background ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at 20% 20%, #0D1B2A 0%, #0B0D13 100%)',
          zIndex: -2,
        }}
      />

      {/* Orb 1 — emerald top-left */}
      <div
        style={{
          position: 'fixed',
          top: '-80px',
          left: '-80px',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(16,185,129,0.06)',
          filter: 'blur(80px)',
          animation: 'float 8s ease-in-out infinite',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
      {/* Orb 2 — blue top-right */}
      <div
        style={{
          position: 'fixed',
          top: '-60px',
          right: '-60px',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.05)',
          filter: 'blur(80px)',
          animation: 'float 10s 2s ease-in-out infinite',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
      {/* Orb 3 — gold bottom-center */}
      <div
        style={{
          position: 'fixed',
          bottom: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(184,114,10,0.06)',
          filter: 'blur(70px)',
          animation: 'float 12s 4s ease-in-out infinite',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {/* Starfield */}
      <Starfield />

      {/* ── Root shell ── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          maxWidth: 480,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        {/* ── TOP HEADER (60px) ── */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            background: 'rgba(11,13,19,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            zIndex: 50,
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #B8720A, #F5A623)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #F5A623, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.3px',
              }}
            >
              Gravity
            </span>
          </div>

          {/* Section title */}
          <AnimatePresence mode="wait">
            <motion.span
              key={activeTab}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: '0.2px',
              }}
            >
              {SECTION_TITLES[activeTab]}
            </motion.span>
          </AnimatePresence>

          {/* Right: bell + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification bell */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} color="rgba(255,255,255,0.7)" />
              {notifCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#EF4444',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0B0D13',
                  }}
                >
                  {notifCount}
                </span>
              )}
            </motion.button>

            {/* Avatar */}
            <motion.div
              whileTap={{ scale: 0.88 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid rgba(245,166,35,0.4)',
              }}
            >
              <User size={16} color="#fff" strokeWidth={2} />
            </motion.div>
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            marginTop: 60,
            marginBottom: 65,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ padding: '0 16px 16px' }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── FLOATING SOS BUTTON (home tab only) ── */}
        <AnimatePresence>
          {activeTab === 'home' && (
            <motion.button
              key="sos-fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => handleTabChange('sos')}
              style={{
                position: 'fixed',
                bottom: 80,
                right: 20,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
                zIndex: 40,
              }}
            >
              <AlertTriangle size={20} color="#fff" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── BOTTOM NAVIGATION (65px) ── */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            height: 65,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            background: 'rgba(11,13,19,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            zIndex: 50,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {BOTTOM_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTabChange(id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  height: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 0 2px',
                  position: 'relative',
                }}
              >
                <Icon
                  size={22}
                  color={isActive ? '#F5A623' : 'rgba(255,255,255,0.35)'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F5A623' : 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.2px',
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: '#F5A623',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}

          {/* More button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setDrawerOpen(true)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              height: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0 2px',
              position: 'relative',
            }}
          >
            <Menu
              size={22}
              color={isMoreTab ? '#F5A623' : 'rgba(255,255,255,0.35)'}
              strokeWidth={isMoreTab ? 2.5 : 1.8}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: isMoreTab ? 600 : 400,
                color: isMoreTab ? '#F5A623' : 'rgba(255,255,255,0.35)',
                letterSpacing: '0.2px',
              }}
            >
              More
            </span>
            {isMoreTab && (
              <motion.div
                layoutId="nav-dot"
                style={{
                  position: 'absolute',
                  bottom: 4,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#F5A623',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        </nav>
      </div>

      {/* ── SIDE DRAWER (slides from right) ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 60,
              }}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer-panel"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 280,
                background: 'rgba(14,17,25,0.97)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                zIndex: 70,
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 'env(safe-area-inset-top, 0px)',
              }}
            >
              {/* Drawer header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 20px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.9)',
                    letterSpacing: '-0.2px',
                  }}
                >
                  More Sections
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} color="rgba(255,255,255,0.7)" />
                </motion.button>
              </div>

              {/* Drawer items */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
                {MORE_TABS.map(({ id, label, icon: Icon, desc }, idx) => {
                  const isActive = activeTab === id
                  return (
                    <motion.button
                      key={id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleTabChange(id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: isActive
                          ? 'rgba(245,166,35,0.12)'
                          : 'rgba(255,255,255,0.03)',
                        border: isActive
                          ? '1px solid rgba(245,166,35,0.25)'
                          : '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        marginBottom: 6,
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: isActive
                            ? 'rgba(245,166,35,0.2)'
                            : 'rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          size={18}
                          color={isActive ? '#F5A623' : 'rgba(255,255,255,0.5)'}
                          strokeWidth={2}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: isActive ? '#F5A623' : 'rgba(255,255,255,0.85)',
                            marginBottom: 2,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.35)',
                            lineHeight: 1.3,
                          }}
                        >
                          {desc}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Drawer footer */}
              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    localStorage.removeItem('gv_token')
                    router.replace('/login')
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.18)',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} color='#EF4444' strokeWidth={2} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
                    Sign Out
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MonitoringProvider famId={famId} />
      <PWAInstallBanner />
      <FloatingSOS famId={famId} childName={authUser?.name ?? 'Child'} />
    </>
  )
}
