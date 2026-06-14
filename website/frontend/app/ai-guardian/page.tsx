'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Sparkles,
  ChevronRight,
  MapPin,
  Activity,
  Mic,
  AlertTriangle,
  CheckCircle,
  Car,
  Heart,
  Navigation,
  Shield,
  User,
  Phone,
  Clock,
  TrendingUp,
  Zap,
  Calendar,
  Download,
  Star,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AIGuardianDashboard from '@/components/sections/AIGuardianDashboard'
import { getToken } from '@/lib/auth'

/* ── Animation variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ── Neural network hero background ────────────────────────────────────────── */
const HERO_NODES = [
  { cx: 80, cy: 60 }, { cx: 200, cy: 40 }, { cx: 320, cy: 80 }, { cx: 440, cy: 50 },
  { cx: 560, cy: 90 }, { cx: 680, cy: 45 }, { cx: 760, cy: 75 },
  { cx: 120, cy: 160 }, { cx: 260, cy: 140 }, { cx: 380, cy: 170 }, { cx: 500, cy: 145 },
  { cx: 620, cy: 165 }, { cx: 720, cy: 150 },
  { cx: 60, cy: 240 }, { cx: 180, cy: 220 }, { cx: 310, cy: 255 }, { cx: 440, cy: 230 },
  { cx: 570, cy: 250 }, { cx: 690, cy: 235 }, { cx: 780, cy: 260 },
]
const HERO_EDGES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],
  [0,7],[1,7],[1,8],[2,8],[2,9],[3,9],[3,10],[4,10],[4,11],[5,11],[5,12],[6,12],
  [7,13],[7,14],[8,14],[8,15],[9,15],[9,16],[10,16],[10,17],[11,17],[11,18],[12,18],[12,19],
  [13,14],[14,15],[15,16],[16,17],[17,18],[18,19],
]

function NeuralBackground() {
  return (
    <svg
      viewBox="0 0 840 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity: 0.18, pointerEvents: 'none',
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      {HERO_EDGES.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={HERO_NODES[a].cx} y1={HERO_NODES[a].cy}
          x2={HERO_NODES[b].cx} y2={HERO_NODES[b].cy}
          stroke="url(#heroLineGrad)"
          strokeWidth="0.8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 2 + (i % 6) * 0.3, delay: i * 0.06, repeat: Infinity, repeatType: 'reverse' }}
        />
      ))}
      {HERO_NODES.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.cx} cy={n.cy} r="3"
          fill="url(#heroDotGrad)"
          animate={{ r: [2, 4, 2], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5 + (i % 5) * 0.4, delay: i * 0.12, repeat: Infinity }}
        />
      ))}
      <defs>
        <linearGradient id="heroLineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id="heroDotGrad">
          <stop offset="0%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ── Section wrapper ────────────────────────────────────────────────────────── */
function Section({ children, bg = 'var(--bg)' }: { children: React.ReactNode; bg?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={{ background: bg, padding: '88px 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
    </motion.section>
  )
}

/* ── Animated gauge (CSS/SVG — no external lib) ─────────────────────────────── */
function PredictionGauge({
  label, score, max = 100, color, icon, description,
}: {
  label: string; score: number; max?: number; color: string; icon: React.ReactNode; description: string
}) {
  const r = 44
  const c = 2 * Math.PI * r
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '24px 18px',
        textAlign: 'center',
        cursor: 'default',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Icon badge */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}15`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, margin: '0 auto 14px',
      }}>
        {icon}
      </div>

      {/* Circular gauge */}
      <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 14px' }}>
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${c}`}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c * (1 - score / max) }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            transform="rotate(-90 48 48)"
            style={{ filter: `drop-shadow(0 0 6px ${color}70)` }}
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>/{max}</div>
        </div>
      </div>

      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', margin: '0 0 6px' }}>
        {label}
      </h4>
      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
        {description}
      </p>
    </motion.div>
  )
}

/* ── Weekly bar chart (pure SVG) ─────────────────────────────────────────────── */
const WEEKLY_DATA = [
  { day: 'Mon', score: 88, events: 3 },
  { day: 'Tue', score: 92, events: 1 },
  { day: 'Wed', score: 79, events: 5 },
  { day: 'Thu', score: 95, events: 0 },
  { day: 'Fri', score: 84, events: 2 },
  { day: 'Sat', score: 91, events: 1 },
  { day: 'Sun', score: 97, events: 0 },
]

