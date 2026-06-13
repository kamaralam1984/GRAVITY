'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Car, Shield, AlertTriangle, Gauge, Phone, Star, ChevronRight,
  CheckCircle, Clock, Zap, TrendingUp, Moon, MapPin, Activity,
  Bell, Brain, Target, Award,
} from 'lucide-react'
import Link from 'next/link'

/* ── Animation helpers ──────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      style={{ padding: '80px 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        {children}
      </div>
    </motion.section>
  )
}

/* ── Circular gauge ─────────────────────────────────────────────────────────── */
function RiskGauge({ score, size = 200 }: { score: number; size?: number }) {
  const radius = size * 0.4
  const circumference = 2 * Math.PI * radius
  // Risk score — lower = better. 23/100 = 23% of arc filled
  const arcFill = (score / 100) * circumference
  const cx = size / 2
  const cy = size / 2
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.07} />
        {/* Fill */}
        <motion.circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - arcFill }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 900, color: '#10B981', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: size * 0.09, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>/100</div>
        <div style={{ fontSize: size * 0.07, fontWeight: 700, color: '#10B981', letterSpacing: '0.08em', marginTop: 4 }}>SAFE</div>
      </div>
    </div>
  )
}

/* ── 7-day trend bars ───────────────────────────────────────────────────────── */
const TREND_DAYS = [
  { day: 'Mon', score: 78 },
  { day: 'Tue', score: 85 },
  { day: 'Wed', score: 80 },
  { day: 'Thu', score: 88 },
  { day: 'Fri', score: 90 },
  { day: 'Sat', score: 76 },
  { day: 'Sun', score: 92 },
]

/* ── Sub scores ─────────────────────────────────────────────────────────────── */
const SUB_SCORES = [
  { label: 'Speed', score: 95, color: '#10B981', icon: Gauge },
  { label: 'Braking', score: 88, color: '#3B82F6', icon: Activity },
  { label: 'Cornering', score: 91, color: '#8B5CF6', icon: TrendingUp },
  { label: 'Phone Use', score: 100, color: '#F59E0B', icon: Phone },
  { label: 'Fatigue', score: 97, color: '#06B6D4', icon: Moon },
]

