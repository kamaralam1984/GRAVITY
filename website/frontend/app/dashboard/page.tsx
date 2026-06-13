'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { MAP_MEMBERS, MapMember, VehicleType } from '@/lib/mapData'
import { getUser, clearAuth, AuthUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

/* ── Dynamic MapView (no SSR) ─────────────────────────────────── */
const MapView = dynamic(() => import('@/components/sections/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#071428] rounded-3xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#D4A853] text-sm font-medium tracking-wider">Loading Map…</span>
      </div>
    </div>
  ),
})

/* ── Vehicle emoji map ────────────────────────────────────────── */
const VEHICLE_EMOJI: Record<VehicleType, string> = {
  car:   '🚗',
  bus:   '🚌',
  walk:  '🚶',
  bike:  '🚲',
  auto:  '🛺',
  tempo: '🚛',
}

/* ── Mock alerts ──────────────────────────────────────────────── */
type AlertSeverity = 'safe' | 'warning' | 'sos' | 'info'

interface DashAlert {
  id: string
  icon: string
  title: string
  message: string
  time: string
  severity: AlertSeverity
}

const INITIAL_ALERTS: DashAlert[] = [
  {
    id: 'a1',
    icon: '📍',
    title: 'Geofence Entered',
    message: 'Anya entered the School zone at 8:42 AM',
    time: '8:42 AM',
    severity: 'safe',
  },
  {
    id: 'a2',
    icon: '🔋',
    title: 'Battery Low',
    message: "Priya's battery is at 42% — consider charging soon",
    time: '11:15 AM',
    severity: 'warning',
  },
  {
    id: 'a3',
    icon: '🚨',
    title: 'SOS Cleared',
    message: "Dad's SOS alert has been resolved. All clear.",
    time: '9:03 AM',
    severity: 'sos',
  },
  {
    id: 'a4',
    icon: '🏠',
    title: 'Geofence Exited',
    message: 'Mom left the Home zone at 7:30 AM',
    time: '7:30 AM',
    severity: 'info',
  },
]

/* ── Mock journey timeline per member ─────────────────────────── */
const JOURNEY_TIMELINE: Record<string, { time: string; place: string; icon: string }[]> = {
  mom:     [{ time: '7:30 AM', place: 'Left Home', icon: '🏠' }, { time: '8:15 AM', place: 'Arrived Market', icon: '🛒' }, { time: '10:00 AM', place: 'Back Home', icon: '🏠' }],
  dad:     [{ time: '8:00 AM', place: 'Left Home', icon: '🏠' }, { time: '9:20 AM', place: 'Arrived Office', icon: '🏢' }],
  priya:   [{ time: '7:45 AM', place: 'Left Home', icon: '🏠' }, { time: '8:50 AM', place: 'Arrived College', icon: '🎓' }],
  anya:    [{ time: '7:00 AM', place: 'Left Home', icon: '🏠' }, { time: '8:42 AM', place: 'Arrived School', icon: '🏫' }],
  grandpa: [{ time: '9:00 AM', place: 'Left Home', icon: '🏠' }, { time: '9:35 AM', place: 'At Market', icon: '🛍️' }],
}

/* ── Severity color helpers ───────────────────────────────────── */
function alertBg(s: AlertSeverity) {
  if (s === 'safe')    return 'bg-emerald-500/10 border-emerald-500/25'
  if (s === 'warning') return 'bg-amber-500/10 border-amber-500/25'
  if (s === 'sos')     return 'bg-red-500/10 border-red-500/25'
  return 'bg-blue-500/10 border-blue-500/25'
}
function alertDot(s: AlertSeverity) {
  if (s === 'safe')    return 'bg-emerald-400'
  if (s === 'warning') return 'bg-amber-400'
  if (s === 'sos')     return 'bg-red-400'
  return 'bg-blue-400'
}

/* ── Battery bar color ─────────────────────────────────────────── */
function batteryColor(pct: number) {
  if (pct > 60) return 'bg-emerald-400'
  if (pct > 30) return 'bg-amber-400'
  return 'bg-red-400'
}

/* ── Tab type ──────────────────────────────────────────────────── */
type Tab = 'family' | 'alerts' | 'profile'