function WeeklySafetyChart() {
  const maxH = 140
  return (
    <svg viewBox="0 0 560 200" style={{ width: '100%', maxWidth: 560, overflow: 'visible' }}>
      {/* Y axis guides */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = 170 - (pct / 100) * maxH
        return (
          <g key={pct}>
            <line x1="40" y1={y} x2="540" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x="32" y={y + 4} fontSize="9" fill="rgba(255,255,255,0.25)" textAnchor="end">{pct}</text>
          </g>
        )
      })}

      {/* Bars */}
      {WEEKLY_DATA.map((d, i) => {
        const x = 55 + i * 72
        const barH = (d.score / 100) * maxH
        const y = 170 - barH
        const color = d.score >= 90 ? '#10B981' : d.score >= 80 ? '#D4A853' : '#EF4444'
        return (
          <g key={d.day}>
            {/* Bar background */}
            <rect x={x} y={170 - maxH} width="40" height={maxH} fill="rgba(255,255,255,0.03)" rx="5" />
            {/* Animated bar */}
            <motion.rect
              x={x} y={170} width="40" height={0} fill={color} rx="5"
              style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
              animate={{ y, height: barH }}
              transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
            />
            {/* Score label */}
            <motion.text
              x={x + 20} y={y - 5}
              fontSize="9" fill={color} textAnchor="middle" fontWeight="700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              {d.score}
            </motion.text>
            {/* Day label */}
            <text x={x + 20} y="186" fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="middle">
              {d.day}
            </text>
            {/* Event dots */}
            {d.events > 0 && (
              <motion.circle
                cx={x + 20} cy={y - 16} r="3"
                fill="#EF4444"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1, type: 'spring' }}
              />
            )}
          </g>
        )
      })}

      {/* Trend line */}
      <motion.polyline
        points={WEEKLY_DATA.map((d, i) => `${55 + i * 72 + 20},${170 - (d.score / 100) * maxH}`).join(' ')}
        fill="none"
        stroke="rgba(167,139,250,0.4)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
    </svg>
  )
}

/* ── Voice command card ──────────────────────────────────────────────────────── */
function VoiceCommandCard({
  command, response, icon, color, delay,
}: {
  command: string; response: string; icon: React.ReactNode; color: string; delay: number
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      variants={fadeUp}
      onClick={() => setExpanded(!expanded)}
      whileHover={{ y: -3 }}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${expanded ? color + '40' : 'var(--border)'}`,
        borderRadius: 14,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: expanded ? 10 : 0 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: `${color}15`, border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Mic size={11} style={{ color: '#D4A853' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              &ldquo;{command}&rdquo;
            </span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                padding: '10px 12px',
                background: `${color}08`,
                border: `1px solid ${color}20`,
                borderRadius: 8,
                marginTop: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <Brain size={11} style={{ color, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {response}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Daily safety timeline item ─────────────────────────────────────────────── */
function TimelineItem({
  time, member, event, status, icon, delay,
}: {
  time: string; member: string; event: string; status: 'safe' | 'warning' | 'alert'; icon: React.ReactNode; delay: number
}) {
  const statusColor = status === 'safe' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444'
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0' }}
    >
      {/* Time + dot column */}
      <div style={{ width: 52, flexShrink: 0, textAlign: 'right' }}>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{time}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div
          style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: `${statusColor}18`, border: `1.5px solid ${statusColor}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: statusColor,
          }}
        >
          {icon}
        </div>
        <div style={{ width: 1, flex: 1, minHeight: 20, background: 'rgba(255,255,255,0.06)', marginTop: 3 }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{member}</span>
          <span
            style={{
              fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px',
              borderRadius: 999, background: `${statusColor}15`,
              border: `1px solid ${statusColor}35`, color: statusColor,
            }}
          >
            {status.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{event}</p>
      </div>
    </motion.div>
  )
}

