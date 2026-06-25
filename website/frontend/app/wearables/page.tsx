'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Shield,
  Heart,
  Bell,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Activity,
  Watch,
  Zap,
  Users,
  Moon,
  Footprints,
  Wind,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Variants ─────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

/* ── Supported devices ────────────────────────────────────────────────────── */
const DEVICES = [
  {
    brand: 'Apple Watch',
    color: '#A0AEC0',
    accent: '#1D1D1F',
    bgColor: '#1a1a2e',
    features: ['Live Location', 'SOS Alert', 'Fall Detection', 'Heart Rate', 'Emergency Call'],
    icon: '⌚',
    series: 'Series 4+',
  },
  {
    brand: 'Samsung Galaxy Watch',
    color: '#1428A0',
    accent: '#4FC3F7',
    bgColor: '#0d1a2e',
    features: ['Live GPS', 'Health Sync', 'SOS Alert', 'Fitness Tracking', 'Sleep Monitor'],
    icon: '🔵',
    series: 'Watch 4+',
  },
  {
    brand: 'Fitbit',
    color: '#00B0B9',
    accent: '#00B0B9',
    bgColor: '#0a1f20',
    features: ['Sleep Monitoring', 'Heart Rate', 'Step Count', 'Wellness Score', 'Stress Tracking'],
    icon: '💚',
    series: 'Versa & Sense',
  },
  {
    brand: 'Garmin',
    color: '#007CC3',
    accent: '#007CC3',
    bgColor: '#0a1520',
    features: ['GPS Tracking', 'Health Data', 'Adventure Mode', 'Emergency Beacon', 'Route Mapping'],
    icon: '🧭',
    series: 'Fenix / Forerunner',
  },
  {
    brand: 'Wear OS',
    color: '#4285F4',
    accent: '#4285F4',
    bgColor: '#0d1528',
    features: ['Universal GPS', 'Custom SOS', 'Notification Mirror', 'Health Sync', 'Voice Alerts'],
    icon: '⚙️',
    series: 'All Android',
  },
]

/* ── Health metrics ───────────────────────────────────────────────────────── */
const HEALTH_METRICS = [
  { label: 'Heart Rate', value: '72 bpm', status: 'ok', color: '#10B981', icon: <Heart size={16} />, bar: 72 },
  { label: 'Sleep', value: '7.2 hrs', status: 'ok', color: '#3B82F6', icon: <Moon size={16} />, bar: 85 },
  { label: 'Steps', value: '4,200', status: 'warn', color: '#F59E0B', icon: <Footprints size={16} />, bar: 42 },
  { label: 'O2 Saturation', value: '98%', status: 'ok', color: '#8B5CF6', icon: <Wind size={16} />, bar: 98 },
]

/* ── Setup steps ──────────────────────────────────────────────────────────── */
const SETUP_STEPS = [
  { num: 1, label: 'Download KVL Track App' },
  { num: 2, label: 'Open Wearables → Connect Device' },
  { num: 3, label: 'Authorize health data access' },
  { num: 4, label: 'Set emergency contacts' },
  { num: 5, label: 'Enable fall detection & SOS' },
]

/* ── Elder care features ──────────────────────────────────────────────────── */
const ELDER_FEATURES = [
  { icon: <Activity size={18} />, text: 'Daily wellness reports sent to family' },
  { icon: <Bell size={18} />, text: 'Medication reminders via watch' },
  { icon: <Footprints size={18} />, text: 'Walk tracking with distance goals' },
  { icon: <Users size={18} />, text: 'One-touch family contact from wrist' },
]

