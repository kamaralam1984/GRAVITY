'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Sparkles,
  ChevronRight,
  MapPin,
  Eye,
  Clock,
  Car,
  Shield,
  Activity,
  Mic,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Download,
  Calendar,
  MessageSquare,
  Send,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Animation helpers ──────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ── Neural network background ──────────────────────────────────────────────── */
const NODES = [
  { cx: 80, cy: 60 }, { cx: 200, cy: 40 }, { cx: 320, cy: 80 }, { cx: 440, cy: 50 },
  { cx: 560, cy: 90 }, { cx: 680, cy: 45 }, { cx: 760, cy: 75 },
  { cx: 120, cy: 160 }, { cx: 260, cy: 140 }, { cx: 380, cy: 170 }, { cx: 500, cy: 145 },
  { cx: 620, cy: 165 }, { cx: 720, cy: 150 },
  { cx: 60, cy: 240 }, { cx: 180, cy: 220 }, { cx: 310, cy: 255 }, { cx: 440, cy: 230 },
  { cx: 570, cy: 250 }, { cx: 690, cy: 235 }, { cx: 780, cy: 260 },
]

const EDGES = [
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
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.18,
        pointerEvents: 'none',
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      {EDGES.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={NODES[a].cx} y1={NODES[a].cy}
          x2={NODES[b].cx} y2={NODES[b].cy}
          stroke="url(#lineGrad)"
          strokeWidth="0.8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 2 + Math.random() * 2, delay: i * 0.06, repeat: Infinity, repeatType: 'reverse' }}
        />
      ))}
      {NODES.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.cx} cy={n.cy} r="3"
          fill="url(#dotGrad)"
          animate={{ r: [2, 4, 2], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5 + Math.random() * 2, delay: i * 0.12, repeat: Infinity }}
        />
      ))}
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <radialGradient id="dotGrad">
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

