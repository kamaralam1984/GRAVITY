'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

/* ── Deterministic star field — reduced to 50 for performance ───────── */
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: ((i * 1373 + 491) % 10000) / 100,
  top:  ((i * 1847 + 337) % 10000) / 100,
  size: 0.8 + (i % 4) * 0.35,
  op:   0.12 + (i % 7) * 0.07,
  dur:  2.5 + (i % 5) * 0.9,
  del:  (i * 0.35) % 4,
}))

/* ── Gold particles — reduced to 12 for performance ─────────────────── */
const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const ang = (i / 20) * Math.PI * 2
  const r   = 140 + (i % 4) * 35
  return {
    id:  i,
    x:   Math.cos(ang) * r,
    y:   Math.sin(ang) * r * 0.55,
    sz:  1.4 + (i % 3) * 0.7,
    op:  0.35 + (i % 5) * 0.1,
    dur: 2.2 + (i % 6) * 0.7,
    del: (i * 0.28) % 3.5,
  }
})

/* ── Orbital ring config ─────────────────────────────────────────────── */
const RINGS = [
  { id: 0, sz: 170,  ar: 0.3,  rotX: 72,  rotY: 0,   spd: 3.8,  rev: false, col: 'rgba(212,168,83,0.55)',  dot: '#D4A853', dotSz: 5,  w: 1.5, dash: false },
  { id: 1, sz: 230,  ar: 0.32, rotX: 62,  rotY: 18,  spd: 6.5,  rev: false, col: 'rgba(75,128,240,0.38)',  dot: '#4B80F0', dotSz: 4,  w: 1,   dash: true  },
  { id: 2, sz: 295,  ar: 0.28, rotX: 78,  rotY: -12, spd: 10,   rev: true,  col: 'rgba(155,107,245,0.3)', dot: '#9B6BF5', dotSz: 3.5,w: 1,   dash: true  },
]

/* ── Loading messages ────────────────────────────────────────────────── */
const MSGS = [
  'Connecting to safety network…',
  'Loading family features…',
  'Preparing your dashboard…',
  'Almost ready…',
]

interface Props { isVisible: boolean }

