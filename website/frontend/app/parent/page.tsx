'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MAP_MEMBERS } from '@/lib/mapData'

const MapView = dynamic(() => import('@/components/sections/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center"
         style={{ background: 'rgba(7,20,40,0.6)' }}>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ width: 36, height: 36, borderRadius: '50%',
                           background: 'rgba(16,185,129,0.15)',
                           border: '2px solid rgba(16,185,129,0.4)',
                           display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 16 }}>📍</span>
      </motion.div>
    </div>
  ),
})

/* ── Vehicle emoji ───────────────────────────────────────────── */
const V_EMOJI: Record<string, string> = {
  car: '🚗', bus: '🚌', walk: '🚶', bike: '🚲', auto: '🛺', tempo: '🚛',
}

/* ── Battery bar ─────────────────────────────────────────────── */
function Battery({ pct, color }: { pct: number; color: string }) {
  const bg = pct < 20 ? '#EF4444' : pct < 40 ? '#F59E0B' : color
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div className="h-full rounded-full" style={{ background: bg }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
      </div>
      <span className="text-[9px] tabular-nums font-semibold w-7 text-right"
            style={{ color: pct < 30 ? '#EF4444' : 'rgba(255,255,255,0.45)' }}>
        {pct}%
      </span>
    </div>
  )
}

/* ── Alert item ──────────────────────────────────────────────── */
const ALERTS = [
  { id: 1, type: 'geofence', icon: '🏫', msg: 'Anya reached School',   time: '8:42 AM', color: '#8B5CF6' },
  { id: 2, type: 'geofence', icon: '🏢', msg: 'Priya reached College', time: '9:05 AM', color: '#F59E0B' },
  { id: 3, type: 'battery',  icon: '🔋', msg: 'Priya battery 42%',     time: '11:30 AM', color: '#EF4444' },
  { id: 4, type: 'geofence', icon: '🏠', msg: 'Dad left Home',         time: '7:55 AM', color: '#10B981' },
]

/* ── Tabs ────────────────────────────────────────────────────── */
type Tab = 'map' | 'children' | 'alerts' | 'settings'
const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'map',      icon: '🗺️',  label: 'Live Map'  },
  { key: 'children', icon: '👧',   label: 'Children'  },
  { key: 'alerts',   icon: '🔔',   label: 'Alerts'    },
  { key: 'settings', icon: '⚙️',   label: 'Settings'  },
]

