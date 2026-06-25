'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─────────────────────────────────────────────────────
   Shared real-human photo URLs
───────────────────────────────────────────────────── */
const MP = {
  mom:   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
  dad:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
  priya: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
  anya:  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces&auto=format&q=80',
  user1: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces&auto=format&q=80',
  user2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces&auto=format&q=80',
  user3: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=64&h=64&fit=crop&crop=faces&auto=format&q=80',
}

/* ─────────────────────────────────────────────────────
   Step data
───────────────────────────────────────────────────── */
const steps = [
  {
    id: 1,
    num: '01',
    title: 'Download & Sign Up',
    description: 'Get KVL Track free from App Store or Play Store. No credit card needed.',
    screen: 'download',
  },
  {
    id: 2,
    num: '02',
    title: 'Create Your Circle',
    description: 'Invite family members via WhatsApp, SMS, or a simple link.',
    screen: 'create',
  },
  {
    id: 3,
    num: '03',
    title: 'Set Safe Zones',
    description: 'Draw geofences around home, school, or the office in seconds.',
    screen: 'geofence',
  },
  {
    id: 4,
    num: '04',
    title: 'Stay Connected',
    description: 'See your family in real-time on one map and get instant alerts.',
    screen: 'live',
  },
]

/* ─────────────────────────────────────────────────────
   Phone screens
───────────────────────────────────────────────────── */
function DownloadScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-5">
      {/* App icon */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(212,168,83,0.35)]"
        style={{ background: 'linear-gradient(135deg, #D4A853 0%, #B8720A 100%)' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="2.5" fill="none" />
          <circle cx="20" cy="20" r="5" fill="white" />
          <line x1="20" y1="6" x2="20" y2="2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="38" x2="20" y2="34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="20" x2="2" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="38" y1="20" x2="34" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-white font-extrabold text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          KVL TRACK
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Family Safety & Location</p>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          {[1,2,3,4,5].map(i => (
            <span key={i} className="text-amber-400 text-xs">★</span>
          ))}
          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>4.9</span>
        </div>
      </div>

      {/* Download free CTA */}
      <div
        className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
        style={{ background: 'linear-gradient(135deg, #D4A853, #B8720A)', color: 'white' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 16l-6-6h4V4h4v6h4l-6 6z"/>
          <rect x="4" y="18" width="16" height="2" rx="1" fill="white"/>
        </svg>
        Download Free
      </div>

      {/* Store badges */}
      <div className="flex gap-2 w-full">
        <div className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5 border" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.42.07 2.41.77 3.24.82 1.24-.21 2.43-.96 3.76-.84 1.6.16 2.8.82 3.57 2.07-3.27 1.96-2.49 6.33.63 7.53-.74 1.88-1.68 3.73-3.2 5.3ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z"/>
          </svg>
          <span className="text-white text-[10px] font-semibold">App Store</span>
        </div>
        <div className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5 border" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M3.18 23.76c.28.15.6.2.92.14l12.1-7.22-2.76-2.77-10.26 9.85zM20.8 10.29L17.56 8.4l-3.08 3.08 3.08 3.08 3.27-1.9c.93-.55.93-2.02-.03-2.37zM2.09.52C1.78.9 1.6 1.45 1.6 2.1v19.8c0 .65.18 1.2.5 1.58l.08.08 11.1-11.1v-.26L2.17.44l-.08.08zM12.62 8.22l2.94-2.94L3.47.5C3.14.33 2.78.29 2.48.44l10.14 7.78z"/>
          </svg>
          <span className="text-white text-[10px] font-semibold">Google Play</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {[MP.user1, MP.user2, MP.user3].map((src, i) => (
            <div key={i} className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#0B1525]"
                 style={{ zIndex: 3 - i }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>50,000+ families joined</p>
      </div>
    </div>
  )
}

function CreateScreen() {
  return (
    <div className="flex flex-col h-full px-5 py-5">
      <p className="text-white font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)' }}>Family Circle</p>

      {/* Avatars in a circle */}
      <div className="flex items-center justify-center flex-1 relative">
        <div className="relative w-36 h-36">
          {/* Center: You */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-base shadow-[0_0_20px_rgba(212,168,83,0.4)] border-2" style={{ background: 'linear-gradient(135deg,#D4A853,#B8720A)', borderColor: '#D4A853' }}>
              You
            </div>
          </div>
          {/* Orbit members */}
          {[
            { label: 'Mom',   color: '#4B80F0', angle: 0,   photo: MP.mom   },
            { label: 'Dad',   color: '#10B981', angle: 120, photo: MP.dad   },
            { label: 'Priya', color: '#8B5CF6', angle: 240, photo: MP.priya },
          ].map(({ label, color, angle, photo }) => {
            const r = 60
            const rad = (angle - 90) * (Math.PI / 180)
            const x = 50 + r * Math.cos(rad)
            const y = 50 + r * Math.sin(rad)
            return (
              <div key={label} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}>
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: color, opacity: 0.4 }}
                />
                <div
                  className="relative w-10 h-10 rounded-full overflow-hidden border-2 shadow-lg"
                  style={{ borderColor: color, boxShadow: `0 0 12px ${color}55` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={label} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold whitespace-nowrap"
                   style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
              </div>
            )
          })}
          {/* Connecting lines drawn with svg */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
            {[0, 120, 240].map((angle) => {
              const r = 60
              const rad = (angle - 90) * (Math.PI / 180)
              const x2 = 50 + r * Math.cos(rad)
              const y2 = 50 + r * Math.sin(rad)
              return (
                <line
                  key={angle}
                  x1="50%" y1="50%"
                  x2={`${x2}%`} y2={`${y2}%`}
                  stroke="rgba(212,168,83,0.2)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* Invite button */}
      <div className="mt-3 w-full rounded-xl py-2.5 flex items-center justify-center gap-2 border" style={{ borderColor: 'rgba(212,168,83,0.3)', background: 'rgba(212,168,83,0.07)' }}>
        <span className="text-lg">+</span>
        <span className="text-sm font-semibold" style={{ color: '#D4A853' }}>Invite a member</span>
      </div>

      {/* Share row */}
      <div className="mt-2 flex gap-2">
        {[{ label: 'WhatsApp', bg: '#25D366' }, { label: 'SMS', bg: '#4B80F0' }, { label: 'Link', bg: 'rgba(255,255,255,0.1)' }].map(s => (
          <div key={s.label} className="flex-1 rounded-xl py-2 text-center">
            <p className="text-white text-[10px] font-semibold" style={{ background: s.bg, borderRadius: 8, padding: '4px 0' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function GeofenceScreen() {
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <p className="text-white font-bold text-sm mb-2" style={{ fontFamily: 'var(--font-display)' }}>Safe Zones</p>

      {/* Map area */}
      <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(160deg,#071428,#0B1E4A)' }}>
        <svg width="100%" height="100%">
          {/* Light grid */}
          {Array.from({ length: 8 }).map((_,i) => (
            <line key={`v${i}`} x1={`${i*14}%`} y1="0" x2={`${i*14}%`} y2="100%" stroke="rgba(96,165,250,0.06)" strokeWidth="1"/>
          ))}
          {Array.from({ length: 6 }).map((_,i) => (
            <line key={`h${i}`} x1="0" y1={`${i*17}%`} x2="100%" y2={`${i*17}%`} stroke="rgba(96,165,250,0.06)" strokeWidth="1"/>
          ))}
          {/* Road lines */}
          <line x1="0" y1="55%" x2="25%" y2="53%" stroke="rgba(148,163,184,0.18)" strokeWidth="2.5"/>
          <line x1="25%" y1="53%" x2="50%" y2="52%" stroke="rgba(148,163,184,0.18)" strokeWidth="2.5"/>
          <line x1="50%" y1="52%" x2="75%" y2="53.5%" stroke="rgba(148,163,184,0.18)" strokeWidth="2.5"/>
          <line x1="75%" y1="53.5%" x2="100%" y2="57%" stroke="rgba(148,163,184,0.18)" strokeWidth="2.5"/>
          <line x1="50%" y1="0" x2="52%" y2="100%" stroke="rgba(148,163,184,0.14)" strokeWidth="2" />

          {/* Home Zone circle */}
          <circle cx="45%" cy="50%" r="52" fill="rgba(16,185,129,0.07)" stroke="rgba(16,185,129,0.4)" strokeWidth="2" strokeDasharray="6 4"/>
          <text x="45%" y="27%" textAnchor="middle" fontSize="9" fill="rgba(16,185,129,0.9)" fontWeight="700">Home Zone</text>

          {/* School circle */}
          <circle cx="72%" cy="30%" r="36" fill="rgba(245,158,11,0.07)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeDasharray="5 3"/>
          <text x="72%" y="13%" textAnchor="middle" fontSize="8" fill="rgba(245,158,11,0.9)" fontWeight="700">School</text>

          {/* Center pin pulsing */}
          <circle cx="45%" cy="50%" r="16" fill="rgba(16,185,129,0.15)">
            <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="45%" cy="50%" r="7" fill="#10B981"/>
          <text x="45%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="6" fontWeight="700" fill="white">H</text>
        </svg>

        {/* Zone label overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
          <div className="flex-1 flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"/>
            <span className="text-[9px] font-semibold text-emerald-400">Home · Active</span>
          </div>
          <div className="flex-1 flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"/>
            <span className="text-[9px] font-semibold text-amber-400">School · Active</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Tap map to draw a new zone</div>
    </div>
  )
}

function LiveScreen() {
  return (
    <div className="flex flex-col h-full px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>The Sharma Family</p>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}/>LIVE
        </span>
      </div>

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(160deg,#071428,#0B1E4A)' }}>
        <svg width="100%" height="100%">
          {/* Grid */}
          {Array.from({ length: 7 }).map((_,i) => (
            <line key={`v${i}`} x1={`${i*16}%`} y1="0" x2={`${i*16}%`} y2="100%" stroke="rgba(96,165,250,0.05)" strokeWidth="1"/>
          ))}
          {Array.from({ length: 5 }).map((_,i) => (
            <line key={`h${i}`} x1="0" y1={`${i*20}%`} x2="100%" y2={`${i*20}%`} stroke="rgba(96,165,250,0.05)" strokeWidth="1"/>
          ))}
          <line x1="0" y1="50%" x2="25%" y2="48.5%" stroke="rgba(148,163,184,0.15)" strokeWidth="2"/>
          <line x1="25%" y1="48.5%" x2="50%" y2="48%" stroke="rgba(148,163,184,0.15)" strokeWidth="2"/>
          <line x1="50%" y1="48%" x2="75%" y2="49%" stroke="rgba(148,163,184,0.15)" strokeWidth="2"/>
          <line x1="75%" y1="49%" x2="100%" y2="52%" stroke="rgba(148,163,184,0.15)" strokeWidth="2"/>
          <line x1="48%" y1="0" x2="50%" y2="100%" stroke="rgba(148,163,184,0.12)" strokeWidth="1.5" />

          {/* Home zone */}
          <circle cx="55%" cy="55%" r="40" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.25)" strokeWidth="1.5" strokeDasharray="5 3"/>

          {/* no letter pins in SVG – rendered as abs divs below */}
        </svg>

        {/* Photo pins over the SVG map */}
        {[
          { cx: 30, cy: 40, color: '#4B80F0', photo: MP.mom,   name: 'Mom'   },
          { cx: 55, cy: 55, color: '#10B981', photo: MP.dad,   name: 'Dad'   },
          { cx: 70, cy: 28, color: '#F59E0B', photo: MP.priya, name: 'Priya' },
          { cx: 20, cy: 68, color: '#8B5CF6', photo: MP.anya,  name: 'Anya'  },
        ].map(p => (
          <div
            key={p.name}
            className="absolute z-10"
            style={{ left: `${p.cx}%`, top: `${p.cy}%`, transform: 'translate(-50%,-50%)' }}
          >
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full"
              style={{ background: p.color }}
            />
            <div
              className="relative w-8 h-8 rounded-full overflow-hidden"
              style={{
                border: `2px solid ${p.color}`,
                boxShadow: `0 0 10px ${p.color}66`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            {/* Live dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#071428]"
                 style={{ background: '#10B981' }} />
          </div>
        ))}

        {/* All safe banner */}
        <div className="absolute top-2 left-2 right-2 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5" style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.35)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="rgba(16,185,129,0.4)" stroke="#10B981" strokeWidth="2"/>
            <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-[9px] font-bold text-emerald-400 flex-1">All 4 members safe</span>
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)' }}>just now</span>
        </div>
      </div>

      {/* Member list */}
      <div className="mt-2 space-y-1">
        {[
          { name: 'Mom',   loc: 'Home',    color: '#4B80F0', photo: MP.mom   },
          { name: 'Dad',   loc: 'Office',  color: '#10B981', photo: MP.dad   },
          { name: 'Priya', loc: 'College', color: '#F59E0B', photo: MP.priya },
          { name: 'Anya',  loc: 'School',  color: '#8B5CF6', photo: MP.anya  },
        ].map(m => (
          <div key={m.name} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: `1.5px solid ${m.color}80` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.photo} alt={m.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs flex-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{m.name}</span>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>📍 {m.loc}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>
    </div>
  )
}

const screenMap: Record<string, React.FC> = {
  download: DownloadScreen,
  create: CreateScreen,
  geofence: GeofenceScreen,
  live: LiveScreen,
}

/* ─────────────────────────────────────────────────────
   Floating notification badges
───────────────────────────────────────────────────── */
const FLOATING_NOTIFS = [
  { id: 'n1', text: 'Sarah reached home ✓', icon: '🏠', delay: 0.2, position: { top: '8%', right: '-5%' } },
  { id: 'n2', text: 'Geofence alert: School exit', icon: '🔔', delay: 1.8, position: { bottom: '22%', left: '-8%' } },
  { id: 'n3', text: 'Family battery: All charged', icon: '🔋', delay: 3.5, position: { top: '50%', right: '-6%' } },
]

/* ─────────────────────────────────────────────────────
   Main section
───────────────────────────────────────────────────── */
export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 3500)
    return () => clearInterval(t)
  }, [paused])

  const ActiveScreen = screenMap[steps[activeStep].screen]

  return (
    <section
      id="how-it-works"
      className="relative py-24 px-4 sm:px-6 overflow-hidden"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Warm ambient blobs */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full blur-3xl"
           style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.16) 0%, rgba(184,114,10,0.06) 55%, transparent 75%)' }} />
      <div className="pointer-events-none absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl"
           style={{ background: 'radial-gradient(circle, rgba(184,114,10,0.10) 0%, transparent 70%)' }} />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-5 px-4 py-1.5 rounded-full"
            style={{
              color: 'var(--gold)',
              background: 'rgba(var(--gold-rgb),0.1)',
              border: '1px solid rgba(var(--gold-rgb),0.25)',
            }}
          >
            Simple Setup
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold leading-[1.1] mt-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Up and Running<br />
            <span className="gradient-text-gold">in 3 Minutes</span>
          </h2>
          <p className="text-lg mt-4 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            No technical setup. Works on any phone.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center">

          {/* Left: Steps */}
          <div className="flex-1 space-y-1 w-full">
            {steps.map((step, i) => {
              const isActive = activeStep === i
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <button
                    onClick={() => { setActiveStep(i); setPaused(true) }}
                    className="w-full text-left"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                  >
                    <div
                      className="flex gap-4 p-5 rounded-2xl transition-all duration-400"
                      style={isActive ? {
                        background: 'var(--bg-surface)',
                        border: '1px solid rgba(var(--gold-rgb),0.3)',
                        boxShadow: '0 0 28px rgba(var(--gold-rgb),0.08)',
                        borderLeft: '3px solid var(--gold)',
                      } : {
                        border: '1px solid transparent',
                      }}
                    >
                      {/* Number + connector */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <motion.div
                          animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                          transition={{ duration: 0.4 }}
                          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                          style={isActive ? {
                            background: 'linear-gradient(135deg, var(--gold), #B8720A)',
                            color: 'white',
                            boxShadow: '0 0 20px rgba(var(--gold-rgb),0.4)',
                          } : {
                            background: 'var(--bg-surface2)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {step.num}
                        </motion.div>
                        {i < steps.length - 1 && (
                          <div
                            className="w-px flex-1 mt-2 min-h-[20px] transition-colors duration-300"
                            style={{
                              background: isActive
                                ? 'linear-gradient(to bottom, var(--gold), transparent)'
                                : 'var(--border)',
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1">
                        <p
                          className="text-base font-semibold transition-colors duration-300"
                          style={{
                            fontFamily: 'var(--font-display)',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                          }}
                        >
                          {step.title}
                        </p>
                        <AnimatePresence>
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0, y: -4 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -4 }}
                              transition={{ duration: 0.25 }}
                              className="text-sm mt-1 overflow-hidden leading-relaxed"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {step.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Right: Phone preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center flex-shrink-0 relative"
          >
            {/* Warm glow behind phone */}
            <div
              className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(var(--gold-rgb),0.12) 0%, transparent 70%)',
                transform: 'scale(1.4)',
              }}
            />

            {/* Floating notification badges */}
            {FLOATING_NOTIFS.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: n.delay, duration: 0.45 }}
                className="absolute z-30 animate-float-sm"
                style={n.position}
              >
                <div
                  className="glass-warm flex items-center gap-2 rounded-xl px-3 py-2 shadow-lg whitespace-nowrap"
                  style={{
                    border: '1px solid rgba(var(--gold-rgb),0.2)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="text-sm">{n.icon}</span>
                  {n.text}
                </div>
              </motion.div>
            ))}

            {/* Phone frame */}
            <div
              className="relative overflow-hidden"
              style={{
                width: 260,
                height: 530,
                borderRadius: '3.5rem',
                border: '4px solid var(--border-strong)',
                background: '#0B1525',
                boxShadow: 'var(--shadow-lg), var(--glow-gold)',
              }}
            >
              {/* Dynamic island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
              </div>

              {/* Screen glare */}
              <div className="absolute inset-0 pointer-events-none z-10"
                   style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 35%)' }} />

              {/* Status bar */}
              <div className="absolute top-3 left-5 right-5 flex items-center justify-between z-20" style={{ paddingTop: 2 }}>
                <span className="text-white text-[10px] font-semibold">9:41</span>
                <div className="w-3.5 h-2.5 rounded-sm border border-white/30 relative">
                  <div className="absolute inset-[1.5px] rounded-[1px]" style={{ background: 'rgba(255,255,255,0.6)', width: '70%' }} />
                </div>
              </div>

              {/* Screen content */}
              <div className="absolute inset-0 pt-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.28 }}
                    className="h-full"
                  >
                    <ActiveScreen />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeStep ? 20 : 6,
                      background: i === activeStep ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>

              {/* Home bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
