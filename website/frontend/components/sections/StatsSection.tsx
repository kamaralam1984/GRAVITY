'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STATS } from '@/lib/constants'

/* ── Count-up hook ────────────────────────────────────────────── */
function useCountUp(target: number, duration: number, inView: boolean) {
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState(false)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!inView) return
    setDone(false)
    startRef.current = null
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const t = Math.min((ts - startRef.current) / (duration * 1000), 1)
      const e = 1 - Math.pow(1 - t, 3)
      setCurrent(parseFloat((e * target).toFixed(target % 1 !== 0 ? 1 : 0)))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else setDone(true)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, inView])

  return { current, done }
}

/* ── Circular SVG Progress Ring ───────────────────────────────── */
const RING_SIZE = 54
const STROKE = 2
const RADIUS = (RING_SIZE - STROKE * 2 - 4) / 2
const CIRC = 2 * Math.PI * RADIUS

function ProgressRing({
  progress,
  inView,
  id,
  delay = 0,
}: {
  progress: number
  inView: boolean
  id: string
  delay?: number
}) {
  const [offset, setOffset] = useState(CIRC)
  const cx = RING_SIZE / 2
  const cy = RING_SIZE / 2

  useEffect(() => {
    if (!inView) return
    const tid = setTimeout(() => {
      setOffset(CIRC * (1 - progress / 100))
    }, delay * 1000 + 300)
    return () => clearTimeout(tid)
  }, [inView, progress, delay])

  /* Leading dot position at arc tip */
  const angle = (progress / 100) * 2 * Math.PI - Math.PI / 2
  const dotX = cx + RADIUS * Math.cos(angle)
  const dotY = cy + RADIUS * Math.sin(angle)

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      className="absolute inset-0"
      style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`rg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5C842" />
          <stop offset="50%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#B8720A" />
        </linearGradient>
        <filter id={`rf-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`dotf-${id}`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer decorative dashed orbit ring */}
      <circle
        cx={cx} cy={cy}
        r={RADIUS + 10}
        fill="none"
        stroke="rgba(212,168,83,0.12)"
        strokeWidth="1"
        strokeDasharray="4 8"
      />

      {/* Track */}
      <circle
        cx={cx} cy={cy} r={RADIUS}
        fill="none"
        stroke="rgba(184,114,10,0.14)"
        strokeWidth={STROKE}
      />

      {/* Arc */}
      <circle
        cx={cx} cy={cy} r={RADIUS}
        fill="none"
        stroke={`url(#rg-${id})`}
        strokeWidth={STROKE + 1}
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        filter={`url(#rf-${id})`}
        style={{ transition: `stroke-dashoffset ${2.4 + delay * 0.1}s cubic-bezier(0.16,1,0.3,1)` }}
      />

      {/* Leading dot (only when arc is drawn) */}
      {inView && progress > 0 && (
        <circle
          cx={dotX} cy={dotY} r={2}
          fill="#F5C842"
          filter={`url(#dotf-${id})`}
          style={{
            opacity: offset < CIRC ? 1 : 0,
            transition: `opacity 0.4s ease ${delay + 2.5}s`,
          }}
        />
      )}
    </svg>
  )
}

/* ── Sparkle particles ────────────────────────────────────────── */
const SPARK_POSITIONS = [
  { top: '12%', left: '18%', size: 3, delay: '0s',    drift: '-6px'  },
  { top: '8%',  left: '72%', size: 2, delay: '0.7s',  drift: '5px'   },
  { top: '22%', left: '85%', size: 3, delay: '1.4s',  drift: '-4px'  },
  { top: '70%', left: '80%', size: 2, delay: '2.1s',  drift: '8px'   },
  { top: '78%', left: '14%', size: 3, delay: '1.05s', drift: '-7px'  },
  { top: '55%', left: '8%',  size: 2, delay: '0.35s', drift: '4px'   },
]

