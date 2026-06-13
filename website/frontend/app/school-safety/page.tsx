'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Shield,
  Bus,
  Bell,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  Smartphone,
  QrCode,
  ChevronRight,
  Building2,
  BarChart3,
  Zap,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

/* ── Animation variants ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

/* ── Feature module cards ──────────────────────────────────────────────────── */
const MODULES = [
  {
    icon: <Bus size={28} />,
    emoji: '🚌',
    title: 'Smart Bus Tracking',
    color: '#F59E0B',
    items: [
      'Live GPS on every school bus',
      'Parents notified: "Bus is 5 stops away"',
      'Driver ID + route info visible',
      'ETA countdown on parent phone',
    ],
  },
  {
    icon: <CheckCircle size={28} />,
    emoji: '✅',
    title: 'School Attendance AI',
    color: '#10B981',
    items: [
      'Automatic arrival detection at geofence',
      'Late arrival alert to parents instantly',
      'Absence notification within 10 minutes',
      'Integration with school admin systems',
    ],
  },
  {
    icon: <QrCode size={28} />,
    emoji: '🛡️',
    title: 'Pickup Verification',
    color: '#3B82F6',
    items: [
      'QR code pickup system for each child',
      'Only authorized contacts can pick up',
      'Photo confirmation sent to parents',
      'Unknown person alert → instant SOS',
    ],
  },
  {
    icon: <Bell size={28} />,
    emoji: '📱',
    title: 'Parent Instant Alerts',
    color: '#8B5CF6',
    items: [
      'Arrived at school ✅',
      'Left school ✅',
      'Missed bus ⚠️',
      'Unusual activity ⚠️',
    ],
  },
]

/* ── Timeline events ──────────────────────────────────────────────────────── */
const TIMELINE = [
  { time: '7:00 AM', label: 'Left home', icon: '🏠', status: 'done' },
  { time: '7:35 AM', label: 'Bus picked up', icon: '🚌', status: 'done' },
  { time: '8:15 AM', label: 'Arrived school', icon: '🏫', status: 'safe' },
  { time: '12:30 PM', label: 'Lunch break', icon: '🍱', status: 'safe' },
  { time: '3:30 PM', label: 'School ends', icon: '🔔', status: 'done' },
  { time: '4:10 PM', label: 'Home safe', icon: '✅', status: 'safe' },
]

/* ── How it works steps ────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    icon: <MapPin size={22} />,
    color: '#3B82F6',
    title: 'Set School Geofence',
    desc: 'Draw the school boundary in the app. Gravity monitors entry and exit automatically every school day.',
  },
  {
    num: '02',
    icon: <Bus size={22} />,
    color: '#F59E0B',
    title: 'Enable Bus Tracking',
    desc: 'Link your child to their school bus route. Get live ETAs and boarding/alighting notifications.',
  },
  {
    num: '03',
    icon: <Bell size={22} />,
    color: '#10B981',
    title: 'Get Smart Alerts',
    desc: 'Receive instant notifications at every step — arrival, departure, pickup, and anything unusual.',
  },
]

/* ── Stats ────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '2,400+', label: 'Schools using Gravity' },
  { value: '98%', label: 'Pickup verification accuracy' },
  { value: '30s', label: 'Alert delivery time' },
  { value: '99.8%', label: 'GPS accuracy' },
]

/* ── Enterprise features ──────────────────────────────────────────────────── */
const ENTERPRISE = [
  { icon: <BarChart3 size={20} />, text: 'Multi-student dashboard' },
  { icon: <Users size={20} />, text: 'Teacher & staff tracking' },
  { icon: <Shield size={20} />, text: 'Emergency evacuation mode' },
  { icon: <Zap size={20} />, text: 'Admin reporting panel' },
]