export default function KVLTrackLoader({ isVisible }: Props) {
  const [progress, setProgress] = useState(0)
  const [msg, setMsg]           = useState(0)

  useEffect(() => {
    if (!isVisible) { setProgress(0); setMsg(0); return }

    const pts: [number, number][] = [[250,22],[650,48],[1150,70],[1750,88],[2300,96]]
    const timers = pts.map(([ms, val]) => setTimeout(() => setProgress(val), ms))
    const msgInterval = setInterval(() => setMsg(m => (m + 1) % MSGS.length), 950)

    return () => { timers.forEach(clearTimeout); clearInterval(msgInterval) }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="gravity-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.38, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
          style={{ background: '#0B0D13' }}
        >

          {/* ── Star field ────────────────────────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none">
            {STARS.map(s => (
              <div
                key={s.id}
                className="absolute rounded-full"
                style={{
                  left:      `${s.left}%`,
                  top:       `${s.top}%`,
                  width:     s.size,
                  height:    s.size,
                  background: '#fff',
                  opacity:   s.op,
                  animation: `breathe ${s.dur}s ease-in-out infinite ${s.del}s`,
                }}
              />
            ))}
          </div>

          {/* ── Background blobs ──────────────────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute" style={{
              top: '20%', left: '28%', width: 420, height: 420,
              background: 'radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 70%)',
              filter: 'blur(70px)',
              animation: 'blob-morph 9s ease-in-out infinite',
            }} />
            <div className="absolute" style={{
              bottom: '22%', right: '22%', width: 360, height: 360,
              background: 'radial-gradient(circle, rgba(75,128,240,0.22) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'blob-morph 11s ease-in-out infinite 2.5s',
            }} />
            <div className="absolute" style={{
              top: '45%', right: '30%', width: 300, height: 300,
              background: 'radial-gradient(circle, rgba(155,107,245,0.16) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'blob-morph 13s ease-in-out infinite 5s',
            }} />
          </div>

          {/* ── Scan line ─────────────────────────────────────────────── */}
          <div
            className="absolute inset-x-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,83,0.35) 40%, rgba(212,168,83,0.5) 50%, rgba(212,168,83,0.35) 60%, transparent 100%)',
              animation: 'scan-line 5s linear infinite',
            }}
          />

          {/* ── Center radial glow ────────────────────────────────────── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div style={{
              width: 280, height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)',
              animation: 'breathe 3.5s ease-in-out infinite',
            }} />
          </div>

          {/* ── Gold floating particles ───────────────────────────────── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {PARTICLES.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width:  p.sz * 2,
                  height: p.sz * 2,
                  left:   `calc(50% + ${p.x}px - ${p.sz}px)`,
                  top:    `calc(50% + ${p.y}px - ${p.sz}px)`,
                  background: `rgba(212,168,83,${p.op})`,
                  boxShadow:  `0 0 ${p.sz * 4}px rgba(212,168,83,0.45)`,
                  animation:  `particle-drift ${p.dur}s ease-in-out infinite ${p.del}s`,
                }}
              />
            ))}
          </div>

          {/* ── Orbital rings ─────────────────────────────────────────── */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ perspective: '700px' }}
          >
            {RINGS.map(ring => (
              <motion.div
                key={ring.id}
                className="absolute"
                style={{
                  width:        ring.sz,
                  height:       ring.sz * ring.ar,
                  borderRadius: '50%',
                  border:       `${ring.w}px ${ring.dash ? 'dashed' : 'solid'} ${ring.col}`,
                  rotateX:      ring.rotX,
                  rotateY:      ring.rotY,
                }}
                animate={{ rotate: ring.rev ? -360 : 360 }}
                transition={{ duration: ring.spd, repeat: Infinity, ease: 'linear' }}
              >
                {/* Orbiting dot at top of ring */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width:     ring.dotSz * 2,
                    height:    ring.dotSz * 2,
                    background: ring.dot,
                    top:       -ring.dotSz,
                    left:      '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: `0 0 ${ring.dotSz * 4}px ${ring.dot}, 0 0 ${ring.dotSz * 8}px ${ring.dot}55`,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* ── Main logo ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative z-10 flex items-center justify-center"
          >
            {/* Expanding pulse rings */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ inset: 0, border: '1.5px solid rgba(212,168,83,0.5)' }}
                animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: i * 0.9 }}
              />
            ))}

            {/* Logo circle */}
            <motion.div
              className="relative flex items-center justify-center"
              style={{
                width: 96, height: 96,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.18), rgba(212,168,83,0.06))',
                border: '2px solid rgba(212,168,83,0.6)',
                boxShadow: [
                  '0 0 0 1px rgba(212,168,83,0.15)',
                  '0 0 35px rgba(212,168,83,0.28)',
                  '0 0 80px rgba(212,168,83,0.12)',
                  'inset 0 0 25px rgba(212,168,83,0.08)',
                ].join(', '),
              }}
              animate={{ boxShadow: [
                '0 0 35px rgba(212,168,83,0.28), 0 0 80px rgba(212,168,83,0.12), inset 0 0 25px rgba(212,168,83,0.08)',
                '0 0 55px rgba(212,168,83,0.45), 0 0 110px rgba(212,168,83,0.18), inset 0 0 30px rgba(212,168,83,0.12)',
                '0 0 35px rgba(212,168,83,0.28), 0 0 80px rgba(212,168,83,0.12), inset 0 0 25px rgba(212,168,83,0.08)',
              ]}}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Inner ring */}
              <div className="absolute rounded-full" style={{
                inset: 8,
                border: '1px solid rgba(212,168,83,0.25)',
              }} />

              {/* G SVG */}
              <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden>
                <defs>
                  <linearGradient id="lgG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#F0D080" />
                    <stop offset="45%"  stopColor="#D4A853" />
                    <stop offset="100%" stopColor="#A0680A" />
                  </linearGradient>
                  <filter id="lgGlow">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <text
                  x="23" y="31"
                  textAnchor="middle"
                  fontSize="30"
                  fontWeight="800"
                  fill="url(#lgG)"
                  filter="url(#lgGlow)"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  K
                </text>
              </svg>
            </motion.div>
          </motion.div>

          {/* ── Brand text & progress ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className="relative z-10 mt-9 flex flex-col items-center gap-1"
          >
            {/* KVL TRACK shimmer text */}
            <div
              className="text-2xl font-extrabold tracking-[0.28em] uppercase"
              style={{
                background: 'linear-gradient(90deg, #A06010 0%, #E8C06A 30%, #D4A853 50%, #F0D090 70%, #A06010 100%)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                animation: 'shimmer-gold 2.8s linear infinite',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              KVL TRACK
            </div>

            {/* Subtitle */}
            <div className="text-[10px] tracking-[0.22em] uppercase mb-5" style={{ color: '#6B7280' }}>
              by KVL Business Solutions
            </div>

            {/* Cycling message */}
            <div className="h-4 mb-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msg}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="text-[11px] tracking-wide text-center"
                  style={{ color: '#857970' }}
                >
                  {MSGS[msg]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div
              className="w-44 h-[2px] rounded-full overflow-hidden"
              style={{ background: 'rgba(212,168,83,0.14)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #9A5E08, #D4A853, #F0D090)',
                  boxShadow:  '0 0 8px rgba(212,168,83,0.65)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            </div>

            {/* Progress pct */}
            <div className="mt-1.5 text-[10px] tabular-nums" style={{ color: 'rgba(212,168,83,0.45)' }}>
              {progress}%
            </div>
          </motion.div>

          {/* ── Bottom tagline ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute bottom-8 text-center z-10"
          >
            <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: 'rgba(133,121,112,0.5)' }}>
              What Pulls You Together
            </p>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