/* ── Coach tips ─────────────────────────────────────────────────────────────── */
const COACH_TIPS = [
  {
    tip: 'Maintain 3-second following distance',
    detail: 'At highway speed, you need at least 3 seconds of gap to react safely.',
    icon: '🚗',
    color: '#3B82F6',
  },
  {
    tip: 'Avoid sudden lane changes on highways',
    detail: 'Signal at least 4 seconds before changing lanes to give others time to react.',
    icon: '🛣️',
    color: '#8B5CF6',
  },
  {
    tip: 'Reduce speed in rain by 30%',
    detail: 'Wet roads triple stopping distance. Slow down proactively, not reactively.',
    icon: '🌧️',
    color: '#06B6D4',
  },
]

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function DrivingSafetyPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })
  const [showCrashModal, setShowCrashModal] = useState(false)

  return (
    <div style={{ background: '#0B0D13', color: '#F1EDE4', minHeight: '100vh' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: 120,
          paddingBottom: 80,
          paddingLeft: 24,
          paddingRight: 24,
          background: 'linear-gradient(135deg, #0B0D13 0%, #0a1420 50%, #0B0D13 100%)',
        }}
      >
        {/* Animated road SVG background */}
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.07, pointerEvents: 'none' }}
          viewBox="0 0 1200 200" preserveAspectRatio="none"
        >
          {/* Road surface */}
          <rect x="0" y="120" width="1200" height="80" fill="#ffffff" />
          {/* Lane markings */}
          {[0, 120, 240, 360, 480, 600, 720, 840, 960, 1080].map((x) => (
            <rect key={x} x={x} y="157" width="80" height="6" fill="#0B0D13" />
          ))}
          {/* Road edges */}
          <rect x="0" y="120" width="1200" height="4" fill="#D4A853" opacity="0.6" />
          <rect x="0" y="196" width="1200" height="4" fill="#D4A853" opacity="0.6" />
        </svg>

        {/* Animated car */}
        <motion.div
          initial={{ x: '-10%', opacity: 0 }}
          animate={{ x: '110%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 1 }}
          style={{
            position: 'absolute', bottom: 36, left: 0,
            fontSize: 32, pointerEvents: 'none', zIndex: 1,
          }}
        >
          🚗
        </motion.div>

        {/* Glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 500,
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }} style={{ marginBottom: 24, textAlign: 'left' }}
          >
            <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ← Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }} style={{ marginBottom: 20 }}
          >
            <span style={{
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#60A5FA', borderRadius: 999, padding: '6px 18px',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              AI-Powered Road Protection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}
          >
            Gravity Driving Safety —{' '}
            <span style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI-Powered Road Protection
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'rgba(255,255,255,0.6)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.75 }}
          >
            Advanced AI monitors every journey — scoring driver behaviour, detecting fatigue, alerting on phone use, and triggering emergency SOS if a crash occurs. All in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}
          >
            <Link href="/pricing" style={{
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: '#fff', padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: 16,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Get Started — ₹199/month <ChevronRight size={18} />
            </Link>
            <a href="#driver-score" style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#F1EDE4', padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 600, fontSize: 16,
            }}>
              See Your Risk Score
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}
          >
            {[
              { icon: Shield, label: 'Crash Detection', color: '#EF4444' },
              { icon: Gauge, label: 'Risk Scoring', color: '#10B981' },
              { icon: Phone, label: 'Phone Detection', color: '#F59E0B' },
              { icon: Moon, label: 'Fatigue Monitor', color: '#8B5CF6' },
              { icon: Car, label: 'Teen Monitoring', color: '#3B82F6' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999, padding: '7px 16px',
                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500,
              }}>
                <Icon size={13} style={{ color }} /> {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DRIVER RISK SCORE ─────────────────────────────────────────────────── */}
      <Section id="driver-score">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Your Driver Risk Score
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            AI analyses every trip and builds your personal safety profile in real time.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, alignItems: 'start' }}>
          {/* Big gauge */}
          <motion.div
            variants={fadeUp}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24, padding: '36px 28px', textAlign: 'center',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 24 }}>
              OVERALL RISK SCORE
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <RiskGauge score={23} size={180} />
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 999, padding: '8px 20px', marginBottom: 16,
            }}>
              <CheckCircle size={15} style={{ color: '#10B981' }} />
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: 15 }}>SAFE DRIVER</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6 }}>
              Your driving is in the <strong style={{ color: '#10B981' }}>top 15%</strong> of all Gravity users
            </p>
          </motion.div>

          {/* Sub scores */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '36px 28px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 24 }}>
              SCORE BREAKDOWN
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {SUB_SCORES.map(({ label, score, color, icon: Icon }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={14} style={{ color }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color }}>{score}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${score}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      viewport={{ once: true }}
                      style={{ height: '100%', background: color, borderRadius: 3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 7-day trend */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '36px 28px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 24 }}>
              7-DAY SAFETY TREND
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, marginBottom: 12 }}>
              {TREND_DAYS.map(({ day, score }) => (
                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${score}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: score >= 90 ? '#10B981' : score >= 80 ? '#3B82F6' : '#F59E0B',
                      alignSelf: 'flex-end',
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{day}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                <span style={{ color: '#10B981', fontWeight: 700 }}>Trending up</span> — Your score improved by 9 points this week. Keep it up!
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── TEEN DRIVER MONITORING ────────────────────────────────────────────── */}
      <Section id="teen-monitoring">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Teen Driver Monitoring
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Set boundaries, not arguments. Know your teen is safe on every drive — without constant phone calls.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>
          {/* Today's Drive Card */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 22, padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: '#fff',
              }}>R</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, color: '#F1EDE4' }}>Rohan's Drive Today</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Last updated 8 min ago</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Speed Violations', value: '0', status: 'safe', icon: Gauge },
                { label: 'Harsh Brakes', value: '2', status: 'warn', icon: Activity },
                { label: 'Phone Usage', value: '0 minutes', status: 'safe', icon: Phone },
                { label: 'Night Driving', value: '0', status: 'safe', icon: Moon },
                { label: 'Distance Today', value: '24.5 km', status: 'info', icon: MapPin },
              ].map(({ label, value, status, icon: Icon }) => {
                const color = status === 'safe' ? '#10B981' : status === 'warn' ? '#F59E0B' : '#60A5FA'
                return (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10,
                    background: `${color}09`, border: `1px solid ${color}22`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={14} style={{ color }} />
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
                      {status === 'safe' && <CheckCircle size={13} style={{ color: '#10B981' }} />}
                      {status === 'warn' && <AlertTriangle size={13} style={{ color: '#F59E0B' }} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Settings Card */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 22, padding: '28px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 22 }}>
              DRIVING RULES FOR ROHAN
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  icon: Moon, label: 'Curfew', value: 'No driving after 10 PM',
                  color: '#8B5CF6', status: 'Active',
                },
                {
                  icon: Gauge, label: 'Speed Limit Alert', value: 'Alert at 80 km/h',
                  color: '#F59E0B', status: 'Active',
                },
                {
                  icon: MapPin, label: 'Geofence Zone', value: 'Only within Delhi NCR',
                  color: '#3B82F6', status: 'Active',
                },
                {
                  icon: Phone, label: 'Phone Use', value: 'Zero tolerance while driving',
                  color: '#EF4444', status: 'Active',
                },
              ].map(({ icon: Icon, label, value, color, status }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: `${color}15`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{value}</p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color,
                    background: `${color}15`, borderRadius: 999, padding: '3px 10px',
                  }}>{status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── FATIGUE DETECTION ─────────────────────────────────────────────────── */}
      <Section id="fatigue">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          {/* Fatigue */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 22, padding: '32px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Moon size={22} style={{ color: '#A78BFA' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, color: '#F1EDE4' }}>Fatigue Detection</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>ACTIVE — Monitoring</span>
                </div>
              </div>
            </div>
            {[
              { label: 'Drowsiness Detector', value: 'ACTIVE', color: '#10B981' },
              { label: 'Last Alert', value: 'None today', color: '#10B981' },
              { label: 'Continuous Drive Limit', value: '2 hours', color: '#F59E0B' },
              { label: 'Current Session', value: '0h 48m', color: '#60A5FA' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
            <div style={{
              marginTop: 18, padding: '14px', borderRadius: 10,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>Recommendation:</span> Taking a break is recommended after 2 hours of continuous driving.
              </p>
            </div>
          </motion.div>

          {/* Phone Use Detection */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 22, padding: '32px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Phone size={22} style={{ color: '#FCD34D' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, color: '#F1EDE4' }}>Phone Use Detection</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Real-time AI monitoring</p>
              </div>
            </div>

            <div style={{
              textAlign: 'center', padding: '28px 20px', marginBottom: 20,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 14,
            }}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 44, fontWeight: 900, color: '#10B981', marginBottom: 6 }}
              >
                0
              </motion.div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Phone pickups in last 30 days</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 999, padding: '5px 14px', marginTop: 10,
              }}>
                <CheckCircle size={12} style={{ color: '#10B981' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>PERFECT RECORD</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Auto-detects phone pickup while moving',
                'Alerts family immediately on detection',
                'Blocks distracting apps while driving',
                'Builds monthly safety reports',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── AI DRIVING COACH ──────────────────────────────────────────────────── */}
      <Section id="ai-coach">
        <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
            AI Driving Coach
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Weekly personalised coaching tips powered by AI analysis of your actual driving data.
          </p>
        </motion.div>

        {/* Coaching grade */}
        <motion.div variants={fadeUp} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 32, flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 8 }}>CURRENT GRADE</p>
            <div style={{ fontSize: 56, fontWeight: 900, color: '#3B82F6', lineHeight: 1 }}>B+</div>
          </div>
          <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Target size={24} style={{ color: '#D4A853' }} />
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 4 }}>TARGET GRADE</p>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#D4A853' }}>A</div>
            </div>
          </div>
          <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 8 }}>ESTIMATED TIME</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>~3 weeks at current pace</p>
          </div>
        </motion.div>

        {/* Tip cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {COACH_TIPS.map(({ tip, detail, icon, color }, i) => (
            <motion.div
              key={tip}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25`,
                borderTop: `3px solid ${color}`, borderRadius: 16, padding: '24px',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
              <div style={{
                display: 'inline-block', background: `${color}15`, border: `1px solid ${color}30`,
                borderRadius: 999, padding: '3px 10px', marginBottom: 12,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.06em' }}>WEEK {i + 1} TIP</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#F1EDE4', marginBottom: 10, lineHeight: 1.4 }}>
                Tip: {tip}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{detail}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── CRASH DETECTION ───────────────────────────────────────────────────── */}
      <Section id="crash-detection">
        <motion.div variants={fadeUp} style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 24, padding: '40px 36px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 36,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Shield size={24} style={{ color: '#EF4444' }} />
              </motion.div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#F1EDE4' }}>Emergency Crash Detection</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>ARMED AND MONITORING</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Detection Method', value: '3-axis accelerometer + AI', color: '#60A5FA' },
                { label: 'Response Time', value: '30 seconds post-impact', color: '#F59E0B' },
                { label: 'Alert Recipients', value: 'All emergency contacts', color: '#10B981' },
                { label: 'False Alarm Rate', value: '< 0.1%', color: '#10B981' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                <span style={{ color: '#EF4444', fontWeight: 700 }}>Auto-Alert:</span> If a crash is detected, emergency contacts are alerted in 30 seconds with your live location and a 10-second audio clip.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
            <div style={{
              padding: '24px', borderRadius: 16,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', marginBottom: 12 }}>ACCIDENT HISTORY</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#10B981' }}>0</span>
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>Zero Accidents</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Since joining Gravity</p>
                </div>
                <Shield size={20} style={{ color: '#10B981', marginLeft: 'auto' }} />
              </div>
            </div>

            <button
              onClick={() => setShowCrashModal(true)}
              style={{
                padding: '14px 24px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#EF4444', fontWeight: 700, fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Bell size={16} /> Test Crash Detection
            </button>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.5 }}>
              Run a simulated test. Your contacts will be notified this is a drill.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'linear-gradient(135deg, #0a1020, #0d1830, #0a1020)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Car size={32} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Enable Advanced Driving Safety
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, marginBottom: 12, lineHeight: 1.7 }}>
            Full AI risk scoring, teen monitoring, fatigue detection, and crash SOS — all included.
          </p>
          <p style={{ color: '#D4A853', fontSize: 22, fontWeight: 800, marginBottom: 36 }}>₹199/month</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pricing" style={{
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              color: '#fff', padding: '15px 36px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: 16,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(59,130,246,0.3)',
            }}>
              Upgrade Now <ChevronRight size={18} />
            </Link>
            <Link href="/" style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#F1EDE4', padding: '15px 36px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 600, fontSize: 16,
            }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* ── Test Crash Modal ───────────────────────────────────────────────────── */}
      {showCrashModal && (
        <div
          onClick={() => setShowCrashModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#141720', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 20, padding: '36px', maxWidth: 440, width: '100%', textAlign: 'center',
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <AlertTriangle size={28} style={{ color: '#EF4444' }} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#F1EDE4', marginBottom: 14 }}>Test Crash Detection</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 28 }}>
              This will send a <strong style={{ color: '#F1EDE4' }}>DRILL alert</strong> to all your emergency contacts with a clear label that this is a test. Confirm to proceed.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowCrashModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#F1EDE4', fontWeight: 600, fontSize: 15,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCrashModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
                  color: '#EF4444', fontWeight: 700, fontSize: 15,
                }}
              >
                Send Drill
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