/* ── Section wrapper ──────────────────────────────────────────────────────── */
function Section({ children, bg = 'var(--bg)' }: { children: React.ReactNode; bg?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      style={{ background: bg, padding: '80px 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
    </motion.section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function SchoolSafetyPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 45%, #0a2010 100%)',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '100px 24px 80px',
        }}
      >
        {/* Background decorative SVG — bus + building silhouettes */}
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', opacity: 0.04, pointerEvents: 'none' }}
          viewBox="0 0 1200 200"
          preserveAspectRatio="xMidYMax slice"
        >
          {/* School building silhouette */}
          <rect x="80" y="60" width="160" height="140" fill="white" />
          <rect x="110" y="30" width="100" height="40" fill="white" />
          <rect x="130" y="10" width="10" height="30" fill="white" />
          <rect x="100" y="100" width="40" height="60" fill="#0a1628" />
          <rect x="160" y="100" width="40" height="60" fill="#0a1628" />
          {/* Bus */}
          <rect x="400" y="110" width="160" height="70" rx="8" fill="white" />
          <rect x="400" y="90" width="160" height="30" rx="4" fill="white" />
          <circle cx="430" cy="185" r="16" fill="white" />
          <circle cx="540" cy="185" r="16" fill="white" />
          {/* Another building */}
          <rect x="700" y="40" width="200" height="160" fill="white" />
          <rect x="730" y="20" width="30" height="30" fill="white" />
          <rect x="900" y="80" width="150" height="120" fill="white" />
        </svg>

        {/* Radial glows */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          animate={{ y: [0, -14, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '10%', right: '6%',
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
            filter: 'blur(30px)', pointerEvents: 'none',
          }}
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', bottom: '12%', left: '5%',
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
            filter: 'blur(28px)', pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 32, textAlign: 'left' }}
          >
            <Link href="/" style={{
              color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
              fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              ← Back to Gravity Home
            </Link>
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Building2 size={42} style={{ color: '#60A5FA' }} />
            </motion.div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}
          >
            <span style={{
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#60A5FA', borderRadius: 999, padding: '6px 18px',
              fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              School Safety
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
            School-to-Home Safety
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{
              color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: 620, margin: '0 auto 44px', lineHeight: 1.75,
            }}
          >
            Track every step of your child's school journey — from morning pickup to safe arrival home. Real-time alerts. Zero anxiety.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}
          >
            <Link href="/" style={{
              background: 'linear-gradient(90deg, #3B82F6, #2563EB)',
              color: '#fff', padding: '14px 32px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(59,130,246,0.35)',
            }}>
              Get School Safety <ChevronRight size={18} />
            </Link>
            <a href="#how-it-works" style={{
              background: 'transparent', color: '#fff', padding: '14px 32px',
              borderRadius: 12, textDecoration: 'none', fontWeight: 600,
              fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              See Live Demo
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {[
              { icon: <Bus size={15} />, label: 'Bus Tracking' },
              { icon: <CheckCircle size={15} />, label: 'Attendance AI' },
              { icon: <QrCode size={15} />, label: 'Pickup Verification' },
              { icon: <Shield size={15} />, label: 'SOS Alerts' },
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

      {/* ── SCHOOL SAFETY MODULES ─────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              School Safety Modules
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.75 }}>
              Four intelligent modules that work together to give parents complete peace of mind — from the moment the school bus leaves your street to the moment your child steps back through your front door.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {MODULES.map((mod) => (
              <motion.div
                key={mod.title}
                variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                style={{
                  background: 'var(--bg)',
                  border: `1px solid ${mod.color}30`,
                  borderTop: `3px solid ${mod.color}`,
                  borderRadius: 16,
                  padding: '28px 24px',
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: `${mod.color}18`,
                  border: `1px solid ${mod.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: mod.color, marginBottom: 18, fontSize: '1.4rem',
                }}>
                  {mod.emoji}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: 16, fontSize: '1.1rem',
                }}>
                  {mod.title}
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mod.items.map((item) => (
                    <li key={item} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5,
                    }}>
                      <span style={{ color: mod.color, flexShrink: 0, marginTop: 2 }}>
                        <CheckCircle size={14} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── SCHOOL DAY TIMELINE ───────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              A Typical School Day with Gravity
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Every checkpoint, automatically tracked. Every milestone, instantly notified. You know where your child is at every moment of the school day — without a single phone call.
            </p>
          </motion.div>

          {/* Desktop timeline */}
          <motion.div variants={fadeUp} style={{ position: 'relative', overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              gap: 0, minWidth: 700, position: 'relative',
            }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute', top: 28, left: 28,
                right: 28, height: 2,
                background: 'linear-gradient(90deg, #3B82F6, #10B981, #3B82F6)',
                opacity: 0.3, zIndex: 0,
              }} />

              {TIMELINE.map((event, i) => (
                <motion.div
                  key={event.time}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', position: 'relative', zIndex: 1,
                  }}
                >
                  {/* Node */}
                  <motion.div
                    animate={event.status === 'safe'
                      ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(16,185,129,0)', '0 0 0 8px rgba(16,185,129,0.15)', '0 0 0 0 rgba(16,185,129,0)'] }
                      : {}}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                    style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: event.status === 'safe' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.12)',
                      border: event.status === 'safe' ? '2px solid rgba(16,185,129,0.5)' : '2px solid rgba(59,130,246,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem', marginBottom: 14,
                    }}
                  >
                    {event.icon}
                  </motion.div>
                  <div style={{
                    fontSize: '0.78rem', fontWeight: 700,
                    color: event.status === 'safe' ? '#10B981' : '#60A5FA',
                    marginBottom: 4,
                  }}>
                    {event.time}
                  </div>
                  <div style={{
                    fontSize: '0.82rem', color: 'var(--text-secondary)',
                    textAlign: 'center', lineHeight: 1.4, maxWidth: 90,
                  }}>
                    {event.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger} id="how-it-works">
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16,
            }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Three steps to complete school-day coverage. Setup takes under 10 minutes and then runs silently in the background every single school day.
            </p>
          </motion.div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28,
          }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                style={{ textAlign: 'center' }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 120 }}
                  viewport={{ once: true }}
                  style={{
                    width: 76, height: 76, borderRadius: '50%',
                    background: `${step.color}18`,
                    border: `2px solid ${step.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.color, margin: '0 auto 20px', position: 'relative',
                  }}
                >
                  {step.icon}
                  <div style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 28, height: 28, borderRadius: '50%',
                    background: step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, color: '#fff',
                  }}>
                    {i + 1}
                  </div>
                </motion.div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: 10,
                }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, fontSize: '0.9rem', margin: 0 }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12,
            }}>
              Trusted by Schools Across India
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24,
            }}
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16, padding: '32px 24px',
                  textAlign: 'center',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                  viewport={{ once: true }}
                  style={{
                    fontFamily: 'var(--font-display)', fontSize: '2.6rem',
                    fontWeight: 800, color: '#3B82F6', marginBottom: 8,
                  }}
                >
                  {stat.value}
                </motion.div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── FOR SCHOOLS / ENTERPRISE ───────────────────────────────────────── */}
      <Section bg="var(--bg-surface)">
        <motion.div variants={stagger}>
          <motion.div
            variants={fadeUp}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 56, alignItems: 'center',
            }}
          >
            <div>
              <span style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10B981', borderRadius: 999, padding: '5px 14px',
                fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'inline-block', marginBottom: 20,
              }}>
                Enterprise
              </span>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.2,
              }}>
                Gravity School Edition
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 28 }}>
                Designed for institutional use — give your school administration complete oversight, emergency tools, and parent communication in one unified platform.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                {ENTERPRISE.map((item) => (
                  <div key={item.text} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '14px 18px',
                  }}>
                    <span style={{ color: '#10B981' }}>{item.icon}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/" style={{
                background: 'linear-gradient(90deg, #10B981, #059669)',
                color: '#fff', padding: '14px 28px', borderRadius: 12,
                textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 24px rgba(16,185,129,0.3)',
              }}>
                Contact School Sales <ChevronRight size={17} />
              </Link>
            </div>

            {/* Visual */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '28px', width: '100%', maxWidth: 360,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#60A5FA',
                  }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>DPS North Campus</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>1,240 students monitored</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', borderRadius: 999, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}>Live</span>
                  </div>
                </div>

                {[
                  { label: 'Arrived at school', count: '1,198', color: '#10B981' },
                  { label: 'In transit (bus)', count: '34', color: '#F59E0B' },
                  { label: 'Absent today', count: '8', color: '#EF4444' },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: row.color, fontSize: '1.05rem' }}>{row.count}</span>
                  </div>
                ))}

                <div style={{
                  marginTop: 20, padding: '12px 16px',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    Evacuation drill — 3:30 PM today
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── TESTIMONIAL ───────────────────────────────────────────────────── */}
      <Section bg="var(--bg)">
        <motion.div variants={fadeUp}>
          <div style={{
            maxWidth: 780, margin: '0 auto', textAlign: 'center',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderTop: '3px solid #3B82F6', borderRadius: 20,
            padding: '48px 40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={18} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
              ))}
            </div>
            <div style={{ color: '#3B82F6', fontSize: '3rem', lineHeight: 1, marginBottom: 16, fontFamily: 'Georgia, serif' }}>
              &ldquo;
            </div>
            <p style={{
              color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              lineHeight: 1.8, fontStyle: 'italic', marginBottom: 28,
            }}>
              With Gravity, our school reduced late pickup incidents by 78%. Parents love the real-time notifications — and our admin team can finally focus on education instead of fielding "where is my child?" calls all day.
            </p>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                Dr. Anita Sharma
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                Principal, DPS Delhi
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #062a20 100%)',
        padding: '96px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <Shield size={32} style={{ color: '#60A5FA' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 700, color: '#FFFFFF', marginBottom: 16,
          }}>
            Start Protecting Your Child's School Journey
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Join thousands of Indian parents and schools who rely on Gravity for complete school-to-home safety coverage. Free to start, no credit card required.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link href="/" style={{
              background: 'linear-gradient(90deg, #3B82F6, #2563EB)',
              color: '#fff', padding: '15px 36px', borderRadius: 12,
              textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 28px rgba(59,130,246,0.35)',
            }}>
              Get School Safety <ChevronRight size={18} />
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
            ← Back to Gravity Home
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