/* ── Section wrapper ──────────────────────────────────────────────────────── */
function Section({ children, bg = 'var(--bg)' }: { children: React.ReactNode; bg?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      style={{ background: bg, padding: '80px 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
    </motion.section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function WearablesPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1535 45%, #120a2e 100%)',
          minHeight: '90vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', padding: '100px 24px 80px',
        }}
      >
        {/* Animated watch constellation */}
        {[
          { top: '20%', left: '10%', delay: 0, size: 44, color: 'rgba(160,174,192,0.12)' },
          { top: '65%', left: '6%', delay: 1.2, size: 38, color: 'rgba(20,40,160,0.15)' },
          { top: '15%', right: '8%', delay: 0.7, size: 48, color: 'rgba(0,176,185,0.12)' },
          { top: '60%', right: '7%', delay: 1.8, size: 40, color: 'rgba(0,124,195,0.12)' },
          { top: '40%', right: '18%', delay: 0.4, size: 36, color: 'rgba(66,133,244,0.12)' },
        ].map((orb, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
            style={{
              position: 'absolute', ...orb,
              width: orb.size * 2.5, height: orb.size * 2.5,
              borderRadius: '30%',
              background: orb.color,
              border: `1px solid ${orb.color.replace('0.12', '0.3').replace('0.15', '0.3')}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', filter: 'blur(1px)',
              pointerEvents: 'none',
            }}
          >
            <Watch size={orb.size * 0.5} style={{ opacity: 0.4, color: 'white' }} />
          </motion.div>
        ))}

        {/* Central glow */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, rgba(59,130,246,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }} style={{ marginBottom: 32, textAlign: 'left' }}
          >
            <Link href="/" style={{
              color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
              fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              ← Back to KVL Track Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
          >
            <motion.div
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Watch size={42} style={{ color: '#A78BFA' }} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}
          >
            <span style={{
              background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#A78BFA', borderRadius: 999, padding: '6px 18px',
              fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Wearable Ecosystem
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 4rem)',
              fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 24,
            }}
          >
            Safety on Your Wrist
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: 620, margin: '0 auto 44px', lineHeight: 1.75,
            }}
          >
            Connect every wearable device to KVL Track's safety ecosystem for 360° family protection. From Apple Watch to Garmin — one app, every wrist.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}
          >
            <Link href="/" style={{
              background: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
              color: '#fff', padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(139,92,246,0.35)',
            }}>
              Connect Your Wearables <ChevronRight size={18} />
            </Link>
            <a href="#devices" style={{
              background: 'transparent', color: '#fff', padding: '14px 32px',
              borderRadius: 12, textDecoration: 'none', fontWeight: 600,
              fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              See Supported Devices
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              { icon: <Shield size={15} />, label: 'Fall Detection' },
              { icon: <Heart size={15} />, label: 'Health Monitoring' },
              { icon: <Zap size={15} />, label: 'Wrist SOS' },
              { icon: <Activity size={15} />, label: '5 Platforms' },
            ].map((b) => (
              <div key={b.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999, padding: '7px 16px',
                color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 500,
              }}>
                {b.icon} {b.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SUPPORTED DEVICES ─────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger} id="devices">
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Works With Every Major Wearable
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75 }}>
              Whatever device your family wears, KVL Track connects to it. One unified safety platform — five device ecosystems, all speaking the same language.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20,
            }}
          >
            {DEVICES.map((device) => (
              <motion.div
                key={device.brand}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 16, padding: '24px 20px',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Connected badge */}
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 999, padding: '3px 10px',
                  fontSize: '0.72rem', fontWeight: 700, color: '#10B981',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Connected
                </div>

                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{device.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 4,
                }}>
                  {device.brand}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 14 }}>
                  {device.series}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {device.features.map((feat) => (
                    <li key={feat} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: 'var(--text-secondary)', fontSize: '0.82rem',
                    }}>
                      <CheckCircle size={12} style={{ color: '#10B981', flexShrink: 0 }} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── WEARABLE FEATURES ─────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Wearable Safety Features
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
              Three powerful capabilities that turn any smartwatch into a life-saving safety device for your most vulnerable family members.
            </p>
          </motion.div>

          {/* Feature 1 — Fall Detection */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 48, alignItems: 'center', marginBottom: 72,
            }}
          >
            <div>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#EF4444', marginBottom: 20,
              }}>
                <Zap size={24} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
              }}>
                Fall Detection &amp; Auto-SOS
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 20 }}>
                If your elderly parent falls and doesn't respond within 30 seconds, KVL Track automatically contacts emergency services with their exact location. No buttons to press. No panic. Just immediate help.
              </p>
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <Watch size={18} style={{ color: '#8B5CF6', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Works on: Apple Watch Series 4+, Samsung Watch 4+
                </span>
              </div>
            </div>

            {/* Fall detection UI mockup */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '28px', maxWidth: 340, margin: '0 auto',
              }}
            >
              <div style={{
                padding: '16px', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <AlertCircle size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#EF4444', fontSize: '0.9rem' }}>Fall Detected</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Grandma — 3:42 PM</div>
                </div>
              </div>

              {/* Countdown */}
              <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: 16 }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{
                    fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 800,
                    color: '#EF4444', lineHeight: 1,
                  }}
                >
                  22
                </motion.div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>
                  SOS in 22 seconds...
                </div>
              </div>

              {[
                { step: '1', text: 'Fall event detected', done: true },
                { step: '2', text: 'Alerting 3 contacts', done: true },
                { step: '3', text: 'Emergency services ready', done: false },
              ].map((s) => (
                <div key={s.step} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: s.done ? '#10B981' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {s.done
                      ? <CheckCircle size={14} style={{ color: '#fff' }} />
                      : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
                    }
                  </div>
                  <span style={{ color: s.done ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {s.text}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Feature 2 — Health Dashboard */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 48, alignItems: 'center', marginBottom: 72,
            }}
          >
            {/* Health UI mockup */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '28px', maxWidth: 340, margin: '0 auto',
                order: 1,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(16,185,129,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#10B981',
                }}>
                  <Heart size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Grandma's Health</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Today's overview</div>
                </div>
              </div>

              {HEALTH_METRICS.map((metric) => (
                <div key={metric.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      <span style={{ color: metric.color }}>{metric.icon}</span>
                      {metric.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{metric.value}</span>
                      {metric.status === 'ok'
                        ? <CheckCircle size={13} style={{ color: '#10B981' }} />
                        : <AlertCircle size={13} style={{ color: '#F59E0B' }} />
                      }
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metric.bar}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      viewport={{ once: true }}
                      style={{ height: '100%', borderRadius: 3, background: metric.color }}
                    />
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: 16, padding: '12px 14px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 10,
              }}>
                <div style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.82rem', marginBottom: 4 }}>
                  AI Insight
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Grandma's activity is 40% below her weekly average. Consider checking in.
                </div>
              </div>
            </motion.div>

            <div style={{ order: 2 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#10B981', marginBottom: 20,
              }}>
                <Activity size={24} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
              }}>
                Health Monitoring Dashboard
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 16 }}>
                All health metrics from your family's wearables in one intelligent dashboard. AI highlights when something looks off — so you act before a situation becomes an emergency.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75 }}>
                Heart rate, sleep quality, step count, and blood oxygen — all interpreted in plain language, not just numbers.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 — Wrist SOS */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 48, alignItems: 'center',
            }}
          >
            <div>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#EF4444', marginBottom: 20,
              }}>
                <Shield size={24} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
              }}>
                Wrist SOS
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 16 }}>
                Press and hold the SOS button on your wrist for 3 seconds — KVL Track instantly alerts all family members and emergency services with your exact GPS location and a live tracking link.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75 }}>
                Designed for elderly parents, lone workers, or anyone in an unfamiliar situation. Help is one press away — no fumbling with a phone, no unlocking screens.
              </p>
            </div>

            {/* Wrist SOS mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 24, padding: '32px', textAlign: 'center', maxWidth: 280,
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 20 }}>
                  Smart Watch SOS
                </div>

                {/* Big SOS button */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(239,68,68,0)',
                      '0 0 0 16px rgba(239,68,68,0.15)',
                      '0 0 0 0 rgba(239,68,68,0)',
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', cursor: 'pointer',
                    border: '3px solid rgba(239,68,68,0.3)',
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.05em' }}>SOS</span>
                </motion.div>

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  Hold 3 seconds to alert:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  {['All family members', 'Emergency services', 'Share GPS location'].map((item) => (
                    <div key={item} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: 'var(--text-secondary)', fontSize: '0.82rem',
                    }}>
                      <CheckCircle size={13} style={{ color: '#10B981', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── SETUP STEPS ────────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Connect in 5 Minutes
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Simple setup, powerful protection. Your family's wearables will be linked to KVL Track's safety network in minutes.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {SETUP_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '18px 22px',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: i % 2 === 0 ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.12)',
                  border: i % 2 === 0 ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(59,130,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: i % 2 === 0 ? '#A78BFA' : '#60A5FA',
                  fontSize: '0.9rem', flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>
                  {step.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── ELDER CARE FOCUS ───────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{
            maxWidth: 840, margin: '0 auto',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '48px 40px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 16 }}>👴👵</div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              Perfect for Aging Parents Who Live Alone
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.75 }}>
              Give your parents independence without worry. KVL Track's wearable integrations provide gentle, unobtrusive monitoring that respects their dignity while keeping the whole family informed.
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16, marginBottom: 36,
            }}>
              {ELDER_FEATURES.map((feat) => (
                <div key={feat.text} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '14px 16px', textAlign: 'left',
                }}>
                  <span style={{ color: '#8B5CF6', flexShrink: 0 }}>{feat.icon}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.4 }}>{feat.text}</span>
                </div>
              ))}
            </div>
            <Link href="/" style={{
              background: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
              color: '#fff', padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 24px rgba(139,92,246,0.3)',
            }}>
              Connect Your Wearables — Free for 14 Days <ChevronRight size={17} />
            </Link>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #120a2e 100%)',
        padding: '96px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <Watch size={32} style={{ color: '#A78BFA' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 700, color: '#FFFFFF', marginBottom: 16,
          }}>
            Connect Your Wearables — Free for 14 Days
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Every wearable in your family connected to one safety platform. Fall detection, health monitoring, wrist SOS — all free to try for two weeks.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link href="/" style={{
              background: 'linear-gradient(90deg, #8B5CF6, #7C3AED)',
              color: '#fff', padding: '15px 36px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(139,92,246,0.35)',
            }}>
              Start Free Trial <ChevronRight size={18} />
            </Link>
            <Link href="/pricing" style={{
              background: 'transparent', color: '#fff', padding: '15px 36px',
              borderRadius: 12, textDecoration: 'none', fontWeight: 600,
              fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              View Pricing
            </Link>
          </div>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', textDecoration: 'none' }}>
            ← Back to KVL Track Home
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
