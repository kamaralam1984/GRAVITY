'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Data ─────────────────────────────────────────────────────── */
const CHILDREN = [
  {
    id: 'anya', name: 'Anya', age: 9, grade: 'Class 4',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    color: '#8B5CF6', status: 'safe', location: 'School', battery: 95,
    vehicle: '🛺 Auto', speed: 18, lastSeen: '2 min ago',
    geofence: 'School Zone ✓', safeZone: true,
  },
  {
    id: 'priya', name: 'Priya', age: 17, grade: 'Class 12',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
    color: '#F59E0B', status: 'moving', location: 'College', battery: 42,
    vehicle: '🚌 Bus', speed: 28, lastSeen: 'Live',
    geofence: 'College Zone ✓', safeZone: true,
  },
]

const PARENT = {
  name: 'Meera', role: 'Mom',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
  color: '#3B82F6',
}

/* ── Tabs ─────────────────────────────────────────────────────── */
type Tab = 'parent' | 'child'

/* ── Parent View Mock ─────────────────────────────────────────── */
function ParentView() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Good morning</p>
          <p className="text-sm font-bold text-white">{PARENT.name} 👋</p>
        </div>
        <div className="relative">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
               style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            🔔
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">2</span>
          </div>
        </div>
      </div>

      {/* All safe banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
        style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
      >
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg"
        >🛡️</motion.span>
        <div>
          <p className="text-xs font-bold text-emerald-400">All Family Members Safe</p>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>No SOS alerts today</p>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="ml-auto w-2 h-2 rounded-full bg-emerald-400"
        />
      </motion.div>

      {/* Children cards */}
      <p className="text-[9px] font-bold uppercase tracking-widest px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
        My Children
      </p>
      {CHILDREN.map((child, i) => (
        <motion.div
          key={child.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl p-3 cursor-pointer"
          style={{
            background: selected === child.id ? `${child.color}18` : 'rgba(255,255,255,0.04)',
            border: selected === child.id ? `1px solid ${child.color}50` : '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.2s',
          }}
          onClick={() => setSelected(s => s === child.id ? null : child.id)}
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden"
                   style={{ border: `2px solid ${child.color}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px]"
                   style={{ background: child.color, border: '1.5px solid #071428' }}>
                {child.status === 'safe' ? '✓' : '→'}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white">{child.name}</p>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: `${child.color}20`, color: child.color }}>
                  {child.grade}
                </span>
              </div>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                📍 {child.location} · {child.vehicle} · {child.speed}km/h
              </p>
            </div>

            {/* Battery */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${child.battery}%`, background: child.battery < 30 ? '#EF4444' : child.color }} />
                </div>
                <span className="text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>{child.battery}%</span>
              </div>
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{child.lastSeen}</span>
            </div>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {selected === child.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: `1px solid ${child.color}20` }}>
                  {[
                    { label: 'Geofence', val: child.geofence, icon: '🗺️' },
                    { label: 'Safe Zone', val: child.safeZone ? 'Yes ✓' : 'No ✗', icon: '🔒' },
                    { label: 'Speed', val: `${child.speed} km/h`, icon: '⚡' },
                  ].map(item => (
                    <div key={item.label} className="flex-1 rounded-xl p-2 text-center"
                         style={{ background: `${child.color}10`, border: `1px solid ${child.color}20` }}>
                      <span className="text-xs">{item.icon}</span>
                      <p className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
                      <p className="text-[9px] font-bold" style={{ color: child.color }}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* SOS button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="mt-auto rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-2"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#EF4444' }}
      >
        <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>🆘</motion.span>
        Emergency SOS
      </motion.button>
    </div>
  )
}

/* ── Child View Mock ──────────────────────────────────────────── */
function ChildView() {
  const child = CHILDREN[0]

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
             style={{ border: `2.5px solid ${child.color}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Hi, {child.name}! 👋</p>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{child.grade} · Age {child.age}</p>
        </div>
        <div className="ml-auto px-2 py-1 rounded-full text-[9px] font-bold"
             style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
          SAFE ✓
        </div>
      </div>

      {/* Check-in card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl p-3"
        style={{ background: `${child.color}12`, border: `1px solid ${child.color}30` }}
      >
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Current Location
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏫</span>
          <div>
            <p className="text-sm font-bold text-white">{child.location}</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Arrived 8:42 AM · {child.geofence}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Battery', val: `${child.battery}%`, icon: '🔋', color: child.color },
          { label: 'Transport', val: child.vehicle, icon: '📍', color: '#10B981' },
          { label: 'Speed', val: `${child.speed} km/h`, icon: '⚡', color: '#F59E0B' },
          { label: 'Parent Watching', val: 'Mom ❤️', icon: '👀', color: '#EC4899' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="text-base">{s.icon}</span>
            <p className="text-[7px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: s.color }}>{s.val}</p>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Today's Journey
        </p>
        {[
          { time: '7:30 AM', place: 'Left Home', icon: '🏠', done: true },
          { time: '8:05 AM', place: 'Boarded Auto', icon: '🛺', done: true },
          { time: '8:42 AM', place: 'Reached School', icon: '🏫', done: true },
          { time: '2:30 PM', place: 'School Ends', icon: '📚', done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2.5 mb-2">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                   style={{ background: step.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${step.done ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.12)'}` }}>
                {step.icon}
              </div>
              {i < 3 && <div className="w-px h-3" style={{ background: step.done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)' }} />}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold" style={{ color: step.done ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
                {step.place}
              </p>
            </div>
            <span className="text-[8px] tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>{step.time}</span>
          </div>
        ))}
      </div>

      {/* SOS button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="mt-auto rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', boxShadow: '0 8px 24px rgba(239,68,68,0.35)' }}
      >
        <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>🆘</motion.span>
        Send SOS to Parents
      </motion.button>
    </div>
  )
}

/* ── Phone Frame ──────────────────────────────────────────────── */
function PhoneFrame({ children, title, accent }: { children: React.ReactNode; title: string; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative mx-auto"
      style={{ width: 280 }}
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-[40px] blur-2xl opacity-30" style={{ background: accent, transform: 'scale(0.85) translateY(20px)' }} />

      {/* Phone shell */}
      <div className="relative rounded-[36px] overflow-hidden"
           style={{ background: '#0A0F1E', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-20 h-5 rounded-full flex items-center justify-center gap-2" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div className="w-8 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>

        {/* App header bar */}
        <div className="px-4 pt-1 pb-2 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px]"
                 style={{ background: `${accent}25`, border: `1px solid ${accent}40` }}>⚡</div>
            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: accent }}>KVL TRACK</span>
          </div>
          <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{title}</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.3)' }}>9:41</span>
          </div>
        </div>

        {/* Screen content */}
        <div className="px-3 py-3 h-[480px] overflow-hidden">
          {children}
        </div>

        {/* Bottom nav */}
        <div className="flex justify-around py-3 px-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {['🏠', '🗺️', '🔔', '👤'].map((icon, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-base">{icon}</span>
              {i === 0 && <div className="w-1 h-1 rounded-full" style={{ background: accent }} />}
            </div>
          ))}
        </div>

        {/* Home bar */}
        <div className="flex justify-center pb-2">
          <div className="w-24 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main Section ─────────────────────────────────────────────── */
export default function ParentChildSection() {
  const [activeTab, setActiveTab] = useState<Tab>('parent')

  return (
    <section
      id="parent-child"
      className="relative overflow-hidden py-20"
      style={{ background: 'var(--bg)' }}
    >
      {/* BG glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-40 top-20 w-96 h-96 rounded-full blur-3xl opacity-10"
             style={{ background: '#3B82F6' }} />
        <div className="absolute -right-40 bottom-20 w-96 h-96 rounded-full blur-3xl opacity-10"
             style={{ background: '#8B5CF6' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full"
            style={{ color: 'var(--gold)', background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)' }}
          >
            👨‍👩‍👧‍👦 Family Dashboard
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold leading-[1.1] mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            One App,<br />
            <span className="gradient-text-gold">Two Powerful Views</span>
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Parents get complete family oversight. Children get a safe, friendly interface.
            Everyone stays connected — always.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {([
              { key: 'parent', label: '👨‍👩‍👧 Parent View', color: '#3B82F6' },
              { key: 'child',  label: '👧 Child View',  color: '#8B5CF6' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: activeTab === tab.key ? tab.color : 'transparent',
                  boxShadow: activeTab === tab.key ? `0 4px 16px ${tab.color}40` : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — phone mockup */}
          <AnimatePresence mode="wait">
            {activeTab === 'parent' ? (
              <motion.div key="parent-phone"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <PhoneFrame title="Parent Panel" accent="#3B82F6">
                  <ParentView />
                </PhoneFrame>
              </motion.div>
            ) : (
              <motion.div key="child-phone"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <PhoneFrame title="Child Panel" accent="#8B5CF6">
                  <ChildView />
                </PhoneFrame>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right — feature list */}
          <AnimatePresence mode="wait">
            {activeTab === 'parent' ? (
              <motion.div key="parent-features"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-bold"
                       style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>
                    👨‍👩‍👧 Parent Dashboard
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Complete Family<br />Command Center
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Real-time visibility over every family member — location, battery, vehicle, speed — all from one screen.
                  </p>
                </div>
                {[
                  { icon: '🗺️', title: 'Live Family Map', desc: 'See all members on a real GPS map with vehicle icons and road-level detail' },
                  { icon: '🛡️', title: 'Geofence Alerts', desc: 'Get instant notification when child enters or leaves school, home or any safe zone' },
                  { icon: '🆘', title: 'One-tap SOS', desc: 'Emergency SOS with your exact GPS coordinates sent to parents in under 3 seconds' },
                  { icon: '🔋', title: 'Battery Monitoring', desc: 'Track every family member\'s device battery — never miss a low battery warning' },
                  { icon: '📜', title: 'Journey History', desc: 'Full timeline of where each child went, with timestamps and route replay' },
                ].map((feat, i) => (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                         style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      {feat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{feat.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="child-features"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-bold"
                       style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}>
                    👧 Child Panel
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Safe, Simple &<br />Child-Friendly
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Designed for children of all ages — big buttons, clear status, and instant SOS to mom and dad.
                  </p>
                </div>
                {[
                  { icon: '✅', title: 'Safe Status Display', desc: 'Big, clear "SAFE" indicator so children know they\'re being protected' },
                  { icon: '📍', title: 'Auto Check-in', desc: 'Automatically notifies parents when child reaches school or home' },
                  { icon: '🗺️', title: 'Journey Timeline', desc: 'Shows today\'s travel history — left home, boarded bus, reached school' },
                  { icon: '🆘', title: 'Big SOS Button', desc: 'One tap sends location + alert to all parents with panic mode activation' },
                  { icon: '❤️', title: 'Parent Connected', desc: 'Shows which parent is watching — gives children a sense of safety and comfort' },
                ].map((feat, i) => (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                         style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                      {feat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{feat.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="/parent"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(59,130,246,0.35)',
            }}
          >
            👨‍👩‍👧 Open Parent Dashboard →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