/* ── Runtime helpers ─────────────────────────────────────────────────────────── */
function getScoreByCategory(scores: any[], category: string): number | null {
  return scores.find((s: any) => s.category === category)?.score ?? null
}
function getColorByCategory(scores: any[], category: string): string {
  return scores.find((s: any) => s.category === category)?.color ?? '#6B7280'
}
function eventIcon(category: string): React.ReactNode {
  if (category === 'health') return <Heart size={10} />
  if (category === 'driving') return <Car size={10} />
  if (category === 'location') return <MapPin size={10} />
  if (category === 'routine') return <CheckCircle size={10} />
  if (category === 'sos') return <AlertTriangle size={10} />
  return <Activity size={10} />
}
function formatReportDate(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return iso
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function AIGuardianPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  const [safetyScores, setSafetyScores] = useState<any[]>([])
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [dailyReport, setDailyReport] = useState<any | null>(null)
  const [riskPredictions, setRiskPredictions] = useState<any | null>(null)

  useEffect(() => {
    async function load() {
      const token = getToken()
      if (!token) return
      const h = { Authorization: `Bearer ${token}` }
      try {
        const [meRes, famRes] = await Promise.all([
          fetch('/auth/me', { headers: h }),
          fetch('/families/my', { headers: h }),
        ])
        let uid: number | null = null
        if (meRes.ok) { const md = await meRes.json(); uid = md.user?.id ?? md.id ?? null }
        if (!famRes.ok) return
        const famData = await famRes.json()
        const fid = Array.isArray(famData) ? famData[0]?.id : (famData.id ?? famData.family?.id)
        if (!fid) return

        const fetches: Promise<Response>[] = [
          fetch(`/api/ai-guardian/safety-scores/${fid}`, { headers: h }),
          fetch(`/api/ai-guardian/daily-report/${fid}`, { headers: h }),
        ]
        if (uid) fetches.push(fetch(`/api/ai-guardian/risk-predictions/${uid}`, { headers: h }))

        const results = await Promise.all(fetches)
        const [sr, rr, prRes] = results
        if (sr?.ok) { const d = await sr.json(); setSafetyScores(d.scores ?? []); setOverallScore(d.overall_score ?? null) }
        if (rr?.ok) { const d = await rr.json(); setDailyReport(d) }
        if (prRes?.ok) { const d = await prRes.json(); setRiskPredictions(d) }
      } catch { /* silent — keep static fallback */ }
    }
    load()
  }, [])

  return (
    <>
      <Navbar />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — Meet Your AI Safety Guardian
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(160deg, #060810 0%, #0c0820 40%, #080c18 100%)',
          minHeight: '92vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          padding: '110px 24px 80px',
        }}
      >
        <NeuralBackground />

        {/* Radial glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.65, 0.3], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,83,0.05) 0%, rgba(139,92,246,0.04) 40%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating particles */}
        {[
          { top: '18%', left: '10%', size: 4, delay: 0, color: '#D4A853' },
          { top: '28%', right: '12%', size: 3, delay: 1.4, color: '#A78BFA' },
          { top: '65%', left: '7%', size: 5, delay: 0.7, color: '#A78BFA' },
          { top: '72%', right: '9%', size: 3, delay: 2.1, color: '#D4A853' },
          { top: '45%', left: '88%', size: 4, delay: 1.1, color: '#10B981' },
          { top: '55%', left: '3%', size: 3, delay: 1.8, color: '#10B981' },
        ].map((p, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -14, 0], opacity: [0.25, 0.8, 0.25] }}
            transition={{ duration: 4.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
            style={{
              position: 'absolute', top: p.top, left: (p as any).left, right: (p as any).right,
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color, pointerEvents: 'none',
            }}
          />
        ))}

        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 36, textAlign: 'left' }}
          >
            <Link
              href="/"
              style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              ← Back to Gravity Home
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}
          >
            <motion.span
              animate={{ boxShadow: ['0 0 12px rgba(212,168,83,0.2)', '0 0 28px rgba(212,168,83,0.5)', '0 0 12px rgba(212,168,83,0.2)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                background: 'rgba(212,168,83,0.1)',
                border: '1px solid rgba(212,168,83,0.35)',
                color: 'var(--gold)',
                borderRadius: 999, padding: '7px 20px',
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <Brain size={13} />
              </motion.span>
              Gravity 4.0 AI Guardian Intelligence
            </motion.span>
          </motion.div>

          {/* H1 with animated gradient text */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.6rem, 7vw, 5rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.06,
              marginBottom: 26,
            }}
          >
            Meet Your
            <br />
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'linear-gradient(90deg, #D4A853, #A78BFA, #EC4899, #D4A853)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              AI Safety Guardian
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.48 }}
            style={{
              color: 'rgba(255,255,255,0.62)',
              fontSize: 'clamp(1rem, 2.2vw, 1.22rem)',
              maxWidth: 660,
              margin: '0 auto 52px',
              lineHeight: 1.85,
            }}
          >
            The world&apos;s first family AI that predicts safety risks, monitors loved ones in real-time, and speaks to you in plain language — so you can act before emergencies happen.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.58 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}
          >
            <Link
              href="/pricing"
              style={{
                background: 'linear-gradient(90deg, var(--gold), #B8860B)',
                color: '#0a0900', padding: '15px 34px', borderRadius: 12,
                textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 32px rgba(212,168,83,0.38)',
              }}
            >
              Enable AI Guardian — ₹299/month <ChevronRight size={18} />
            </Link>
            <a
              href="#dashboard"
              style={{
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
                color: '#fff', padding: '15px 34px', borderRadius: 12,
                textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              See Live Dashboard
            </a>
          </motion.div>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.68 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              { icon: <Shield size={13} />, text: '94% Prediction Accuracy', color: '#10B981' },
              { icon: <Activity size={13} />, text: 'Real-time Neural Analysis', color: '#A78BFA' },
              { icon: <Brain size={13} />, text: '24/7 AI Learning', color: '#D4A853' },
              { icon: <Zap size={13} />, text: '< 3s Alert Response', color: '#EC4899' },
            ].map((pill) => (
              <motion.div
                key={pill.text}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)',
                  border: `1px solid ${pill.color}30`,
                  borderRadius: 999, padding: '8px 18px',
                  color: pill.color, fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                {pill.icon}{pill.text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          DASHBOARD SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        id="dashboard"
        style={{ background: 'var(--bg-surface)', padding: '88px 0' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: 52 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              AI Guardian Dashboard
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              Your family&apos;s complete safety intelligence — all in one live, interactive panel.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AIGuardianDashboard />
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PREDICTIVE SAFETY ENGINE — 6 cards
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Predictive Safety Engine
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.75 }}>
              Six AI modules working in parallel — each trained on millions of real family safety events to predict risk before it becomes danger.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 18 }}
          >
            {[
              { cat: 'route_safety', label: 'Route Safety', fallback: 94, fallbackColor: '#10B981', icon: <Navigation size={16} />, description: 'Analyzes real-time traffic, crime data, and deviation patterns for every family route.' },
              { cat: 'child_risk', label: 'Child Safety', fallback: 97, fallbackColor: '#3B82F6', icon: <User size={16} />, description: 'Monitors school arrival, route compliance, and unusual contact patterns.' },
              { cat: 'elderly_risk', label: 'Elder Wellness', fallback: 72, fallbackColor: '#F59E0B', icon: <Heart size={16} />, description: 'Tracks mobility patterns, heartrate trends, and fall risk indicators in all weather.' },
              { cat: 'driving_risk', label: 'Driving Risk', fallback: 23, fallbackColor: '#10B981', icon: <Car size={16} />, description: 'Detects harsh braking, phone usage, drowsiness signals, and fatigue patterns.' },
              { cat: 'health_risk', label: 'Health Index', fallback: 88, fallbackColor: '#A78BFA', icon: <Activity size={16} />, description: 'Combines smartwatch data, mobility trends, and rest patterns into a unified score.' },
              { cat: 'emergency_probability', label: 'Emergency Risk', fallback: 8, fallbackColor: '#10B981', icon: <AlertTriangle size={16} />, description: 'Cross-references all signals to predict emergency probability in the next 24 hours.' },
            ].map(g => (
              <PredictionGauge
                key={g.cat}
                label={g.label}
                score={getScoreByCategory(safetyScores, g.cat) ?? g.fallback}
                color={safetyScores.length > 0 ? getColorByCategory(safetyScores, g.cat) : g.fallbackColor}
                icon={g.icon}
                description={g.description}
              />
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          DAILY SAFETY REPORT — Family timeline
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Daily Safety Report
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              AI generates a complete family safety timeline automatically — no manual check-ins required.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
            {/* Timeline column */}
            <motion.div
              variants={fadeUp}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 18, padding: '28px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Calendar size={15} style={{ color: '#D4A853' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {dailyReport ? `Today — ${formatReportDate(dailyReport.report_date)}` : 'Today\'s Safety Report'}
                </span>
              </div>

              {dailyReport && dailyReport.events.length > 0 ? (
                dailyReport.events.map((ev: any, i: number) => (
                  <TimelineItem
                    key={i}
                    time={ev.time}
                    member={ev.member}
                    event={ev.event}
                    status={ev.status as 'safe' | 'warning' | 'alert'}
                    icon={eventIcon(ev.category)}
                    delay={0.05 + i * 0.05}
                  />
                ))
              ) : dailyReport ? (
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', padding: '12px 0' }}>No events recorded in the last 24 hours.</div>
              ) : (
                <>
                  <TimelineItem time="7:15 AM" member="Grandma" event="Completed morning walk — 1.8km in 28 minutes. Heart rate normal." status="safe" icon={<Heart size={10} />} delay={0.05} />
                  <TimelineItem time="8:42 AM" member="Aanya" event="Arrived at St. Mary's School safely via expected route." status="safe" icon={<User size={10} />} delay={0.1} />
                  <TimelineItem time="9:15 AM" member="Dad" event="Entered office geofence zone. Commute time: 34 minutes." status="safe" icon={<MapPin size={10} />} delay={0.15} />
                  <TimelineItem time="11:30 AM" member="Rohan" event="2 harsh brake events detected during school commute. Driving score: 67/100." status="alert" icon={<Car size={10} />} delay={0.2} />
                  <TimelineItem time="3:45 PM" member="Aanya" event="Left school — on expected route home. ETA: 4:05 PM." status="safe" icon={<Navigation size={10} />} delay={0.25} />
                </>
              )}
            </motion.div>

            {/* Summary stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <motion.div
                variants={fadeUp}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 18, padding: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <TrendingUp size={15} style={{ color: '#10B981' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Today&apos;s Safety Summary
                  </span>
                </div>
                {[
                  { label: 'Family Safety Score', score: overallScore ?? (dailyReport?.overall_score ?? 87), color: '#10B981' },
                  { label: 'Child Protection', score: getScoreByCategory(safetyScores, 'child_risk') ?? 97, color: '#3B82F6' },
                  { label: 'Elder Wellness', score: getScoreByCategory(safetyScores, 'elderly_risk') ?? 72, color: '#F59E0B' },
                  { label: 'Driving Safety', score: getScoreByCategory(safetyScores, 'driving_risk') ?? 67, color: '#EF4444' },
                  { label: 'Health Index', score: getScoreByCategory(safetyScores, 'health_risk') ?? 88, color: '#A78BFA' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 130, flexShrink: 0 }}>{s.label}</span>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.score}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 3, background: s.color, boxShadow: `0 0 6px ${s.color}60` }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color, width: 24, textAlign: 'right' }}>{s.score}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                variants={fadeUp}
                style={{
                  background: 'rgba(212,168,83,0.06)',
                  border: '1px solid rgba(212,168,83,0.2)',
                  borderRadius: 18, padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Sparkles size={14} style={{ color: '#D4A853' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#D4A853', fontSize: '0.9rem' }}>
                    AI Recommendation
                  </span>
                </div>
                <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
                  {dailyReport?.recommendations?.length > 0
                    ? dailyReport.recommendations.join(' ')
                    : dailyReport?.ai_summary
                    ?? 'AI is analyzing your family\'s safety data. Recommendations will appear here.'}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          AI VOICE COMMANDS — 6 examples
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              AI Voice Commands
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              Ask in plain language. Tap any command to see the AI&apos;s response.
            </p>
          </motion.div>

          {/* Large mic button */}
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', marginBottom: 44 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[1, 1.6, 2.2].map((scale, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, scale, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', width: 88, height: 88, borderRadius: '50%',
                    background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.2)',
                    pointerEvents: 'none',
                  }}
                />
              ))}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  position: 'relative', zIndex: 1,
                  width: 88, height: 88, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold), #B8860B)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(212,168,83,0.4), 0 12px 32px rgba(0,0,0,0.4)',
                }}
                aria-label="Activate voice assistant"
              >
                <Mic size={32} style={{ color: '#0a0900' }} />
              </motion.button>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 36, fontStyle: 'italic' }}>
            Say: &quot;Hey Gravity, where is everyone?&quot; — tap a card to see the AI response
          </motion.p>

          <motion.div
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}
          >
            <VoiceCommandCard
              command="Where is my child?"
              response="Aanya is at St. Mary's School, Mumbai — arrived 8:42 AM via safe route. Currently in the main building. All clear."
              icon={<MapPin size={15} />} color="#3B82F6" delay={0}
            />
            <VoiceCommandCard
              command="Is grandma safe?"
              response="Grandma completed her morning walk at 7:15 AM — 1.8km, normal heartrate. She's home now. Heartrate elevated at 10:15 AM — rest recommended."
              icon={<Heart size={15} />} color="#F59E0B" delay={0.05}
            />
            <VoiceCommandCard
              command="Any emergencies?"
              response="No active SOS alerts. 1 warning: Rohan had 2 harsh brake events this morning. Grandma heartrate elevated. No immediate emergencies."
              icon={<AlertTriangle size={15} />} color="#EF4444" delay={0.1}
            />
            <VoiceCommandCard
              command="Family activity today?"
              response="6 events logged. Aanya at school, Dad at office, Grandma home, Rohan driving. All members located. 1 warning, 0 critical alerts."
              icon={<Activity size={15} />} color="#A78BFA" delay={0.15}
            />
            <VoiceCommandCard
              command="Who needs attention?"
              response="Priority 1: Rohan — driving risk score 67/100, 2 harsh brakes today. Priority 2: Grandma — heartrate elevated, recommend rest and hydration."
              icon={<User size={15} />} color="#EC4899" delay={0.2}
            />
            <VoiceCommandCard
              command="Navigate to Aanya's school"
              response="St. Mary's School, Bandra West. 7.2km via NH 48 — 24 min. School hours end at 3:30 PM. Aanya's last known location: main building."
              icon={<Navigation size={15} />} color="#10B981" delay={0.25}
            />
          </motion.div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          WEEKLY SAFETY SUMMARY CHART
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Weekly Safety Summary
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              Your family&apos;s 7-day safety trend — track improvements and spot patterns over time.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 20, padding: '32px 28px',
            }}
          >
            {/* Chart header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} style={{ color: '#10B981' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  Family Safety Score — June 7–13, 2026
                </span>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                {[
                  { color: '#10B981', label: '≥90 Excellent' },
                  { color: '#D4A853', label: '80–89 Good' },
                  { color: '#EF4444', label: '<80 Review' },
                  { color: '#EF4444', label: '● Alert event' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: item.label.includes('●') ? '50%' : 2, background: item.color }} />
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SVG bar chart */}
            <div style={{ overflowX: 'auto' }}>
              <WeeklySafetyChart />
            </div>

            {/* Weekly stats row */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 28,
                borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24,
              }}
            >
              {[
                { label: 'Avg Safety Score', value: '89.4', color: '#10B981', icon: <Shield size={14} /> },
                { label: 'Total Events', value: '12', color: '#F59E0B', icon: <AlertTriangle size={14} /> },
                { label: 'Best Day', value: 'Sunday', color: '#A78BFA', icon: <Star size={14} /> },
                { label: 'AI Predictions', value: '97.1%', color: '#D4A853', icon: <Brain size={14} /> },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${stat.color}15`, border: `1px solid ${stat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: stat.color, margin: '0 auto 8px',
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          RISK PREDICTIONS — real AI predictions for next 24h
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {riskPredictions && (
        <Section bg="var(--bg)">
          <motion.div variants={stagger}>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                AI Risk Predictions — Next 24 Hours
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
                Real-time AI analysis of your family&apos;s patterns, predicting risks before they become emergencies.
              </p>
              {riskPredictions.next_24h_risk_score !== undefined && (
                <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.25)', borderRadius: 12, padding: '10px 22px' }}>
                  <Shield size={15} style={{ color: '#D4A853' }} />
                  <span style={{ color: '#D4A853', fontWeight: 700, fontSize: '0.9rem' }}>
                    24h Risk Score: {riskPredictions.next_24h_risk_score}/100
                    {riskPredictions.next_24h_risk_score < 30 ? ' — Low Risk' : riskPredictions.next_24h_risk_score < 60 ? ' — Moderate' : ' — High Risk'}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
              {(riskPredictions.predictions as any[]).map((pred: any, i: number) => {
                const sevColor = pred.severity === 'critical' ? '#EF4444' : pred.severity === 'high' ? '#F59E0B' : pred.severity === 'medium' ? '#A78BFA' : '#10B981'
                const pct = Math.round(pred.probability * 100)
                return (
                  <motion.div key={i} variants={fadeUp} whileHover={{ y: -3 }} style={{ background: 'var(--bg-surface)', border: `1px solid ${sevColor}25`, borderRadius: 16, padding: '22px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${sevColor}15`, border: `1px solid ${sevColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sevColor, flexShrink: 0 }}>
                        <AlertTriangle size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', margin: 0 }}>{pred.title}</h4>
                        {pred.affected_member && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Affects: {pred.affected_member}</div>}
                      </div>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: `${sevColor}15`, border: `1px solid ${sevColor}35`, color: sevColor }}>
                        {pred.severity.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 14px' }}>{pred.description}</p>
                    {/* Probability bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Probability</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: sevColor }}>{pct}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 2, background: sevColor, boxShadow: `0 0 6px ${sevColor}60` }} />
                      </div>
                    </div>
                    <div style={{ padding: '9px 12px', background: `${sevColor}08`, border: `1px solid ${sevColor}20`, borderRadius: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                      <strong style={{ color: sevColor }}>Recommendation:</strong> {pred.recommendation}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </Section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BOTTOM CTA — Enable AI Guardian ₹299/month
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        style={{
          background: 'linear-gradient(160deg, #060810 0%, #0c0820 50%, #080c18 100%)',
          padding: '100px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.12, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,83,0.07) 0%, rgba(139,92,246,0.05) 40%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Animated brain icon */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(167,139,250,0.15))',
              border: '1px solid rgba(212,168,83,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
            }}
          >
            <Brain size={34} style={{ color: '#D4A853' }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 800, color: '#FFFFFF', marginBottom: 16,
            }}
          >
            Your Family Deserves AI-Level Protection
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 18, lineHeight: 1.75, fontSize: '1.05rem' }}
          >
            AI Guardian monitors, predicts, and alerts — so you can live your life knowing everyone you love is safe.
          </motion.p>

          {/* Price callout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(212,168,83,0.08)',
              border: '1px solid rgba(212,168,83,0.3)',
              borderRadius: 14, padding: '12px 24px',
              marginBottom: 36,
            }}
          >
            <Sparkles size={16} style={{ color: '#D4A853' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D4A853' }}>₹299</span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>/month per family</span>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px',
              borderRadius: 999, background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)', color: '#10B981',
            }}>14-DAY FREE TRIAL</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}
          >
            <Link
              href="/pricing"
              style={{
                background: 'linear-gradient(90deg, var(--gold), #B8860B)',
                color: '#0a0900', padding: '15px 36px', borderRadius: 12,
                textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 32px rgba(212,168,83,0.35)',
              }}
            >
              <Brain size={18} />
              Enable AI Guardian — ₹299/month
            </Link>
            <Link
              href="/contact"
              style={{
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
                color: '#fff', padding: '15px 36px', borderRadius: 12,
                textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <Phone size={18} />
              Book a Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              '94% prediction accuracy',
              'Trusted by 50,000+ families',
              'End-to-end encrypted',
              'Cancel anytime',
            ].map((trust) => (
              <div key={trust} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={13} style={{ color: '#10B981', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>{trust}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  )
}