/* ── Phone mockup for Section 2 ─────────────────────────────────────────────── */
function PhoneMockup() {
  const [alertVisible, setAlertVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAlertVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        width: 260,
        background: '#0d0f1a',
        borderRadius: 28,
        border: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,168,83,0.08)',
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      {/* Phone header bar */}
      <div style={{ height: 28, background: '#060810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 60, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* App header */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(212,168,83,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <motion.div
          animate={{ boxShadow: ['0 0 8px #10B981', '0 0 20px #10B981', '0 0 8px #10B981'] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Brain size={12} style={{ color: '#10B981' }} />
        </motion.div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>AI Guardian</div>
          <div style={{ fontSize: '0.58rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Monitoring family
          </div>
        </div>
      </div>

      {/* Map area */}
      <div style={{ position: 'relative', height: 130, background: '#0a1a2e', overflow: 'hidden' }}>
        {/* Route SVG */}
        <svg viewBox="0 0 260 130" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* Grid lines */}
          {[30,60,90,120].map(y => (
            <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          {[52,104,156,208].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="130" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          {/* Normal route */}
          <motion.path
            d="M20,100 C60,80 80,70 120,60 C160,50 180,45 220,30"
            stroke="rgba(16,185,129,0.5)" strokeWidth="2" fill="none" strokeDasharray="4,3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          {/* Deviation route */}
          <motion.path
            d="M120,60 C140,80 160,100 190,105"
            stroke="#EF4444" strokeWidth="2.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 2.2, ease: 'easeInOut' }}
          />
          {/* Risk zone */}
          <motion.circle
            cx={175} cy={100} r={24}
            fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.4)" strokeWidth="1"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, type: 'spring' }}
          />
          {/* Location dot */}
          <motion.circle
            cx={190} cy={105} r={4}
            fill="#EF4444"
            animate={{ r: [3, 5, 3], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          {/* School origin */}
          <circle cx={20} cy={100} r={5} fill="#D4A853" />
          <text x={26} y={97} fontSize="6" fill="rgba(255,255,255,0.5)">School</text>
          {/* Destination */}
          <circle cx={220} cy={30} r={4} fill="#10B981" />
          <text x={200} y={25} fontSize="6" fill="rgba(255,255,255,0.5)">Home</text>
        </svg>
      </div>

      {/* Alert card */}
      <AnimatePresence>
        {alertVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              margin: '10px 10px 0',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 10,
              padding: '8px 10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <AlertTriangle size={10} style={{ color: '#EF4444' }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#EF4444' }}>Route deviation detected</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              Priya is 2.3km off expected route
            </div>
            <div style={{ marginTop: 5, display: 'flex', gap: 4 }}>
              <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 600 }}>
                Risk Score: 87/100
              </span>
              <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(212,168,83,0.15)', color: '#D4A853' }}>
                13:42 PM
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confidence */}
      <div style={{ padding: '8px 10px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Activity size={9} style={{ color: '#A78BFA' }} />
        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)' }}>AI Confidence: 94% · Updated 12s ago</span>
      </div>
    </div>
  )
}

/* ── Circular gauge ─────────────────────────────────────────────────────────── */
function CircularGauge({ score, max = 100, color, label }: { score: number; max?: number; color: string; label: string }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 10px' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${c}`}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c * (1 - score / max) }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            transform="rotate(-90 50 50)"
            style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)' }}>/{max}</div>
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

/* ── Chat message bubble ────────────────────────────────────────────────────── */
function ChatBubble({ role, text, delay = 0 }: { role: 'user' | 'ai'; text: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ display: 'flex', justifyContent: role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-start' }}
    >
      {role === 'ai' && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #A78BFA, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 2,
          }}
        >
          <Brain size={12} style={{ color: '#fff' }} />
        </motion.div>
      )}
      <div
        style={{
          maxWidth: '76%',
          padding: '10px 14px',
          borderRadius: role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          background: role === 'user' ? 'rgba(212,168,83,0.15)' : 'rgba(167,139,250,0.1)',
          border: role === 'user' ? '1px solid rgba(212,168,83,0.28)' : '1px solid rgba(167,139,250,0.22)',
          color: role === 'user' ? 'var(--gold)' : 'rgba(255,255,255,0.85)',
          fontSize: '0.86rem',
          lineHeight: 1.6,
        }}
      >
        {text}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function AIGuardianPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      <Navbar />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 1 — HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(160deg, #060810 0%, #0c0820 40%, #080c18 100%)',
          minHeight: '94vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '110px 24px 90px',
        }}
      >
        {/* Neural network background */}
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

        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
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

          {/* Eyebrow badge */}
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
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <Brain size={13} />
              </motion.span>
              Gravity AI Guardian
            </motion.span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.6rem, 7vw, 4.6rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.08,
              marginBottom: 26,
            }}
          >
            The AI That Keeps
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #D4A853, #A78BFA, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Your Family Safe
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.48 }}
            style={{
              color: 'rgba(255,255,255,0.62)',
              fontSize: 'clamp(1rem, 2.2vw, 1.22rem)',
              maxWidth: 640,
              margin: '0 auto 52px',
              lineHeight: 1.85,
            }}
          >
            Gravity AI Guardian uses machine learning to predict safety risks, analyze family patterns, and alert you before emergencies happen — not after.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.58 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}
          >
            <Link
              href="/pricing"
              style={{
                background: 'linear-gradient(90deg, var(--gold), #B8860B)',
                color: '#0a0900',
                padding: '15px 34px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 32px rgba(212,168,83,0.38)',
              }}
            >
              Start Free Trial <ChevronRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                padding: '15px 34px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              See How It Works
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
              { icon: <Shield size={13} />, text: '94% Accuracy', color: '#10B981' },
              { icon: <Activity size={13} />, text: 'Real-time Analysis', color: '#A78BFA' },
              { icon: <Brain size={13} />, text: '24/7 Learning', color: '#D4A853' },
            ].map((pill) => (
              <motion.div
                key={pill.text}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${pill.color}30`,
                  borderRadius: 999, padding: '8px 18px',
                  color: pill.color, fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                {pill.icon}
                {pill.text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 2 — PREDICTIVE SAFETY ENGINE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
              }}
            >
              Predictive Safety Engine
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75 }}>
              Four intelligent layers that detect threats before they become emergencies — powered by machine learning trained on millions of family safety events.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 40,
              alignItems: 'center',
            }}
          >
            {/* Left: feature cards */}
            <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  emoji: '🗺️',
                  title: 'Unsafe Route Detection',
                  text: 'Gravity analyzes 50M+ routes daily. When your child takes an unusual path, you get an instant alert with the exact deviation marked on a map.',
                  color: '#EF4444',
                },
                {
                  emoji: '👁️',
                  title: 'Suspicious Behavior Patterns',
                  text: 'Our AI monitors movement irregularities — unexpected stops, unusual hours, speed anomalies — and cross-references with public safety data.',
                  color: '#F59E0B',
                },
                {
                  emoji: '⏰',
                  title: 'Missed Routine Alerts',
                  text: 'If your elderly parent doesn\'t take their morning walk or your teen doesn\'t arrive at school on time, AI detects it instantly.',
                  color: '#3B82F6',
                },
                {
                  emoji: '🚗',
                  title: 'Driving Risk Prediction',
                  text: 'Phone usage, harsh braking, drowsy patterns — AI catches dangerous driving before accidents happen.',
                  color: '#10B981',
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  whileHover={{ x: 4, borderColor: `${card.color}40` }}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 14, padding: '18px 20px',
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    transition: 'border-color 0.2s',
                    cursor: 'default',
                  }}
                >
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${card.color}15`,
                      border: `1px solid ${card.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', flexShrink: 0,
                    }}
                  >
                    {card.emoji}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 5 }}>
                      {card.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>
                      {card.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right: phone mockup */}
            <motion.div
              variants={fadeUp}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <div style={{ position: 'relative' }}>
                {/* Glow behind phone */}
                <div
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 65%)',
                    pointerEvents: 'none',
                  }}
                />
                <PhoneMockup />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 3 — FAMILY INSIGHTS DASHBOARD
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
              }}
            >
              Family Insights Dashboard
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75 }}>
              AI generates daily reports so you always know the state of your family — without needing to check the app every hour.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: 22,
            }}
          >
            {/* Card 1: Safety Score */}
            <motion.div
              variants={fadeUp}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 18, padding: '28px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <Shield size={16} style={{ color: '#10B981' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  Family Safety Score Today
                </span>
              </div>

              {/* Big gauge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ position: 'relative', width: 140, height: 140 }}>
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <motion.circle
                      cx="70" cy="70" r="58"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 58}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 58 * 0.18 }}
                      transition={{ duration: 1.8, ease: 'easeOut' }}
                      transform="rotate(-90 70 70)"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.6))' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: '#10B981', lineHeight: 1 }}>82</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>SAFE</div>
                  </div>
                </div>
              </div>

              {/* Sub-scores */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Child Safety', score: 94, color: '#3B82F6' },
                  { label: 'Elderly Wellness', score: 78, color: '#F59E0B' },
                  { label: 'Driving Safety', score: 86, color: '#10B981' },
                  { label: 'Family Routine', score: 90, color: '#A78BFA' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 110, flexShrink: 0 }}>{s.label}</span>
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
              </div>
            </motion.div>

            {/* Card 2: Activity Summary */}
            <motion.div
              variants={fadeUp}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 18, padding: '28px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <Activity size={16} style={{ color: '#A78BFA' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  Daily Activity Summary
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { time: '07:23', text: 'Priya left for school', status: 'safe' },
                  { time: '09:15', text: 'Dad arrived at office', status: 'safe' },
                  { time: '12:30', text: 'Mom at market (unusual)', status: 'warn' },
                  { time: '15:45', text: 'Grandma walked 2.1km', status: 'safe' },
                  { time: '16:30', text: 'Priya left school', status: 'safe' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 36, flexShrink: 0, fontFamily: 'monospace' }}>
                      {item.time}
                    </span>
                    <div
                      style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: item.status === 'safe' ? '#10B981' : '#F59E0B',
                        boxShadow: item.status === 'safe' ? '0 0 6px rgba(16,185,129,0.6)' : '0 0 6px rgba(245,158,11,0.6)',
                      }}
                    />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>{item.text}</span>
                    <span style={{ fontSize: '0.9rem' }}>{item.status === 'safe' ? '✅' : '⚠️'}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Card 3: AI Predictions */}
            <motion.div
              variants={fadeUp}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 18, padding: '28px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <Sparkles size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  AI Predictions for Tomorrow
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  {
                    icon: '🌧️',
                    text: 'High chance of rain — Priya\'s route may be unsafe',
                    severity: 'medium',
                  },
                  {
                    icon: '🚗',
                    text: 'Dad\'s Friday driving pattern detected — speed alert likely',
                    severity: 'high',
                  },
                  {
                    icon: '❤️',
                    text: 'Grandma\'s health score trending down — wellness check recommended',
                    severity: 'medium',
                  },
                ].map((pred, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: pred.severity === 'high' ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)',
                      border: `1px solid ${pred.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{pred.icon}</span>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {pred.text}
                    </p>
                  </motion.div>
                ))}

                <div
                  style={{
                    marginTop: 4,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(167,139,250,0.07)',
                    border: '1px solid rgba(167,139,250,0.18)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Brain size={13} style={{ color: '#A78BFA', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.76rem', color: '#A78BFA' }}>AI confidence: 91% based on 14-day pattern</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 4 — AI CHAT ASSISTANT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        style={{
          background: 'linear-gradient(160deg, #060810 0%, #0a0c1a 100%)',
          padding: '88px 0',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: 52 }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700, color: '#FFFFFF', marginBottom: 16,
              }}
            >
              Ask AI Guardian Anything
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              Natural language. Instant answers. No menus, no dashboards — just ask and know.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{
              background: '#0d0f1a',
              borderRadius: 20,
              border: '1px solid rgba(167,139,250,0.2)',
              overflow: 'hidden',
              boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 80px rgba(167,139,250,0.04)',
            }}
          >
            {/* Chat header */}
            <div
              style={{
                background: 'rgba(167,139,250,0.08)',
                borderBottom: '1px solid rgba(167,139,250,0.15)',
                padding: '16px 22px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 10px rgba(167,139,250,0.3)', '0 0 24px rgba(167,139,250,0.6)', '0 0 10px rgba(167,139,250,0.3)'] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A78BFA, #EC4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Brain size={17} style={{ color: '#fff' }} />
              </motion.div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.94rem' }}>AI Guardian</div>
                <div style={{ color: '#10B981', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}
                  />
                  Active — monitoring your family
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600 }}>Powered by Gravity AI</span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <ChatBubble role="user" text="Where is my child right now?" delay={0} />
              <ChatBubble role="ai" text="Priya is at St. Mary's School, Mumbai — arrived 8:42 AM. Currently in the main building. All safe. ✅" delay={0.1} />

              <ChatBubble role="user" text="Is grandma safe today?" delay={0.2} />
              <ChatBubble role="ai" text="Grandma walked her morning route at 7:15 AM — 1.8km, 24 minutes. Heart rate normal (smartwatch). She's home now. ✅" delay={0.3} />

              <ChatBubble role="user" text="Any unusual behavior today?" delay={0.4} />
              <ChatBubble role="ai" text="⚠️ I noticed Mom visited an unfamiliar location (Dharavi Market) for 2+ hours this afternoon. She's safe, but this deviates from her usual Tuesday pattern." delay={0.5} />

              <ChatBubble role="user" text="Emergency recommendations" delay={0.6} />
              <ChatBubble role="ai" text="Based on current patterns: ① Dad should rest — driving stress detected. ② Priya's route tomorrow has construction — suggest alternate path." delay={0.7} />

              {/* Typing indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #A78BFA, #EC4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: '#fff',
                  }}
                >
                  <Brain size={12} />
                </div>
                <div
                  style={{
                    padding: '10px 16px', borderRadius: '12px 12px 12px 4px',
                    background: 'rgba(167,139,250,0.1)',
                    border: '1px solid rgba(167,139,250,0.2)',
                    display: 'flex', gap: 5, alignItems: 'center',
                  }}
                >
                  {[0, 0.2, 0.4].map((d) => (
                    <motion.div
                      key={d}
                      animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div
              style={{
                borderTop: '1px solid rgba(167,139,250,0.15)',
                padding: '14px 22px',
                display: 'flex', gap: 10, alignItems: 'center',
              }}
            >
              <div
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(167,139,250,0.2)',
                  borderRadius: 12, padding: '11px 16px',
                  color: 'rgba(255,255,255,0.28)', fontSize: '0.86rem',
                }}
              >
                Ask AI Guardian anything...
              </div>
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--gold), #B8860B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Send size={15} style={{ color: '#0a0900' }} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 5 — AI VOICE ASSISTANT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Section bg="var(--bg-surface2)">
        <motion.div variants={stagger} style={{ textAlign: 'center' }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
              }}
            >
              Voice Commands. Instant Answers.
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
              Hands full? Just speak. AI Guardian listens and responds with full family context.
            </p>
          </motion.div>

          {/* Mic button */}
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Pulsing rings */}
              {[1, 1.5, 2].map((scale, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, scale + 0.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    width: 88, height: 88,
                    borderRadius: '50%',
                    background: 'rgba(212,168,83,0.15)',
                    border: '1px solid rgba(212,168,83,0.25)',
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
                <Mic size={30} style={{ color: '#0a0900' }} />
              </motion.button>
            </div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 28, fontStyle: 'italic' }}
          >
            Say: &quot;Hey Gravity, where is everyone?&quot;
          </motion.p>

          {/* Voice command chips */}
          <motion.div
            variants={fadeUp}
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}
          >
            {['Where is Priya?', 'Is everyone home?', 'Any emergencies?'].map((cmd) => (
              <motion.div
                key={cmd}
                whileHover={{ y: -2 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(212,168,83,0.08)',
                  border: '1px solid rgba(212,168,83,0.25)',
                  borderRadius: 999, padding: '9px 20px',
                  color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600, cursor: 'default',
                }}
              >
                <Mic size={12} />
                &quot;{cmd}&quot;
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}
          >
            {[
              { label: 'iOS', icon: '🍎' },
              { label: 'Android', icon: '🤖' },
            ].map((platform) => (
              <div
                key={platform.label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 10, padding: '8px 18px',
                  color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                <span>{platform.icon}</span>
                Available on {platform.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 6 — CTA
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
            background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, rgba(139,92,246,0.04) 40%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Rotating brain icon */}
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
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: '#FFFFFF', marginBottom: 16,
            }}
          >
            Start Your AI-Protected Family Journey
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 44, lineHeight: 1.75, fontSize: '1.02rem' }}
          >
            14-day free trial &bull; No credit card required &bull; Cancel anytime
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}
          >
            <Link
              href="/pricing"
              style={{
                background: 'linear-gradient(90deg, var(--gold), #B8860B)',
                color: '#0a0900',
                padding: '15px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 32px rgba(212,168,83,0.35)',
              }}
            >
              <Download size={18} />
              Download App
            </Link>
            <Link
              href="/contact"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                padding: '15px 36px',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.05rem',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <Calendar size={18} />
              Book Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {['94% prediction accuracy', 'Trusted by 50,000+ families', 'End-to-end encrypted'].map((trust) => (
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
