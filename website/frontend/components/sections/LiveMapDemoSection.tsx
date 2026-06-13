'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MAP_MEMBERS } from '@/lib/mapData'

/* ── Dynamic import — Leaflet is browser-only ───────────────── */
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #071428 0%, #0B1E4A 50%, #081530 100%)' }}
    >
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: 'rgba(16,185,129,0.7)' }}
      >
        Loading map…
      </motion.div>
    </div>
  ),
})

/* ── Radar sweep overlay (sits above Leaflet, pointer-events:none) */
function RadarSweep() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 800 }}>
      {/* Concentric rings */}
      <svg className="absolute inset-0 w-full h-full">
        {[60, 110, 165].map((r, i) => (
          <circle
            key={r}
            cx="55%" cy="55%"
            r={r}
            fill="none"
            stroke="rgba(16,185,129,0.07)"
            strokeWidth="1"
            strokeDasharray={i === 0 ? undefined : '4 8'}
          />
        ))}
      </svg>
      {/* Rotating sweep */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        className="absolute"
        style={{ top: '55%', left: '55%', width: 170, height: 170, marginTop: -170, marginLeft: -170 }}
      >
        <svg width="340" height="340" viewBox="0 0 340 340">
          <path d="M 170,170 L 170,0 A 170,170 0 0,1 295,50 Z" fill="rgba(16,185,129,0.07)" />
          <line x1="170" y1="170" x2="170" y2="0" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" />
        </svg>
      </motion.div>
    </div>
  )
}

/* ── Scan line ─────────────────────────────────────────────────── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        zIndex: 801,
        background: 'linear-gradient(to right, transparent, rgba(16,185,129,0.35) 50%, transparent)',
      }}
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
  )
}

/* ── Battery bar ───────────────────────────────────────────────── */
function BatteryBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', width: 36 }}>
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

/* ── Tooltip card (floats above the map) ──────────────────────── */
function MemberTooltip({ member, onClose }: { member: typeof MAP_MEMBERS[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.92 }}
      transition={{ duration: 0.2 }}
      className="absolute z-[900] pointer-events-none"
      style={{ top: '12%', left: '50%', transform: 'translateX(-50%)' }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl whitespace-nowrap"
        style={{
          background: 'rgba(7,20,40,0.96)',
          border: `1px solid ${member.color}40`,
          boxShadow: `0 12px 36px rgba(0,0,0,0.6), 0 0 0 1px ${member.color}20`,
        }}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
             style={{ border: `2px solid ${member.color}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">{member.name}
            <span className="ml-1.5 font-normal" style={{ color: 'rgba(255,255,255,0.45)' }}>· {member.location}</span>
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            🔋 {member.battery}% · Last seen: just now
          </p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0">
          <motion.div animate={{ scale: [1,2], opacity: [0.8,0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full h-full rounded-full bg-emerald-400" />
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main section ──────────────────────────────────────────────── */
export default function LiveMapDemoSection() {
  const [activeId, setActiveId] = useState<string | null>(null)

  const handlePin = (id: string) => setActiveId(prev => prev === id ? null : id)
  const activeMember = MAP_MEMBERS.find(m => m.id === activeId) ?? null

  return (
    <section
      id="live-demo"
      className="relative py-24 px-4 sm:px-6 overflow-hidden"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] blur-3xl"
           style={{ background: 'radial-gradient(ellipse, rgba(212,168,83,0.16) 0%, rgba(184,114,10,0.05) 50%, transparent 75%)' }} />

      <div className="relative max-w-6xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full"
            style={{ color: 'var(--safe)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2 h-2 rounded-full inline-block bg-emerald-400" />
            Live Demo
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            See Your Family<br />
            On <span className="gradient-text-gold">One Map</span>
          </h2>
          <p className="text-lg mt-4 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Real-time location, battery status, arrival alerts — all in one beautiful dashboard.
          </p>
        </motion.div>

        {/* Map + panel row */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">

          {/* ── Real Leaflet map ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 relative rounded-3xl overflow-hidden"
            style={{ height: 440, boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}
          >
            {/* Leaflet map fills the box */}
            <MapView activeId={activeId} onMemberClick={handlePin} />

            {/* Radar + scan overlays */}
            <RadarSweep />
            <ScanLine />

            {/* Active member tooltip */}
            <AnimatePresence>
              {activeMember && (
                <MemberTooltip
                  key={activeMember.id}
                  member={activeMember}
                  onClose={() => setActiveId(null)}
                />
              )}
            </AnimatePresence>

            {/* Top-left title bar */}
            <div
              className="absolute top-4 left-4 z-[900] flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: 'rgba(7,20,40,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-white text-xs font-bold">GRAVITY Family Map</p>
              <div className="flex items-center gap-1 rounded-lg px-2 py-0.5"
                   style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-emerald-400 text-[9px] font-bold">LIVE</span>
              </div>
            </div>

            {/* Bottom member strip */}
            <div
              className="absolute bottom-0 left-0 right-0 z-[900] px-3 py-3"
              style={{ background: 'rgba(7,20,40,0.88)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {MAP_MEMBERS.map(m => (
                  <motion.div
                    key={m.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 flex-shrink-0 rounded-xl px-3 py-2 cursor-pointer"
                    style={{
                      background: activeId === m.id ? `${m.color}18` : 'rgba(255,255,255,0.04)',
                      border: activeId === m.id ? `1px solid ${m.color}50` : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: activeId === m.id ? `0 0 12px ${m.color}30` : 'none',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => handlePin(m.id)}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
                         style={{ border: `2px solid ${m.color}80`, boxShadow: `0 0 8px ${m.color}40` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-white text-[10px] font-semibold">{m.name}</span>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>📍 Live</span>
                      </div>
                      <BatteryBar pct={m.battery} color={m.color} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right stats panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden md:flex flex-col gap-3 glass-warm rounded-2xl p-5"
            style={{ width: 230, border: '1px solid var(--border)', flexShrink: 0 }}
          >
            <div className="flex items-center gap-2 p-3 rounded-xl"
                 style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z"
                      fill="rgba(16,185,129,0.3)" stroke="#10B981" strokeWidth="1.8"/>
                <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-xs font-semibold text-emerald-400">All 4 members safe</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Last SOS</p>
              <p className="text-xs font-bold text-emerald-400">None today ✓</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Journey</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Mom: 2.4 km from home</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Battery</p>
              <div className="space-y-2.5">
                {MAP_MEMBERS.map(m => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0"
                         style={{ border: `1.5px solid ${m.color}70` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.battery}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                        style={{ background: m.battery < 30 ? '#EF4444' : m.color }}
                      />
                    </div>
                    <span className="text-[9px] font-semibold tabular-nums"
                          style={{ color: 'var(--text-muted)', width: 26, textAlign: 'right' }}>
                      {m.battery}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 18px rgba(var(--gold-rgb),0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="mt-auto w-full py-2.5 rounded-xl text-xs font-bold"
              style={{ border: '1.5px solid var(--gold)', color: 'var(--gold)', background: 'rgba(var(--gold-rgb),0.06)' }}
            >
              Open Full Dashboard →
            </motion.button>
          </motion.div>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📍', title: 'Real-time precision', stat: 'GPS accuracy < 10m',   color: '#3B82F6' },
            { icon: '🆘', title: 'Instant SOS alerts',  stat: 'Avg response 0.3s',    color: '#EF4444' },
            { icon: '🔒', title: 'Privacy protected',   stat: 'End-to-end encrypted', color: '#10B981' },
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