/* ── Settings key type ─────────────────────────────────────────── */
type SettingKey = 'location' | 'pushNotif' | 'sosAutoCall' | 'batteryAlerts'

/* ── Framer variants ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────*/
export default function DashboardPage() {
  const router = useRouter()

  /* auth */
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  /* map */
  const [activeId,  setActiveId]  = useState<string | null>(null)

  /* panels */
  const [tab,       setTab]       = useState<Tab>('family')
  const [mobileTab, setMobileTab] = useState<Tab>('family')
  const [expanded,  setExpanded]  = useState<string | null>(null)

  /* alerts */
  const [alerts, setAlerts] = useState<DashAlert[]>(INITIAL_ALERTS)

  /* profile toggles */
  const [toggles, setToggles] = useState<Record<SettingKey, boolean>>({
    location:     true,
    pushNotif:    true,
    sosAutoCall:  false,
    batteryAlerts: true,
  })

  /* notification bell popup */
  const [bellOpen, setBellOpen] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/login'); return }
    setAuthUser(u)
  }, [router])

  const handleMemberClick = useCallback((id: string) => {
    setActiveId(prev => (prev === id ? null : id))
    setExpanded(prev => (prev === id ? null : id))
    setTab('family')
    setMobileTab('family')
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const dismissAlert = (id: string) =>
    setAlerts(prev => prev.filter(a => a.id !== id))

  const toggleSetting = (key: SettingKey) =>
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))

  /* ── Determine active panel tab (desktop + mobile merge) ─────── */
  const activeTab: Tab = tab

  /* ── Responsive active tab selector ──────────────────────────── */
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#071428' }}>
        <div className="w-10 h-10 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#071428', color: 'var(--text-primary)' }}
    >

      {/* ══════════════ TOP HEADER ══════════════════════════════ */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 h-14 border-b border-white/5"
        style={{ background: 'rgba(7,20,40,0.92)', backdropFilter: 'blur(20px)' }}
      >
        {/* Left — logo + title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
              style={{ background: 'linear-gradient(135deg, #D4A853, #92580A)' }}
            >G</div>
            <span className="font-black text-sm tracking-widest uppercase hidden sm:block"
              style={{ color: '#D4A853', fontFamily: 'var(--font-display)' }}
            >GRAVITY</span>
          </div>
          <div className="w-px h-4 bg-white/15 hidden sm:block" />
          <span className="text-white/70 text-sm font-medium hidden sm:block">My Dashboard</span>
        </div>

        {/* Center — All Safe pill */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide"
          style={{ background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.35)', color: '#10B981' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          All Safe
        </motion.div>

        {/* Right — bell + avatar */}
        <div className="flex items-center gap-3">

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen(v => !v)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-base">🔔</span>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: '#EF4444', color: '#fff' }}
              >3</span>
            </button>

            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  key="bell-popup"
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className="absolute right-0 top-10 w-72 rounded-2xl p-3 flex flex-col gap-2 shadow-2xl z-50"
                  style={{ background: '#0D1A2E', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <p className="text-xs text-white/50 font-semibold uppercase tracking-wider px-1 mb-1">Recent</p>
                  {alerts.slice(0, 3).map(a => (
                    <div key={a.id} className={`flex items-start gap-2 p-2 rounded-xl border ${alertBg(a.severity)}`}>
                      <span className="text-lg leading-none mt-0.5">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/90 truncate">{a.title}</p>
                        <p className="text-[10px] text-white/45 truncate">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar + name */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #D4A853 0%, #92580A 100%)', color: '#fff' }}
            >
              {authUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-white/80 hidden sm:block max-w-[100px] truncate">
              {authUser.name}
            </span>
          </div>
        </div>
      </header>

      {/* ══════════════ MAIN CONTENT ════════════════════════════ */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-5 pb-24 lg:pb-5">

        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Map container */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show"
            className="relative rounded-3xl overflow-hidden flex-shrink-0"
            style={{ height: 400, border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <MapView activeId={activeId} onMemberClick={handleMemberClick} />

            {/* Active member overlay — appears top-left on map */}
            <AnimatePresence>
              {activeId && (() => {
                const m = MAP_MEMBERS.find(x => x.id === activeId)
                if (!m) return null
                return (
                  <motion.div
                    key={activeId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute top-3 left-3 flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl z-10"
                    style={{ background: 'rgba(7,20,40,0.85)', border: `1px solid ${m.color}40` }}
                  >
                    <img src={m.photo} alt={m.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      style={{ border: `2px solid ${m.color}` }} />
                    <div>
                      <p className="text-xs font-bold text-white leading-none">{m.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: m.color }}>{m.location} · {VEHICLE_EMOJI[m.vehicle]} {m.speed ?? 0} km/h</p>
                    </div>
                    <button onClick={() => { setActiveId(null); setExpanded(null) }}
                      className="ml-1 text-white/40 hover:text-white/80 transition-colors text-sm leading-none">✕</button>
                  </motion.div>
                )
              })()}
            </AnimatePresence>
          </motion.div>

          {/* Member strip (horizontal scroll) */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show"
            className="flex gap-3 overflow-x-auto pb-1 scrollbar-none"
          >
            {MAP_MEMBERS.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMemberClick(m.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all"
                style={{
                  background: activeId === m.id ? `${m.color}18` : 'rgba(255,255,255,0.04)',
                  border: activeId === m.id ? `1px solid ${m.color}50` : '1px solid rgba(255,255,255,0.06)',
                  minWidth: 72,
                }}
              >
                <div className="relative">
                  <img src={m.photo} alt={m.name}
                    className="w-10 h-10 rounded-full object-cover"
                    style={{ border: `2px solid ${m.color}` }} />
                  <span className="absolute -bottom-0.5 -right-0.5 text-[11px] leading-none">
                    {VEHICLE_EMOJI[m.vehicle]}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-white/80 whitespace-nowrap">{m.name}</span>
                {/* Battery bar */}
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${batteryColor(m.battery)}`}
                    style={{ width: `${m.battery}%` }}
                  />
                </div>
                <span className="text-[9px] text-white/40">{m.battery}%</span>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN (desktop) ───────────────────────────── */}
        <div className="hidden lg:flex flex-col w-80 flex-shrink-0">
          <RightPanel
            tab={activeTab}
            setTab={setTab}
            expanded={expanded}
            setExpanded={setExpanded}
            alerts={alerts}
            dismissAlert={dismissAlert}
            toggles={toggles}
            toggleSetting={toggleSetting}
            authUser={authUser}
            handleLogout={handleLogout}
          />
        </div>

        {/* ── RIGHT COLUMN (mobile — shown when not on Map tab) ── */}
        <div className="lg:hidden flex flex-col">
          <AnimatePresence mode="wait">
            {mobileTab !== 'family' || true ? (
              <motion.div
                key={mobileTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {mobileTab === 'family' && (
                  <FamilyTab expanded={expanded} setExpanded={setExpanded} />
                )}
                {mobileTab === 'alerts' && (
                  <AlertsTab alerts={alerts} dismissAlert={dismissAlert} />
                )}
                {mobileTab === 'profile' && (
                  <ProfileTab
                    authUser={authUser}
                    toggles={toggles}
                    toggleSetting={toggleSetting}
                    handleLogout={handleLogout}
                  />
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      {/* ══════════════ MOBILE BOTTOM TAB BAR ══════════════════ */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex"
        style={{ background: 'rgba(7,20,40,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {(
          [
            { id: 'map',    label: 'Map',    emoji: '🗺️' },
            { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
            { id: 'alerts', label: 'Alerts', emoji: '🔔', badge: alerts.length },
            { id: 'profile',label: 'Profile',emoji: '👤' },
          ] as const
        ).map(item => {
          const isActive = item.id === 'map'
            ? mobileTab === 'family' && activeId === null // slight trick — map has no own tab state
            : mobileTab === item.id

          return (
            <button
              key={item.id}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors"
              style={{ color: mobileTab === item.id || (item.id === 'map' && !['alerts','profile'].includes(mobileTab)) ? '#D4A853' : 'rgba(255,255,255,0.4)' }}
              onClick={() => {
                if (item.id !== 'map') setMobileTab(item.id as Tab)
                else setMobileTab('family') // map tab just scrolls up on mobile
              }}
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="text-[9px] font-semibold tracking-wide uppercase">{item.label}</span>
              {'badge' in item && item.badge && item.badge > 0 ? (
                <span className="absolute top-1.5 right-[calc(50%-8px)] translate-x-3 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: '#EF4444', color: '#fff' }}>{item.badge}</span>
              ) : null}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   RIGHT PANEL WRAPPER (desktop tabs)
──────────────────────────────────────────────────────────────────*/
function RightPanel({
  tab, setTab, expanded, setExpanded,
  alerts, dismissAlert,
  toggles, toggleSetting,
  authUser, handleLogout,
}: {
  tab: Tab
  setTab: (t: Tab) => void
  expanded: string | null
  setExpanded: (id: string | null) => void
  alerts: DashAlert[]
  dismissAlert: (id: string) => void
  toggles: Record<SettingKey, boolean>
  toggleSetting: (k: SettingKey) => void
  authUser: AuthUser
  handleLogout: () => void
}) {
  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'family',  label: 'My Family', emoji: '👨‍👩‍👧' },
    { id: 'alerts',  label: 'Alerts',    emoji: '🔔' },
    { id: 'profile', label: 'Profile',   emoji: '👤' },
  ]

  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden"
      style={{ background: 'rgba(13,26,46,0.9)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
    >
      {/* Tab bar */}
      <div className="flex border-b border-white/7 px-2 pt-2 gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex flex-col items-center gap-0.5 pb-2.5 pt-2 rounded-t-xl relative transition-colors"
            style={{ color: tab === t.id ? '#D4A853' : 'rgba(255,255,255,0.4)' }}
          >
            <span className="text-base leading-none">{t.emoji}</span>
            <span className="text-[9px] font-semibold tracking-wide uppercase">{t.label}</span>
            {tab === t.id && (
              <motion.div layoutId="tab-indicator"
                className="absolute bottom-0 inset-x-2 h-0.5 rounded-full"
                style={{ background: '#D4A853' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
        <AnimatePresence mode="wait">
          {tab === 'family' && (
            <motion.div key="family" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FamilyTab expanded={expanded} setExpanded={setExpanded} />
            </motion.div>
          )}
          {tab === 'alerts' && (
            <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AlertsTab alerts={alerts} dismissAlert={dismissAlert} />
            </motion.div>
          )}
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfileTab
                authUser={authUser}
                toggles={toggles}
                toggleSetting={toggleSetting}
                handleLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   TAB 1 — MY FAMILY
──────────────────────────────────────────────────────────────────*/
function FamilyTab({
  expanded, setExpanded,
}: {
  expanded: string | null
  setExpanded: (id: string | null) => void
}) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-2">
      {MAP_MEMBERS.map(m => (
        <MemberCard key={m.id} member={m} expanded={expanded === m.id} onToggle={() => setExpanded(expanded === m.id ? null : m.id)} />
      ))}
    </motion.div>
  )
}

function MemberCard({ member: m, expanded, onToggle }: { member: MapMember; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.div
      variants={fadeUp}
      layout
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ background: expanded ? `${m.color}10` : 'rgba(255,255,255,0.03)', border: expanded ? `1px solid ${m.color}35` : '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Card header */}
      <button className="w-full flex items-center gap-3 p-3" onClick={onToggle}>
        <div className="relative flex-shrink-0">
          <img src={m.photo} alt={m.name} className="w-10 h-10 rounded-full object-cover" style={{ border: `2px solid ${m.color}` }} />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 bg-emerald-400"
            style={{ borderColor: '#0D1A2E' }} />
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white/90 truncate">{m.name}</p>
            <span className="text-xs text-white/40 ml-2 flex-shrink-0">{VEHICLE_EMOJI[m.vehicle]} {m.speed ?? 0} km/h</span>
          </div>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: m.color }}>{m.location}</p>

          {/* Battery bar */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full rounded-full ${batteryColor(m.battery)}`} style={{ width: `${m.battery}%` }} />
            </div>
            <span className="text-[10px] text-white/40 flex-shrink-0">{m.battery}%</span>
          </div>
        </div>

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/30 text-xs ml-1 flex-shrink-0"
        >▼</motion.span>
      </button>

      {/* Expanded section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-white/6 pt-3 flex flex-col gap-3">

              {/* Journey timeline */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">Today's Journey</p>
                <div className="flex flex-col gap-1.5">
                  {(JOURNEY_TIMELINE[m.id] ?? []).map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm">{step.icon}</span>
                      <span className="text-[11px] text-white/70">{step.place}</span>
                      <span className="text-[10px] text-white/30 ml-auto">{step.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geofence status */}
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="text-sm">📍</span>
                <p className="text-[11px] text-emerald-400 font-medium">Inside {m.location} zone</p>
                <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400 font-semibold">SAFE</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors hover:opacity-80"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA' }}
                >
                  📞 Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors hover:opacity-80"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}
                >
                  🚨 SOS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   TAB 2 — ALERTS
──────────────────────────────────────────────────────────────────*/
function AlertsTab({ alerts, dismissAlert }: { alerts: DashAlert[]; dismissAlert: (id: string) => void }) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <span className="text-4xl">✅</span>
        <p className="text-sm text-white/40 font-medium">No active alerts</p>
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-2">
      {alerts.map(a => (
        <motion.div
          key={a.id}
          variants={fadeUp}
          layout
          exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
          className={`flex items-start gap-3 p-3 rounded-2xl border ${alertBg(a.severity)}`}
        >
          <span className="text-xl leading-none mt-0.5 flex-shrink-0">{a.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-white/90 truncate">{a.title}</p>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alertDot(a.severity)}`} />
            </div>
            <p className="text-[11px] text-white/55 mt-0.5 leading-relaxed">{a.message}</p>
            <p className="text-[10px] text-white/30 mt-1">{a.time}</p>
          </div>
          <button
            onClick={() => dismissAlert(a.id)}
            className="text-white/25 hover:text-white/60 transition-colors text-sm leading-none flex-shrink-0 mt-0.5"
          >✕</button>
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   TAB 3 — PROFILE
──────────────────────────────────────────────────────────────────*/
function ProfileTab({
  authUser, toggles, toggleSetting, handleLogout,
}: {
  authUser: AuthUser
  toggles: Record<SettingKey, boolean>
  toggleSetting: (k: SettingKey) => void
  handleLogout: () => void
}) {
  const SETTINGS: { key: SettingKey; label: string; desc: string; emoji: string }[] = [
    { key: 'location',      label: 'Location Sharing',  desc: 'Share your location with family', emoji: '📍' },
    { key: 'pushNotif',     label: 'Push Notifications',desc: 'Receive alerts on your device',   emoji: '🔔' },
    { key: 'sosAutoCall',   label: 'SOS Auto-Call',     desc: 'Auto-call emergency on SOS',      emoji: '🚨' },
    { key: 'batteryAlerts', label: 'Battery Alerts',    desc: 'Notify when battery is low',      emoji: '🔋' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-3">

      {/* User info card */}
      <motion.div variants={fadeUp}
        className="flex items-center gap-3 p-3 rounded-2xl"
        style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)' }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #D4A853, #92580A)', color: '#fff' }}
        >
          {authUser.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white/95 truncate">{authUser.name}</p>
          <p className="text-[11px] text-white/45 truncate">{authUser.email}</p>
          <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(212,168,83,0.18)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.3)' }}
          >Member</span>
        </div>
      </motion.div>

      {/* Settings toggles */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35 px-1">Settings</p>
        {SETTINGS.map(s => (
          <motion.div key={s.key} variants={fadeUp}
            className="flex items-center gap-3 p-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-base flex-shrink-0">{s.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/85 truncate">{s.label}</p>
              <p className="text-[10px] text-white/35 truncate">{s.desc}</p>
            </div>
            <ToggleSwitch active={toggles[s.key]} onToggle={() => toggleSetting(s.key)} />
          </motion.div>
        ))}
      </div>

      {/* Logout button */}
      <motion.button
        variants={fadeUp}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all mt-1"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}
      >
        <span>🚪</span> Sign Out
      </motion.button>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   TOGGLE SWITCH COMPONENT
──────────────────────────────────────────────────────────────────*/
function ToggleSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200"
      style={{ background: active ? '#D4A853' : 'rgba(255,255,255,0.12)' }}
      aria-checked={active}
      role="switch"
    >
      <motion.span
        animate={{ x: active ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 rounded-full shadow-md"
        style={{ background: active ? '#fff' : 'rgba(255,255,255,0.5)' }}
      />
    </button>
  )
}