function Sparkles({ active }: { active: boolean }) {
  return (
    <>
      {SPARK_POSITIONS.map((p, i) => (
        <span
          key={i}
          className="stat-sparkle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: active ? p.delay : '9999s',
            '--sx': p.drift,
          } as React.CSSProperties}
        />
      ))}
    </>
  )
}

/* ── Config ───────────────────────────────────────────────────── */
const STAT_EMOJIS   = ['👨‍👩‍👧', '🌍', '🛡️', '⭐']
const STAT_SUBTITLES = [
  'Families trust us daily',
  'Global presence',
  'Safety events handled',
  'Enterprise reliability',
]
const STAT_PROGRESS = [82, 60, 97, 99]

/* Logo SVGs (brand colours — preserved from original) */
function TechCrunchLogo() {
  return (
    <svg height="20" viewBox="0 0 142 20" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="16" fontFamily="'Arial Black','Arial',sans-serif" fontWeight="900" fontSize="17" fill="#3DA240" letterSpacing="-0.3">TechCrunch</text>
    </svg>
  )
}
function ForbesLogo() {
  return (
    <svg height="26" viewBox="0 0 76 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fontFamily="Georgia,'Times New Roman',serif" fontWeight="700" fontStyle="italic" fontSize="24" letterSpacing="0.3">Forbes</text>
    </svg>
  )
}
function ProductHuntLogo() {
  return (
    <svg height="26" viewBox="0 0 152 26" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="13" fill="#DA552F"/>
      <text x="8" y="18" fontFamily="'Arial',sans-serif" fontWeight="900" fontSize="15" fill="white">P</text>
      <text x="31" y="18.5" fontFamily="'Arial',sans-serif" fontWeight="700" fontSize="14" fill="currentColor">Product Hunt</text>
    </svg>
  )
}
function YCombinatorLogo() {
  return (
    <svg height="26" viewBox="0 0 152 26" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="26" height="26" rx="5" fill="#F26522"/>
      <text x="6.5" y="19" fontFamily="'Arial Black','Arial',sans-serif" fontWeight="900" fontSize="15" fill="white">Y</text>
      <text x="34" y="19" fontFamily="'Arial',sans-serif" fontWeight="600" fontSize="14" fill="currentColor">Combinator</text>
    </svg>
  )
}
function MITLogo() {
  return (
    <svg height="18" viewBox="0 0 178 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="14" fontFamily="Georgia,serif" fontWeight="700" fontSize="12.5" letterSpacing="0.3">MIT Technology Review</text>
    </svg>
  )
}
function WiredLogo() {
  return (
    <svg height="24" viewBox="0 0 86 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="20" fontFamily="'Arial Black','Impact',sans-serif" fontWeight="900" fontSize="23" letterSpacing="-0.5">WIRED</text>
    </svg>
  )
}
function FastCompanyLogo() {
  return (
    <svg height="20" viewBox="0 0 130 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="16" fontFamily="'Arial',sans-serif" fontWeight="800" fontSize="15" letterSpacing="0.2">Fast Company</text>
    </svg>
  )
}
function TimeLogo() {
  return (
    <svg height="28" viewBox="0 0 80 28" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="24" fontFamily="'Times New Roman',Georgia,serif" fontWeight="900" fontSize="27" fill="#E21B1B" letterSpacing="3">TIME</text>
    </svg>
  )
}

interface Logo { name: string; Component: React.FC }
const LOGOS: Logo[] = [
  { name: 'TechCrunch',           Component: TechCrunchLogo  },
  { name: 'Forbes',               Component: ForbesLogo      },
  { name: 'ProductHunt',          Component: ProductHuntLogo },
  { name: 'Y Combinator',         Component: YCombinatorLogo },
  { name: 'MIT Technology Review', Component: MITLogo        },
  { name: 'Wired',                Component: WiredLogo       },
  { name: 'Fast Company',         Component: FastCompanyLogo },
  { name: 'TIME',                 Component: TimeLogo        },
]
const MARQUEE_LOGOS = [...LOGOS, ...LOGOS, ...LOGOS]

