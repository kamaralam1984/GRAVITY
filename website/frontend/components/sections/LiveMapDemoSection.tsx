'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MAP_MEMBERS } from '@/lib/mapData'

/* ── Dynamic import — Leaflet is browser-only ───────────────────── */
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: 'linear-gradient(135deg, #071428 0%, #0B1E4A 50%, #081530 100%)' }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.15)',
                 border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontSize: 18 }}>📍</span>
      </motion.div>
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(16,185,129,0.7)' }}>
        Loading live map…
      </p>
    </div>
  ),
})

/* ── Radar sweep overlay ─────────────────────────────────────────── */
function RadarSweep() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 800 }}>
      <svg className="absolute inset-0 w-full h-full">
        {[80, 150, 220].map((r, i) => (
          <circle key={r} cx="50%" cy="50%" r={r} fill="none"
            stroke="rgba(16,185,129,0.05)" strokeWidth="1"
            strokeDasharray={i === 0 ? undefined : '4 10'} />
        ))}
      </svg>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute"
        style={{ top: '50%', left: '50%', width: 240, height: 240, marginTop: -240, marginLeft: -240 }}
      >
        <svg width="480" height="480" viewBox="0 0 480 480">
          <path d="M 240,240 L 240,20 A 220,220 0 0,1 395,80 Z" fill="rgba(16,185,129,0.04)" />
          <line x1="240" y1="240" x2="240" y2="20" stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" />
        </svg>
      </motion.div>
    </div>
  )
}

/* ── Scan line ───────────────────────────────────────────────────── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        zIndex: 801,
        background: 'linear-gradient(to right, transparent, rgba(16,185,129,0.3) 50%, transparent)',
      }}
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
    />
  )
}

/* ── Battery bar ─────────────────────────────────────────────────── */
function BatteryBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden flex-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ background: pct < 30 ? '#EF4444' : color }}
      />
    </div>
  )
}

/* ── Vehicle label ───────────────────────────────────────────────── */
const VEHICLE_LABELS: Record<string, string> = {
  car: '🚗', bus: '🚌', walk: '🚶', bike: '🚲', auto: '🛺', tempo: '🚛',
}