/* ── Children panel content ──────────────────────────────────── */
function ChildrenPanel({ activeId, setActiveId }: { activeId: string | null; setActiveId: (id: string | null) => void }) {
  const children = MAP_MEMBERS.filter(m => m.id === 'anya' || m.id === 'priya')

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">My Children</h2>
        <span className="text-[10px] px-2 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
          All Safe ✓
        </span>
      </div>

      {children.map((child, i) => (
        <motion.div
          key={child.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.01 }}
          className="rounded-2xl overflow-hidden cursor-pointer"
          style={{
            background: activeId === child.id ? `${child.color}12` : 'rgba(255,255,255,0.04)',
            border: activeId === child.id ? `1px solid ${child.color}40` : '1px solid rgba(255,255,255,0.07)',
          }}
          onClick={() => setActiveId(activeId === child.id ? null : child.id)}
        >
          {/* Card header */}
          <div className="flex items-center gap-3 p-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden"
                   style={{ border: `2.5px solid ${child.color}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={child.photo} alt={child.name} className="w-full h-full object-cover" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                style={{ background: child.color, border: '2px solid #071428' }}>
                ✓
              </motion.div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-white">{child.name}</p>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${child.color}20`, color: child.color }}>
                  {V_EMOJI[child.vehicle]} {child.vehicle.toUpperCase()}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                📍 {child.location} · {child.speed} km/h
              </p>
              <div className="mt-2">
                <Battery pct={child.battery} color={child.color} />
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-center justify-end gap-1 mb-1">
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.3, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] text-emerald-400 font-semibold">LIVE</span>
              </div>
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {activeId === child.id ? '▲' : '▼'}
              </span>
            </div>
          </div>

          {/* Expanded stats */}
          <AnimatePresence>
            {activeId === child.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="h-px mb-3" style={{ background: `${child.color}20` }} />
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Speed', val: `${child.speed} km/h`, icon: '⚡' },
                      { label: 'Geofence', val: child.location + ' ✓', icon: '🔒' },
                      { label: 'SOS Today', val: 'None', icon: '🛡️' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-2 text-center"
                           style={{ background: `${child.color}10`, border: `1px solid ${child.color}20` }}>
                        <span className="text-base">{s.icon}</span>
                        <p className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                        <p className="text-[9px] font-bold mt-0.5" style={{ color: child.color }}>{s.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Journey timeline */}
                  <div className="mt-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Today's Journey
                    </p>
                    {[
                      { time: '7:30 AM', event: 'Left Home 🏠', done: true },
                      { time: '8:05 AM', event: `Boarded ${V_EMOJI[child.vehicle]}`, done: true },
                      { time: '8:42 AM', event: `Arrived at ${child.location}`, done: true },
                      { time: '2:30 PM', event: 'Return journey', done: false },
                    ].map((step, si) => (
                      <div key={si} className="flex items-center gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                             style={{ background: step.done ? child.color : 'rgba(255,255,255,0.15)' }} />
                        <span className="text-[9px] flex-1" style={{ color: step.done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                          {step.event}
                        </span>
                        <span className="text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>{step.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all"
                            style={{ background: `${child.color}20`, color: child.color, border: `1px solid ${child.color}40` }}>
                      📞 Call
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      🆘 SOS
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      🗺️ Map
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

/* ── Alerts panel ─────────────────────────────────────────────── */
function AlertsPanel() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">Recent Alerts</h2>
        <button className="text-[10px] font-semibold" style={{ color: 'var(--gold)' }}>Clear all</button>
      </div>
      {ALERTS.map((alert, i) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
               style={{ background: `${alert.color}15`, border: `1px solid ${alert.color}30` }}>
            {alert.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{alert.msg}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{alert.time}</p>
          </div>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: alert.color }} />
        </motion.div>
      ))}

      {/* No SOS banner */}
      <div className="rounded-2xl p-4 flex items-center gap-3 mt-2"
           style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <span className="text-2xl">🛡️</span>
        <div>
          <p className="text-xs font-bold text-emerald-400">No SOS alerts today</p>
          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>All family members are safe and accounted for</p>
        </div>
      </div>
    </div>
  )
}

/* ── Settings panel ──────────────────────────────────────────── */
function SettingsPanel() {
  const [notifications, setNotifications] = useState(true)
  const [geofence, setGeofence] = useState(true)
  const [battery, setBattery] = useState(true)

  const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
    <button
      onClick={() => set(!on)}
      className="relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: on ? '#10B981' : 'rgba(255,255,255,0.1)' }}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
      />
    </button>
  )

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-bold text-white">Settings</h2>

      {/* Profile */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
           style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
             style={{ border: '2px solid #3B82F6' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces&auto=format&q=80"
               alt="Mom" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Meera Singh</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Parent Account · 5 members</p>
        </div>
        <button className="ml-auto text-[10px] px-2 py-1 rounded-lg font-semibold"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)' }}>
          Edit
        </button>
      </div>

      {/* Notification toggles */}
      {[
        { label: 'Geofence Alerts', desc: 'Notify when child enters/leaves safe zone', on: geofence, set: setGeofence, icon: '🗺️' },
        { label: 'SOS Notifications', desc: 'Instant emergency SOS alerts', on: notifications, set: setNotifications, icon: '🆘' },
        { label: 'Low Battery Alerts', desc: 'Alert when battery drops below 20%', on: battery, set: setBattery, icon: '🔋' },
      ].map(item => (
        <div key={item.label} className="flex items-center gap-3 rounded-2xl p-3"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
               style={{ background: 'rgba(255,255,255,0.06)' }}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white">{item.label}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.desc}</p>
          </div>
          <Toggle on={item.on} set={item.set} />
        </div>
      ))}

      {/* Danger zone */}
      <div className="rounded-2xl p-3 mt-2"
           style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(239,68,68,0.6)' }}>Emergency</p>
        <button className="w-full py-2.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          🆘 Trigger Family SOS
        </button>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────── */
export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('map')
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleMemberClick = (id: string) => setActiveId(prev => prev === id ? null : id)
  const activeMember = MAP_MEMBERS.find(m => m.id === activeId) ?? null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Top header */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3"
           style={{ background: 'rgba(7,14,28,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                 style={{ background: 'linear-gradient(135deg, #D4A853, #B8922E)' }}>⚡</div>
            <span className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--gold)' }}>GRAVITY</span>
          </a>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>Parent Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
               style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">ALL SAFE</span>
          </div>
          {/* Notification bell */}
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-sm">🔔</span>
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-[7px] font-bold text-white">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col lg:flex-row">

        {/* LEFT: map (always visible on large screens, tab-visible on mobile) */}
        <div className={`relative lg:flex-1 ${activeTab === 'map' ? 'flex' : 'hidden lg:flex'}`}
             style={{ minHeight: activeTab === 'map' ? 'calc(100vh - 57px)' : undefined }}>

          {/* The real Leaflet map */}
          <div className="absolute inset-0">
            <MapView activeId={activeId} onMemberClick={handleMemberClick} />
          </div>

          {/* Map overlay: active member tooltip */}
          <AnimatePresence>
            {activeMember && (
              <motion.div
                key={activeMember.id}
                initial={{ opacity: 0, y: -12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.92 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[900] pointer-events-none"
              >
                <div className="flex items-center gap-3 rounded-2xl px-4 py-3 whitespace-nowrap"
                     style={{ background: 'rgba(7,20,40,0.97)', border: `1px solid ${activeMember.color}50`,
                              boxShadow: `0 16px 48px rgba(0,0,0,0.7)`, backdropFilter: 'blur(16px)' }}>
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                       style={{ border: `2px solid ${activeMember.color}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={activeMember.photo} alt={activeMember.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{activeMember.name}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      📍 {activeMember.location} · {V_EMOJI[activeMember.vehicle]} {activeMember.speed} km/h · 🔋 {activeMember.battery}%
                    </p>
                  </div>
                  <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration:1.2, repeat:Infinity }}
                    className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map: bottom member strip */}
          <div className="absolute bottom-0 left-0 right-0 z-[900] px-3 py-3"
               style={{ background: 'rgba(7,20,40,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {MAP_MEMBERS.map(m => (
                <motion.div
                  key={m.id}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 flex-shrink-0 rounded-xl px-3 py-2 cursor-pointer"
                  style={{
                    background: activeId === m.id ? `${m.color}18` : 'rgba(255,255,255,0.04)',
                    border: activeId === m.id ? `1px solid ${m.color}55` : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleMemberClick(m.id)}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden"
                         style={{ border: `2px solid ${m.color}80` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[7px]"
                         style={{ background: m.color, border: '1.5px solid #071428' }}>
                      {V_EMOJI[m.vehicle]}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-[11px] font-semibold">{m.name}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {m.location}{m.speed ? ` · ${m.speed}km/h` : ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: side panel */}
        <div className={`lg:w-96 flex flex-col ${activeTab !== 'map' ? 'flex' : 'hidden lg:flex'}`}
             style={{ background: '#071428', borderLeft: '1px solid rgba(255,255,255,0.06)', minHeight: 'calc(100vh - 57px)' }}>

          {/* Panel header tabs (desktop) */}
          <div className="hidden lg:flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-0.5"
                style={{
                  color: activeTab === tab.key ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--gold)' : '2px solid transparent',
                }}
              >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 115px)' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'children' && (
                <motion.div key="children" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ChildrenPanel activeId={activeId} setActiveId={setActiveId} />
                </motion.div>
              )}
              {activeTab === 'alerts' && (
                <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AlertsPanel />
                </motion.div>
              )}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SettingsPanel />
                </motion.div>
              )}
              {activeTab === 'map' && (
                <motion.div key="map-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-6 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <p className="text-4xl mb-3">🗺️</p>
                  <p className="text-sm font-semibold">Live map is shown on the left</p>
                  <p className="text-xs mt-1">Click on any family member to see details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Family summary footer */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="rounded-2xl p-3"
                 style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span>🛡️</span>
                <p className="text-xs font-bold text-emerald-400">All {MAP_MEMBERS.length} members safe</p>
                <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.4, repeat: Infinity }}
                  className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto">
                {MAP_MEMBERS.map(m => (
                  <div key={m.id} className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden cursor-pointer"
                       style={{ border: `1.5px solid ${m.color}`, opacity: activeId === m.id ? 1 : 0.7 }}
                       onClick={() => handleMemberClick(m.id)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex"
           style={{ background: 'rgba(7,14,28,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors"
            style={{ color: activeTab === tab.key ? 'var(--gold)' : 'rgba(255,255,255,0.3)' }}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[8px] font-bold tracking-wider uppercase">{tab.label}</span>
            {activeTab === tab.key && (
              <motion.div layoutId="tab-indicator" className="w-8 h-0.5 rounded-full mt-0.5"
                          style={{ background: 'var(--gold)' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