/* ── Premium Stat Card ────────────────────────────────────────── */
function PremiumStatCard({
  stat,
  emoji,
  subtitle,
  progress,
  index,
  inView,
}: {
  stat: typeof STATS[0]
  emoji: string
  subtitle: string
  progress: number
  index: number
  inView: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const { current, done } = useCountUp(stat.value, 2.4, inView)

  const isDecimal = stat.value % 1 !== 0
  const formatted = isDecimal
    ? current.toFixed(1)
    : current >= 1_000_000
    ? (current / 1_000_000).toFixed(1) + 'M'
    : current >= 1_000
    ? (current / 1_000).toFixed(0) + 'K'
    : Math.round(current).toLocaleString()

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 48, scale: 0.88 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.75, delay: index * 0.13, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative flex flex-col items-center text-center px-3 py-4 rounded-2xl overflow-hidden h-full"
        animate={
          hovered
            ? { y: -10, boxShadow: '0 24px 64px rgba(212,168,83,0.28), 0 0 0 1px rgba(212,168,83,0.3)' }
            : { y: 0, boxShadow: '0 0 0 rgba(0,0,0,0), 0 0 0 1px rgba(212,168,83,0.1)' }
        }
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ background: 'rgba(var(--gold-rgb), 0.035)' }}
      >
        {/* Sparkle particles */}
        <Sparkles active={inView} />

        {/* Top hover glow bloom */}
        <motion.div
          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.4) 0%, transparent 70%)' }}
        />

        {/* Card inner shine line on hover */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          animate={{ opacity: hovered ? 1 : 0 }}
          style={{
            background: 'linear-gradient(to right, transparent 10%, rgba(212,168,83,0.6) 50%, transparent 90%)',
          }}
        />

        {/* Progress ring + icon */}
        <div
          className="relative flex-shrink-0 flex items-center justify-center mb-3"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <ProgressRing
            progress={progress}
            inView={inView}
            id={String(index)}
            delay={index * 0.1}
          />

          {/* Icon badge — bounces in */}
          <motion.div
            className="relative z-10 flex items-center justify-center w-7 h-7 rounded-xl"
            initial={{ scale: 0, rotate: -15 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.13 + 0.45, ease: [0.175, 0.885, 0.32, 1.275] }}
            style={{
              background: hovered
                ? 'rgba(var(--gold-rgb), 0.18)'
                : 'rgba(var(--gold-rgb), 0.10)',
              border: '1px solid rgba(var(--gold-rgb), 0.25)',
              boxShadow: hovered ? '0 0 24px rgba(212,168,83,0.45)' : 'none',
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <span className="text-sm leading-none select-none">{emoji}</span>

            {/* Inner pulse ring */}
            {inView && (
              <span
                className="absolute inset-0 rounded-2xl animate-pulse-gold pointer-events-none"
                style={{ animationDelay: `${index * 0.4}s` }}
              />
            )}
          </motion.div>
        </div>

        {/* Number */}
        <motion.div
          className={`gradient-text-gold font-extrabold leading-none tabular-nums mb-1.5 ${done ? 'stat-number-flash' : ''}`}
          style={{
            fontSize: 'clamp(1.2rem, 2.2vw, 1.75rem)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {formatted}{stat.suffix}
        </motion.div>

        {/* Primary label */}
        <p
          className="text-xs font-semibold mb-0.5"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
        >
          {stat.label}
        </p>

        {/* Subtitle — slides up on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.p
              className="text-xs"
              initial={{ opacity: 0, y: 6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 4, height: 0 }}
              transition={{ duration: 0.22 }}
              style={{ color: 'var(--text-muted)' }}
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div
          className="mt-3 w-full h-0.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(var(--gold-rgb), 0.1)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(to right, var(--gold-dark), var(--gold), #F5C842)',
              boxShadow: hovered ? '0 0 8px rgba(212,168,83,0.6)' : 'none',
            }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${progress}%` } : { width: 0 }}
            transition={{
              duration: 2.2,
              delay: index * 0.13 + 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        {/* Progress percentage label */}
        <motion.p
          className="mt-1 text-[9px] font-medium tabular-nums"
          style={{ color: 'var(--gold)', opacity: 0.65 }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.65 } : {}}
          transition={{ delay: index * 0.13 + 2.4 }}
        >
          {progress}% milestone
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

/* ── Main Section ─────────────────────────────────────────────── */
export default function StatsSection() {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="stats"
      ref={ref}
      className="relative overflow-hidden py-24 border-y"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* ── Backgrounds ── */}
      {/* Light: warm cream */}
      <div
        className="absolute inset-0 dark:opacity-0 transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, #FDF6EC 0%, #FAFAF8 45%, #FEF0EC 100%)' }}
      />
      {/* Dark: surface */}
      <div
        className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500"
        style={{ background: 'var(--bg-surface)' }}
      />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0">
        {/* Light orb (left) */}
        <div
          className="absolute top-1/2 left-[10%] w-80 h-80 rounded-full blur-3xl -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(184,114,10,0.08) 0%, transparent 70%)' }}
        />
        {/* Dark orb (right) — stronger in dark mode */}
        <div
          className="absolute top-1/2 right-[10%] w-80 h-80 rounded-full blur-3xl -translate-y-1/2 opacity-40 dark:opacity-100"
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 70%)' }}
        />
        {/* Center pulse orb */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 blur-3xl opacity-30 dark:opacity-50"
          style={{ background: 'radial-gradient(ellipse, rgba(212,168,83,0.25) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section eyebrow */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="h-px w-16 rounded-full" style={{ background: 'linear-gradient(to right, transparent, var(--gold))' }} />
          <span
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: 'var(--gold)' }}
          >
            Impact at scale
          </span>
          <div className="h-px w-16 rounded-full" style={{ background: 'linear-gradient(to left, transparent, var(--gold))' }} />
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, i) => (
            <PremiumStatCard
              key={stat.label}
              stat={stat}
              emoji={STAT_EMOJIS[i]}
              subtitle={STAT_SUBTITLES[i]}
              progress={STAT_PROGRESS[i]}
              index={i}
              inView={inView}
            />
          ))}
        </div>

        {/* Animated divider */}
        <motion.div
          className="mt-16 mb-0 h-px rounded-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(var(--gold-rgb),0.3), transparent)' }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease: 'easeInOut' }}
        />

        {/* ── Trust Marquee ── */}
        <div className="mt-14">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
              style={{ color: 'var(--text-muted)' }}
            >
              As featured in
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div
            className="relative overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
          >
            <div
              className="flex items-center animate-marquee py-3"
              style={{ width: 'max-content' }}
              onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
              onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
            >
              {MARQUEE_LOGOS.map(({ name, Component }, i) => (
                <span key={`${name}-${i}`} className="flex items-center">
                  <span className="logo-item flex items-center justify-center px-7 cursor-default">
                    <Component />
                  </span>
                  <span className="text-[7px] flex-shrink-0 opacity-40" style={{ color: 'var(--gold)' }} aria-hidden>◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ribbon ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl px-8 py-6"
          style={{
            background: 'rgba(var(--gold-rgb), 0.06)',
            border: '1px solid rgba(var(--gold-rgb), 0.18)',
          }}
        >
          <p
            className="text-lg font-semibold text-center sm:text-left"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Join the fastest-growing family safety platform
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              {['Free to start', 'No credit card', 'Cancel anytime'].map(prop => (
                <span key={prop} className="flex items-center gap-1.5">
                  <span style={{ color: 'var(--safe)' }}>✓</span>
                  {prop}
                </span>
              ))}
            </div>
            <a
              href="#download"
              className="btn-gold flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              Start for Free
              <span aria-hidden>→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