/* ── Active member tooltip ───────────────────────────────────────── */
function MemberTooltip({ member, onClose }: { member: typeof MAP_MEMBERS[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.92 }}
      transition={{ duration: 0.2 }}
      className="absolute z-[900] pointer-events-none"
      style={{ top: '14%', left: '50%', transform: 'translateX(-50%)' }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl whitespace-nowrap"
        style={{
          background: 'rgba(7,20,40,0.97)',
          border: `1px solid ${member.color}50`,
          boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px ${member.color}20`,
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
             style={{ border: `2.5px solid ${member.color}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-white">{member.name}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: `${member.color}20`, color: member.color }}>
              {VEHICLE_LABELS[member.vehicle]} {member.vehicle}
            </span>
          </div>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            📍 {member.location} · {member.speed}km/h · 🔋 {member.battery}%
          </p>
        </div>
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
      </div>
    </motion.div>
  )
}

/* ── Main section ────────────────────────────────────────────────── */
export default function LiveMapDemoSection() {
  const [activeId, setActiveId] = useState<string | null>(null)

  const handlePin = (id: string) => setActiveId(prev => prev === id ? null : id)
  const activeMember = MAP_MEMBERS.find(m => m.id === activeId) ?? null

  return (
    <section
      id="live-demo"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* ── Section header ─────────────────────────────────────────── */}
      <div className="relative z-10 pt-20 pb-8 px-4 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full"
            style={{ color: 'var(--safe)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2 h-2 rounded-full inline-block bg-emerald-400"
            />
            Live Demo
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            See Your Family<br />
            On <span className="gradient-text-gold">One Map</span>
          </h2>
          <p className="text-base mt-4" style={{ color: 'var(--text-muted)' }}>
            Real-time location, vehicle mode, battery status — all on a live map.
          </p>
        </motion.div>
      </div>

      {/* ── Full-width Map Container ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative mx-4 sm:mx-6 lg:mx-8 rounded-3xl overflow-hidden"
        style={{ height: 580, boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
      >
        {/* Real Leaflet map — fills 100% */}
        <MapView activeId={activeId} onMemberClick={handlePin} members={MAP_MEMBERS} />

        {/* Radar + scan overlays */}
        <RadarSweep />
        <ScanLine />

        {/* Active member tooltip */}
        <AnimatePresence>
          {activeMember && (
            <MemberTooltip key={activeMember.id} member={activeMember} onClose={() => setActiveId(null)} />
          )}
        </AnimatePresence>

        {/* ── Top-left title bar ──────────────────────────────────── */}
        <div
          className="absolute top-4 left-4 z-[900] flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: 'rgba(7,20,40,0.90)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <p className="text-white text-xs font-bold">KVL TRACK Family Map</p>
          <div className="flex items-center gap-1 rounded-lg px-2 py-0.5"
               style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)' }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span className="text-emerald-400 text-[9px] font-bold">LIVE</span>
          </div>
        </div>

        {/* ── Floating stats panel — top-right overlay ────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute top-4 right-4 z-[900] flex flex-col gap-3 p-4 rounded-2xl"
          style={{
            background: 'rgba(7,20,40,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.09)',
            width: 210,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* All safe status */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl"
               style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <span className="text-emerald-400 text-sm">🛡️</span>
            <p className="text-xs font-semibold text-emerald-400">All {MAP_MEMBERS.length} members safe</p>
          </div>

          {/* SOS */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Last SOS
            </p>
            <p className="text-xs font-bold text-emerald-400">None today ✓</p>
          </div>

          {/* Journey */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Journey
            </p>
            <p className="text-xs text-white/70">Dad: 2.4 km from home</p>
          </div>

          {/* Battery per member */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Battery
            </p>
            <div className="space-y-2">
              {MAP_MEMBERS.map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0"
                       style={{ border: `1.5px solid ${m.color}70` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                  <BatteryBar pct={m.battery} color={m.color} />
                  <span className="text-[9px] font-semibold tabular-nums"
                        style={{ color: 'rgba(255,255,255,0.45)', width: 26, textAlign: 'right' }}>
                    {m.battery}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full py-2 rounded-xl text-[10px] font-bold transition-all"
            style={{ border: '1px solid rgba(212,168,83,0.5)', color: '#D4A853', background: 'rgba(212,168,83,0.06)' }}
          >
            Open Full Dashboard →
          </button>
        </motion.div>

        {/* ── Bottom member strip ──────────────────────────────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-[900] px-3 py-3"
          style={{ background: 'rgba(7,20,40,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {MAP_MEMBERS.map(m => (
              <motion.div
                key={m.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 flex-shrink-0 rounded-xl px-3 py-2 cursor-pointer select-none"
                style={{
                  background: activeId === m.id ? `${m.color}18` : 'rgba(255,255,255,0.04)',
                  border: activeId === m.id ? `1px solid ${m.color}55` : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: activeId === m.id ? `0 0 14px ${m.color}30` : 'none',
                  transition: 'all 0.2s',
                }}
                onClick={() => handlePin(m.id)}
              >
                {/* Face photo */}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden"
                       style={{ border: `2px solid ${m.color}80`, boxShadow: `0 0 8px ${m.color}40` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Vehicle badge on photo */}
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
                    style={{ background: m.color, border: '1.5px solid #071428', lineHeight: 1 }}
                  >
                    {VEHICLE_LABELS[m.vehicle]}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-[11px] font-semibold">{m.name}</span>
                    <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ background: m.color }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: m.color }} />
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {m.location}
                    </span>
                    {m.speed && (
                      <span className="text-[9px] font-medium" style={{ color: m.color }}>
                        · {m.speed}km/h
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Feature highlights ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📍', title: 'Real-time precision',  stat: 'GPS accuracy < 10m',    color: '#3B82F6' },
            { icon: '🚗', title: 'Vehicle detection',    stat: 'Car · Bus · Auto · Walk', color: '#D4A853' },
            { icon: '🔒', title: 'Privacy protected',    stat: 'End-to-end encrypted',   color: '#10B981' },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: `0 12px 32px ${feat.color}18` }}
              className="glass flex items-center gap-4 p-4 rounded-2xl cursor-default"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: `${feat.color}14` }}>
                {feat.icon}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{feat.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{feat.stat}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
